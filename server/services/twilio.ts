/**
 * Twilio SMS Service
 * Sends text messages via the Twilio REST API (no SDK required)
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

export interface SendSmsOptions {
  to: string;
  body: string;
  from?: string;
}

/**
 * Returns true only when every Twilio secret needed to send is configured.
 */
export function isTwilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

/**
 * Send an SMS via Twilio. Throws if secrets are missing or the API rejects.
 */
export async function sendSms(options: SendSmsOptions): Promise<{ sid: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN environment variables are not set");
  }

  const from = options.from || TWILIO_FROM_NUMBER;
  if (!from) {
    throw new Error("TWILIO_FROM_NUMBER environment variable is not set");
  }

  const params = new URLSearchParams({
    To: options.to,
    From: from,
    Body: options.body,
  });

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!response.ok) {
    let detail: string;
    try {
      const error = (await response.json()) as { message?: string };
      detail = error.message || JSON.stringify(error);
    } catch {
      detail = await response.text();
    }
    throw new Error(`Twilio API error (${response.status}): ${detail || response.statusText}`);
  }

  return (await response.json()) as { sid: string };
}
