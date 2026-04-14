
'use server';

import nodemailer from 'nodemailer';

const ADMIN_WHITELIST = [
  "indraneelmandal0387@gmail.com",
  "tanviacharya569@gmail.com",
  "krishxtech@gmail.com"
];

/**
 * Sends an OTP to any email using SMTP.
 * @param email - Recipient email
 * @param otp - 6-digit code
 * @param isAdmin - If true, enforces the developer whitelist
 */
export async function sendEmailOTP(email: string, otp: string, isAdmin: boolean = false) {
  const lowerEmail = email.toLowerCase();
  
  if (isAdmin && !ADMIN_WHITELIST.includes(lowerEmail)) {
    throw new Error("Unauthorized access attempt.");
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  // Check if critical SMTP credentials are set
  if (!SMTP_USER || !SMTP_PASS || !SMTP_HOST) {
    console.warn("CRITICAL: SMTP credentials missing in .env. Logging OTP to console for development bypass:");
    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    return { success: false, error: "SMTP_MISSING" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '465'),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS.replace(/\s/g, ''),
    },
  });

  const mailOptions = {
    from: `"ResQMate Security" <${SMTP_USER}>`,
    to: lowerEmail,
    subject: isAdmin ? 'ResQMate Admin Verification Code' : 'ResQMate Verification Code',
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1e293b; text-align: center;">Identity Verification</h2>
        <p>A verification attempt was made for <strong>${lowerEmail}</strong> on the ResQMate platform.</p>
        <div style="background: #f1f5f9; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.5;">Enter this code in the app to continue. This code will expire shortly.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;">
        <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; text-align: center; letter-spacing: 1px;">ResQMate Operations • Secure Channel</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Mail Send Error:", error);
    throw new Error(`Failed to deliver verification code: ${error.message}`);
  }
}
