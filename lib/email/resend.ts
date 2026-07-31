import "server-only";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

export function getResendClient(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend is not configured (RESEND_API_KEY).");
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

// Configurable via RESEND_FROM_EMAIL once a sending domain is verified in
// Resend (e.g. "reports@gethired.sarathg.me"). Falls back to Resend's shared
// test address so local dev works without any domain verification.
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const REPORT_FROM_ADDRESS = `GetHired <${fromEmail}>`;
