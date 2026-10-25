import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      const env = getEnv();
      const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

      // In development, print the reset link to the console; never log tokens in production mode.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV ONLY] Password reset link for ${email}: ${resetUrl}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been generated.",
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
