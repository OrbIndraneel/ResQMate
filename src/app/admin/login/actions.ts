
'use server';

import nodemailer from 'nodemailer';

const ADMIN_WHITELIST = [
  "indraneelmandal0387@gmail.com",
  "tanviacharya569@gmail.com",
  "krishxtech@gmail.com"
];

/**
 * Sends an OTP to the authorized developer email.
 * Requires SMTP credentials in .env file to work in production.
 */
export async function sendEmailOTP(email: string, otp: string) {
  const lowerEmail = email.toLowerCase();
  
  if (!ADMIN_WHITELIST.includes(lowerEmail)) {
    throw new Error("Unauthorized access attempt.");
  }

  // Configuration for Nodemailer. 
  // IMPORTANT: For Gmail, use an 'App Password'.
  // For production, use a service like Resend, SendGrid, or Postmark.
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'smtp.ethereal.email' for testing
    auth: {
      user: process.env.SMTP_USER, // Your email address
      pass: process.env.SMTP_PASS, // Your App Password
    },
  });

  const mailOptions = {
    from: '"ResQMate Security" <noreply@resqmate.dev>',
    to: lowerEmail,
    subject: 'ResQMate Admin Verification Code',
    text: `Your one-time password for the Admin Gateway is: ${otp}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1e293b;">Admin Verification Required</h2>
        <p>A login attempt was made for the ResQMate Developer Portal.</p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;">
        <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Secure Terminal • ResQMate Ops</p>
      </div>
    `,
  };

  try {
    // If SMTP credentials aren't set, we log it and fail gracefully for the prototype
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials missing. Logging OTP to console for dev mode:", otp);
      return { success: false, error: "SMTP_MISSING" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Mail Send Error:", error);
    throw new Error("Failed to deliver verification code.");
  }
}
