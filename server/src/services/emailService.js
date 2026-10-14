import { Resend } from 'resend';
import { env } from '../config/env.js';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_api_key_here') return null;
  return new Resend(apiKey);
}

export function isResendConfigured() {
  return !!(process.env.RESEND_API_KEY || env.RESEND_API_KEY);
}

/**
 * Send a branded HTML password reset email via Resend
 */
export async function sendPasswordResetEmail(email, name, resetCode) {
  const recipientName = name ? name.split(' ')[0] : 'there';
  const fromAddress = process.env.EMAIL_FROM || env.EMAIL_FROM || 'ReLoop <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #20251F; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E2E0D8; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: #356B50; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: #DCE9DD; font-size: 13px; font-weight: 500; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 700; color: #20251F; margin-bottom: 12px; }
    .message { font-size: 14px; line-height: 1.6; color: #74786F; margin-bottom: 24px; }
    .code-box { background: #F7F5F0; border: 2px dashed #356B50; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 11px; font-weight: 700; color: #356B50; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .code { font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #28523D; margin: 0; }
    .expiry { font-size: 12px; color: #8F938A; margin-top: 8px; }
    .footer { background: #EFEEE8; padding: 20px 32px; text-align: center; font-size: 12px; color: #74786F; border-top: 1px solid #E2E0D8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ReLoop</h1>
      <p>Buy smarter. Sell easier. Waste less.</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${recipientName},</div>
      <p class="message">
        We received a request to reset your password for your ReLoop account. Enter the verification code below to complete your password update:
      </p>
      
      <div class="code-box">
        <div class="code-label">Verification Code</div>
        <div class="code">${resetCode}</div>
        <div class="expiry">Expires in 15 minutes</div>
      </div>

      <p class="message" style="font-size: 12px; color: #8F938A; margin-bottom: 0;">
        If you did not request a password reset, you can safely ignore this email. Your account password will remain unchanged.
      </p>
    </div>
    <div class="footer">
      &copy; 2026 ReLoop Secondhand Marketplace. Practical circular commerce.
    </div>
  </div>
</body>
</html>
  `;

  const client = getResendClient();
  if (client) {
    try {
      const data = await client.emails.send({
        from: fromAddress,
        to: email,
        subject: `Your ReLoop Password Reset Code: ${resetCode}`,
        html: htmlContent,
      });
      console.log(`[Resend Email] Password reset email sent to ${email} (ID: ${data.id})`);
      return { success: true, id: data.id };
    } catch (err) {
      console.warn(`[Resend Email Error] Failed to send email to ${email}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[Resend Email Mock] RESEND_API_KEY not configured. Simulated email for ${email} with code ${resetCode}`);
    return { success: true, simulated: true };
  }
}
