import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "USER_ALREADY_EXISTS" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || "Default"}'s Workspace`,
        planId: "free",
      },
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "owner",
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        workspace: { id: workspace.id, name: workspace.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Signup Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error?.message },
      { status: 500 }
    );
  }
}
