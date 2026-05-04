import { Resend } from "resend";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export const EMAIL_FROM = process.env.RESEND_FROM ?? "Hornet Imports <noreply@hornetimports.com>";
export const EMAIL_ADMIN = process.env.RESEND_ADMIN_EMAIL ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hornetimports.com";
