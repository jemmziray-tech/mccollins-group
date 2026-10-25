const DEFAULT_ADMIN_EMAILS = [
  "jem.mziray@gmail.com",
  "nyombicolins04@gmail.com",
  "festomcrowland@gmail.com",
];

export function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return envEmails && envEmails.length > 0
    ? envEmails
    : DEFAULT_ADMIN_EMAILS.map((email) => email.toLowerCase());
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
