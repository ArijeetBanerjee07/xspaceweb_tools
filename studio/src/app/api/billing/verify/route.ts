import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  planId: z.enum(["starter", "pro", "growth", "business"]).default("pro"),
});

export async function POST(req: Request) {
  try {
    const env = getEnv();
    if (!env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "PAYMENTS_NOT_CONFIGURED", message: "Razorpay secret is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { orderId, paymentId, signature, planId } = parsed.data;

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "INVALID_SIGNATURE", message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment is authentic & verified!
    const authContext = await getAuthContext();
    let workspaceId = authContext?.workspaceId;

    if (!workspaceId) {
      // Find subscription by providerRef to locate associated workspace
      const sub = await prisma.subscription.findFirst({
        where: { providerRef: orderId },
      });
      if (sub) {
        workspaceId = sub.workspaceId;
      } else {
        const firstWs = await prisma.workspace.findFirst();
        workspaceId = firstWs?.id;
      }
    }

    if (workspaceId) {
      await prisma.$transaction([
        prisma.workspace.update({
          where: { id: workspaceId },
          data: { planId },
        }),
        prisma.subscription.updateMany({
          where: { workspaceId },
          data: {
            status: "active",
            planId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and workspace upgraded to Pro!",
      planId,
      orderId,
      paymentId,
    });
  } catch (error: any) {
    console.error("[BILLING_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
