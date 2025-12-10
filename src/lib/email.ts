import nodemailer from "nodemailer";

/**
 * Email transporter configuration using nodemailer
 * Supports Gmail and other SMTP providers
 */
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendOTPEmailProps {
  email: string;
  otp: string;
  type?: "sign-in" | "email-verification" | "password-reset";
}

/**
 * Send OTP verification email to user
 * @param email - Recipient email address
 * @param otp - One-time password code
 * @param type - Type of OTP (optional, untuk konteks tambahan)
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  type?: SendOTPEmailProps["type"]
): Promise<void> {
  try {
    const subject = type
      ? `Your ${type.replace("-", " ")} Code - POS Coffee Shop`
      : "Your Verification Code - POS Coffee Shop";

    const contextText = type
      ? `This code is for ${type.replace("-", " ")}.`
      : "";

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">POS Coffee Shop</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
              <p style="font-size: 16px; color: #666;">
                ${contextText ? contextText : "Thank you for logging in."} 
                Please use the following verification code to complete your authentication:
              </p>
              <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your verification code is:</p>
                <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0;">${otp}</p>
              </div>
              <p style="font-size: 14px; color: #666;">
                <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. 
                If you didn't request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} POS Coffee Shop. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Your verification code is: ${otp}\n\n${contextText}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    });
    console.log(
      `OTP email sent successfully to ${email} (type: ${type || "general"})`
    );
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send verification email");
  }
}

/**
 * Verify email transporter configuration on startup
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await emailTransporter.verify();
    console.log("✓ Email transporter is ready");
    return true;
  } catch (error) {
    console.error("✗ Email transporter configuration error:", error);
    return false;
  }
}
