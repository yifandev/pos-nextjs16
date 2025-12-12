import nodemailer from "nodemailer";

/**
 * Email transporter configuration using nodemailer
 * Supports Gmail and other SMTP providers
 */
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
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
 * Generate a modern email template with coffee shop theme
 */
function generateEmailTemplate(
  otp: string,
  type?: SendOTPEmailProps["type"]
): string {
  const subject = type
    ? `Your ${type.replace("-", " ")} Code - POS Coffee Shop`
    : "Your Verification Code - POS Coffee Shop";

  const contextText = type
    ? `This code is for ${type.replace("-", " ")}.`
    : "Thank you for choosing our coffee shop.";

  const coffeeIcon = "☕";
  const expiryMinutes = 10;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - POS Coffee Shop</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Modern Reset & Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #251a0d; /* Deep coffee brown */
      background-color: #f9f5f0; /* Cream background */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    /* Modern Header */
    .email-header {
      background: linear-gradient(135deg, #5d4037 0%, #3e2723 100%); /* Dark coffee gradient */
      padding: 40px 30px;
      border-radius: 20px 20px 0 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .email-header::before {
      content: "☕☕☕";
      position: absolute;
      top: 20px;
      left: 20px;
      font-size: 24px;
      opacity: 0.3;
    }
    
    .email-header::after {
      content: "☕☕☕";
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 24px;
      opacity: 0.3;
    }
    
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .coffee-icon {
      font-size: 32px;
      color: #d7ccc8;
    }
    
    .brand-name {
      color: #fff;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .brand-tagline {
      color: #d7ccc8;
      font-size: 16px;
      font-weight: 400;
      opacity: 0.9;
    }
    
    /* Content Area */
    .email-content {
      background: #fff;
      padding: 50px 40px;
      border-radius: 0 0 20px 20px;
      box-shadow: 0 10px 40px rgba(93, 64, 55, 0.08);
      position: relative;
    }
    
    .content-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .content-title {
      color: #3e2723; /* Dark coffee */
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    
    .content-subtitle {
      color: #795548; /* Medium brown */
      font-size: 16px;
      line-height: 1.6;
      max-width: 500px;
      margin: 0 auto;
    }
    
    /* OTP Card */
    .otp-card {
      background: linear-gradient(135deg, #f9f5f0 0%, #fff 100%);
      border: 2px solid #d7ccc8; /* Light caramel border */
      border-radius: 16px;
      padding: 40px 30px;
      margin: 40px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .otp-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #5d4037 0%, #795548 50%, #8d6e63 100%);
    }
    
    .otp-label {
      color: #795548;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 15px;
      display: block;
    }
    
    .otp-code {
      font-size: 48px;
      font-weight: 800;
      color: #3e2723;
      letter-spacing: 10px;
      font-family: 'Courier New', monospace;
      margin: 20px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
    }
    
    .otp-timer {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fff8f0;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 14px;
      color: #795548;
      margin-top: 20px;
    }
    
    .timer-icon {
      font-size: 16px;
    }
    
    
    /* Footer */
    .email-footer {
      border-top: 1px solid #e8e0d9;
      margin-top: 50px;
      padding-top: 30px;
      text-align: center;
    }
    
    .footer-text {
      color: #8d6e63;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .footer-link {
      color: #795548;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    
    .footer-link:hover {
      color: #5d4037;
      text-decoration: underline;
    }
    
    .copyright {
      color: #a1887f;
      font-size: 12px;
      margin-top: 30px;
    }
    
    /* Responsive Design */
    @media (max-width: 600px) {
      .email-container {
        padding: 20px 15px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
      
      .email-content {
        padding: 30px 20px;
      }
      
      .content-title {
        font-size: 24px;
      }
      
      .otp-code {
        font-size: 36px;
        letter-spacing: 6px;
      }
      
      .footer-links {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="brand">
        <div class="coffee-icon">☕</div>
        <div>
          <div class="brand-name">POS Coffee Shop</div>
          <div class="brand-tagline">Point Of sales Project</div>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="email-content">
      <div class="content-header">
        <h1 class="content-title">Your Verification Code</h1>
        <p class="content-subtitle">
          ${contextText} Please use the verification code below to complete your authentication process.
        </p>
      </div>
      
      <!-- OTP Card -->
      <div class="otp-card">
        <span class="otp-label">Verification Code</span>
        <div class="otp-code">${otp}</div>
        <div class="otp-timer">
          <span class="timer-icon">⏳</span>
          <span>Expires in ${expiryMinutes} minutes</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="email-footer">
        <div class="footer-text">
          Need help? Our support team is here for you.
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">Visit Our Website</a>
          <a href="#" class="footer-link">Contact Support</a>
          <a href="#" class="footer-link">Privacy Policy</a>
        </div>
        <div class="copyright">
          © ${new Date().getFullYear()} POS Coffee Shop. All rights reserved.<br>
          Brewed with ☕ and ❤️
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
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

    const textContent = `
POS Coffee Shop - Verification Code

Your verification code is: ${otp}

This code is valid for 10 minutes. 
Please enter this code in the application to complete your ${
      type ? type.replace("-", " ") : "verification"
    } process.

If you didn't request this code, please ignore this email.

Need help? Contact our support team.

© ${new Date().getFullYear()} POS Coffee Shop
    `.trim();

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: generateEmailTemplate(otp, type),
      text: textContent,
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
