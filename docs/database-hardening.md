# Database and checkout hardening

The application uses NextAuth sessions and server-side Prisma, not Supabase Auth
JWTs. Application tables intentionally have RLS enabled with no client policies,
and PUBLIC, anon and authenticated have no table privileges. PostgreSQL's owner
connection continues to serve the app. Do not add auth.uid() policies for NextAuth
IDs: these are separate authentication systems. Existing public-bucket image
URLs remain downloadable.

## Release order

1. Apply `harden_application_tables` to the existing database. This is an additive
   column/index migration plus access restrictions, checks and a restrictive
   product foreign key. Existing Prisma connections as postgres remain valid.
2. Deploy this application commit, including the admin image upload endpoint.
3. Apply `restrict_storage_uploads` only after the deployment is healthy. This
   removes the anonymous upload policy after clients stop depending on it.

The migration filenames reflect Supabase's recorded remote migration versions.
These are changes to the existing schema, not a fresh-database baseline. Prisma's
schema records the added column, indexes and relation behavior; access privileges
and SQL CHECK constraints are maintained by the SQL migrations. Avoid `db push`
against production without reviewing the diff.

## Behavior

- Orders belong only to the verified NextAuth session user. Guests stay unlinked;
  a request-body email or user ID cannot select a registered account.
- Stock is reserved with a conditional SQL decrement inside the order transaction.
  A price change, exhausted stock or failed order insert rolls the transaction back.
- Quantities are validated, capped per product and aggregated across sizes; line
  items keep distinct sizes and use database prices.
- DELETE `/api/products` archives the product and keeps its images. Archived
  products cannot be purchased or updated via normal product endpoints. Their
  records remain available to historical order relations. Direct deletion of a
  referenced product is blocked by the foreign key.
- Add/edit image uploads go through `/api/admin/upload-image` and require an
  admin session. The server uses only the service role credential, with no anon
  fallback. These uploads have a 4MB limit to fit Vercel's request body limit.

## Historical order investigation (28 October 2026)

Three completed orders from 11 April (two) and 16 April (one) have no remaining
OrderItem records. They predate the current checkout service. The previous product
foreign key and DELETE endpoint both permitted cascading item deletion, so product
removal is a possible explanation, not a proven cause. The database has no deletion
audit trail from which to reconstruct the items. All three orders and totals were
preserved. Do not invent replacement line items; restore only from an independently
verified backup or original sales record.

The VerificationToken model intentionally retains the unique indexes required by
the NextAuth Prisma adapter. Its missing-primary-key advisor is informational.
New indexes may initially appear as unused; do not remove the foreign-key indexes
solely because their usage counters start at zero.

## Verification

- `npm test`: order pricing, distinct sizes, simultaneous last-unit reservation,
  transaction rollback, guest ownership and invalid quantities, plus existing tests.
- `npx tsc --noEmit`: type check.
- Rollback-only database fixtures verified conditional reservation, nonnegative
  stock enforcement, restrictive deletion and archiving without lost order items.
- All 12 application tables were checked for RLS and revoked client permissions.
- `npm run lint`: passes with project warnings (no lint errors).

For a rollback, keep database access restrictions, indexes and restrictive foreign
key. Do not drop archived products or their new column. Reverting the client upload
change requires retaining a secure upload path, not restoring anonymous uploads.
