import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
  email: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: parsed.error.issues, message: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { username, password, confirmPassword } = parsed.data;

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "PASSWORDS_DO_NOT_MATCH", message: "Passwords do not match." },
        { status: 400 }
      );
    }

    const trimmedUser = username.trim();
    const syntheticEmail = `${trimmedUser.toLowerCase().replace(/\s+/g, "_")}@xswtools.local`;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedUser, mode: "insensitive" } },
          { email: { equals: syntheticEmail } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "USERNAME_ALREADY_EXISTS", message: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: syntheticEmail,
        passwordHash,
        name: trimmedUser,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `${trimmedUser}'s Workspace`,
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
        user: { id: user.id, username: user.name, email: user.email },
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
