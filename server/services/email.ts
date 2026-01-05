import { Resend } from "resend";

// Lazy initialization - only create Resend instance when needed and API key is present
let resendInstance: Resend | null = null;

function getResendInstance(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface SendConfirmationEmailParams {
  to: string;
  name: string;
  calendlyLink: string;
}

export async function sendConfirmationEmail({
  to,
  name,
  calendlyLink,
}: SendConfirmationEmailParams): Promise<void> {
  const resend = getResendInstance();
  
  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SSP Deal Flow <noreply@sspdealflow.com>",
      to,
      subject: "SSP Partnership Overview & Next Steps",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
                Thank you, ${name}
              </h1>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
                Thank you for your interest in SSP's first-position joint venture partnerships. We've received your qualification form and are ready to schedule your 30-minute intro call.
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">
                  Next Steps
                </h2>
                <ol style="color: #4b5563; font-size: 16px; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 8px;">Schedule your 30-minute intro call using the link below</li>
                  <li style="margin-bottom: 8px;">Review the Partnership Overview document (attached)</li>
                  <li style="margin-bottom: 8px;">During the call, we'll walk through the structure and answer any questions</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${calendlyLink}" 
                   style="display: inline-block; background-color: #E11D48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 600; font-size: 16px;">
                  Schedule Your Intro Call
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
                  <strong>Partnership Overview</strong><br>
                  A detailed document explaining our first-position joint venture structure, capital flow, and typical timelines is attached to this email.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                  If you have any questions before the call, please don't hesitate to reach out.
                </p>
              </div>
            </div>
            
            <div style="margin-top: 24px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Accredited investors only. Not a solicitation. Past performance does not guarantee future results. Investments involve risk of loss.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">
                Southern Specialty Properties LLC (SSP)
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Thank you, ${name}

Thank you for your interest in SSP's first-position joint venture partnerships. We've received your qualification form and are ready to schedule your 30-minute intro call.

Next Steps:
1. Schedule your 30-minute intro call: ${calendlyLink}
2. Review the Partnership Overview document (attached)
3. During the call, we'll walk through the structure and answer any questions

Partnership Overview:
A detailed document explaining our first-position joint venture structure, capital flow, and typical timelines is attached to this email.

If you have any questions before the call, please don't hesitate to reach out.

---

Accredited investors only. Not a solicitation. Past performance does not guarantee future results. Investments involve risk of loss.

Southern Specialty Properties LLC (SSP)
      `.trim(),
      // Note: PDF attachment would be added here when the PDF is generated
      // For now, we'll include a link to the markdown file
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}

