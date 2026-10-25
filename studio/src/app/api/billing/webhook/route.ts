import { NextResponse } from "next/server";
import crypto from "crypto";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const env = getEnv();
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "WEBHOOK_SECRET_NOT_CONFIGURED" }, { status: 503 });
    }

    if (!signature) {
      return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle payment / subscription captured
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const notes = event.payload?.payment?.entity?.notes || event.payload?.order?.entity?.notes;
      const workspaceId = notes?.workspaceId;
      const planId = notes?.planId;

      if (workspaceId && planId) {
        await prisma.$transaction([
          prisma.workspace.update({
            where: { id: workspaceId },
            data: { planId },
          }),
          prisma.subscription.updateMany({
            where: { workspaceId },
            data: {
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }
}
