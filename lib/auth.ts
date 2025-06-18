import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./send";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUP_CLIENT_ID,
      clientSecret: env.AUTH_GITHUP_SECRET
    }
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from: "LMS <onboarding@resend.dev>",
          to: [email],
          subject: "Verify your email",
          html: `<p>Your OTP is <strong>${otp}</strong></p>`
        });
      }
    })
  ]
});
