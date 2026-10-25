import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getEnv().AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            memberships: {
              include: { workspace: true },
              orderBy: { id: "asc" },
            },
          },
        });

        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return null;

        const primaryWorkspace = user.memberships[0]?.workspace;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: primaryWorkspace?.id,
          role: user.memberships[0]?.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.workspaceId = (user as unknown as { workspaceId?: string }).workspaceId;
        token.role = (user as unknown as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { workspaceId?: string }).workspaceId = token.workspaceId as string;
        (session.user as unknown as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
