import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Audit logging is deliberately non-blocking: a logging failure must never
// turn a valid set of credentials into a failed sign-in.
async function writeAuditLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({ data });
  } catch (error) {
    console.error("FINOVA audit log error (non-blocking):", error);
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = credentials.email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user?.passwordHash) {
        return null;
      }

      const passwordMatches = await compare(
        credentials.password,
        user.passwordHash
      );

      if (!passwordMatches) {
        return null;
      }

      await writeAuditLog({
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        userId: user.id,
        details: JSON.stringify({ method: "credentials" }),
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        firmId: user.firmId,
        clientId: user.clientId,
      };
    },
  }),
];

// Microsoft sign-in is optional. Do not initialize the Azure provider with
// missing credentials, because that can prevent the credentials provider
// from initializing and break every login method.
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: "openid profile email User.Read" },
      },
      profile(profile) {
        return {
          id: profile.sub || profile.oid,
          name: profile.name,
          email: profile.email || profile.preferred_username,
          image: null,
          role: "STAFF_ACCOUNTANT" as Role,
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.firmId = (user as any).firmId;
        token.clientId = (user as any).clientId;
      }

      if (account?.provider === "azure-ad" && user?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase().trim() },
        });

        if (existing) {
          token.id = existing.id;
          token.role = existing.role;
          token.firmId = existing.firmId;
          token.clientId = existing.clientId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).firmId = token.firmId;
        (session.user as any).clientId = token.clientId;
      }

      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider !== "azure-ad" || !user.email) {
        return false;
      }

      const email = user.email.toLowerCase().trim();
      const approvedUser = await prisma.user.findUnique({ where: { email } });

      if (!approvedUser || !approvedUser.firmId) {
        return false;
      }

      await writeAuditLog({
        action: "USER_LOGIN",
        entityType: "User",
        entityId: approvedUser.id,
        userId: approvedUser.id,
        details: JSON.stringify({ method: "azure-ad" }),
      });

      return true;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await writeAuditLog({
          action: "USER_LOGOUT",
          entityType: "User",
          entityId: token.id as string,
          userId: token.id as string,
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
