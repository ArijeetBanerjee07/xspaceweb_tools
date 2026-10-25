import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const configured = Boolean(
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_ID.trim() !== "" &&
    env.RAZORPAY_KEY_SECRET &&
    env.RAZORPAY_KEY_SECRET.trim() !== ""
  );

  return NextResponse.json({
    configured,
    message: configured
      ? "Payments configured"
      : "Payments are not configured in this environment.",
  });
}
