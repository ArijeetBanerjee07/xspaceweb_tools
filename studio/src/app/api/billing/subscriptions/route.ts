import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { getAuthContext } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/config/plans";

const createSubscriptionSchema = z.object({
  planId: z.enum(["starter", "pro", "growth", "business"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: Request) {
  try {
    const authContext = await getAuthContext();
    let workspaceId = authContext?.workspaceId;
    if (!workspaceId) {
      const firstWs = await prisma.workspace.findFirst();
      workspaceId = firstWs?.id || "ws_guest";
    }

    const env = getEnv();
    if (
      !env.RAZORPAY_KEY_ID ||
      env.RAZORPAY_KEY_ID.trim() === "" ||
      !env.RAZORPAY_KEY_SECRET ||
      env.RAZORPAY_KEY_SECRET.trim() === ""
    ) {
      return NextResponse.json(
        {
          error: "PAYMENTS_NOT_CONFIGURED",
          message: "Payments are not configured in this environment.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = createSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { planId, billingCycle } = parsed.data;
    const plan = getPlan(planId);
    const amount = billingCycle === "monthly" ? plan.priceInrMonthly : plan.priceInrYearly;

    if (!amount) {
      return NextResponse.json(
        { error: "CUSTOM_PLAN", message: "Please contact sales for custom plans." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay Order/Subscription
    const order = (await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `sub_${workspaceId}_${Date.now()}`,
      notes: {
        workspaceId: workspaceId || "ws_guest",
        planId,
        billingCycle,
      },
    })) as any;

    let subscriptionId = order.id;
    if (workspaceId !== "ws_guest") {
      const subscription = await prisma.subscription.create({
        data: {
          workspaceId,
          provider: "razorpay",
          providerRef: order.id,
          status: "created",
          planId,
        },
      });
      subscriptionId = subscription.id;
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
