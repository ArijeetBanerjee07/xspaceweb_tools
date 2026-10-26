import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const signInSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1),
});

const providers: any[] = [
  Credentials({
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = signInSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const identifier = (parsed.data.username || parsed.data.email || "").trim();
      const password = parsed.data.password;
      if (!identifier || !password) return null;

      const normalizedSynthetic = `${identifier.toLowerCase()}@xswtools.local`;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: identifier, mode: "insensitive" } },
            { email: { equals: identifier.toLowerCase() } },
            { email: { equals: normalizedSynthetic } },
          ],
        },
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
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || getEnv().AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase();
        let dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            memberships: {
              include: { workspace: true },
              orderBy: { id: "asc" },
            },
          },
        });

        if (!dbUser) {
          const passwordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
          dbUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: user.name || null,
              passwordHash,
            },
            include: { memberships: true },
          });

          const workspace = await prisma.workspace.create({
            data: {
              name: `${user.name || "Default"}'s Workspace`,
              planId: "free",
            },
          });

          await prisma.membership.create({
            data: {
              userId: dbUser.id,
              workspaceId: workspace.id,
              role: "owner",
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.workspaceId = (user as unknown as { workspaceId?: string }).workspaceId;
        token.role = (user as unknown as { role?: string }).role;
      }
      if (!token.workspaceId && (token.sub || token.email)) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(token.sub ? [{ id: token.sub }] : []),
              ...(token.email ? [{ email: token.email.toLowerCase() }] : []),
            ],
          },
          include: {
            memberships: {
              include: { workspace: true },
              orderBy: { id: "asc" },
            },
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.workspaceId = dbUser.memberships[0]?.workspace?.id;
          token.role = dbUser.memberships[0]?.role;
        }
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
