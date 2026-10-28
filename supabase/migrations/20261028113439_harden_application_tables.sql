-- Server-only application tables: NextAuth authorizes requests, Prisma connects as
-- postgres. Supabase anon/authenticated JWTs do not represent NextAuth sessions.
-- No client policies are intentional: the Data API is denied for these tables.
SET lock_timeout = '5s';
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."User" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."Account" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."Session" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."VerificationToken" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."Product" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."Order" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."OrderItem" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."SavedCart" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."SavedCart" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."BespokeRequest" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."BespokeRequest" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."HeroCampaign" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."HeroCampaign" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."TrustBadge" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."TrustBadge" FROM PUBLIC, anon, authenticated;
ALTER TABLE public."StoreSettings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."StoreSettings" FROM PUBLIC, anon, authenticated;

-- Do not automatically expose future tables created by the application owner.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;

ALTER TABLE public."Product" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE public."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE public."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Account_userId_idx" ON public."Account"("userId");
CREATE INDEX "Session_userId_idx" ON public."Session"("userId");
CREATE INDEX "Order_userId_idx" ON public."Order"("userId");
CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem"("productId");

ALTER TABLE public."Product" ADD CONSTRAINT "Product_stock_nonnegative" CHECK (stock >= 0);
ALTER TABLE public."Product" ADD CONSTRAINT "Product_price_valid" CHECK (price >= 0 AND price < 'Infinity'::float8);
ALTER TABLE public."OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive" CHECK (quantity > 0);
ALTER TABLE public."OrderItem" ADD CONSTRAINT "OrderItem_price_valid" CHECK ("priceAtPurchase" >= 0 AND "priceAtPurchase" < 'Infinity'::float8);
ALTER TABLE public."Order" ADD CONSTRAINT "Order_total_valid" CHECK ("totalAmount" >= 0 AND "totalAmount" < 'Infinity'::float8);
