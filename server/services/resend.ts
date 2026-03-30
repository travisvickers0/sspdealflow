/**
 * Resend Email Service
 * Sends emails via Resend API
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@sspdealflow.com";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: options.from || RESEND_FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    let detail: string;
    try {
      const error = (await response.json()) as { message?: string };
      detail = error.message || JSON.stringify(error);
    } catch {
      detail = await response.text();
    }
    throw new Error(`Resend API error (${response.status}): ${detail || response.statusText}`);
  }

  return await response.json();
}

/**
 * Send qualification confirmation email to investor
 */
export async function sendQualificationConfirmation(
  email: string,
  fullName: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to bottom, #fef3c7, #ffffff); padding: 40px 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">Thank You, ${fullName}</h1>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">Your qualification form has been received</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
            Thank you for completing the investor qualification form. We've received your information and are excited to learn more about your investment goals.
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
            <strong>Next Steps:</strong>
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
            You should have been redirected to schedule your introductory call. If you weren't, please use the link below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/sspdealflow/30min" 
               style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Schedule Your Intro Call
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
            If you have any questions before the call, feel free to reach out to us directly.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Southern Specialty Properties LLC<br>
            SSP Deal Flow
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Thank You - Investor Qualification Received",
    html,
  });
}

