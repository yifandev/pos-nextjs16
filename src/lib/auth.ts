import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail(email, otp);
          console.log(`OTP ${type} sent to ${email}`);
        } catch (error) {
          console.error(`Failed to send OTP for ${type}:`, error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],

  // User data configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "cashier",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
