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

// TODO(needs confirmation): once a sending domain is verified in Resend,
// point this at it (e.g. "GetHired <reports@gethired.sarathg.me>"). Until
// then this falls back to Resend's shared test address, which works without
// domain verification but is not suitable for real report delivery.
export const REPORT_FROM_ADDRESS = "GetHired <onboarding@resend.dev>";
