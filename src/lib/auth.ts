import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // ===== Credentials Provider (Email + Password) =====
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Log successful login (security audit)
        await prisma.auditLog.create({
          data: {
            action: "USER_LOGIN",
            entityType: "User",
            entityId: user.id,
            details: JSON.stringify({ method: "credentials" }),
            userId: user.id,
          },
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

    // ===== Microsoft Entra ID (Azure AD) Provider =====
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
      profile(profile) {
        return {
          id: profile.sub || profile.oid,
          name: profile.name,
          email: profile.email || profile.preferred_username,
          image: null,
          role: "STAFF_ACCOUNTANT" as Role, // default, can be mapped later
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.firmId = (user as any).firmId;
        token.clientId = (user as any).clientId;
      }

      // On Entra ID login, try to link or create local user
      if (account?.provider === "azure-ad" && user?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
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
      // Allow credentials always
      if (account?.provider === "credentials") return true;

      // For Entra ID  allow if email exists or create basic user
      if (account?.provider === "azure-ad" && user.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });

        if (!existing) {
          // Auto-provision with lowest privilege role
          await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              role: "STAFF_ACCOUNTANT",
              // no passwordHash  Entra ID only
            },
          });
        }

        // Audit log
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              action: "USER_LOGIN",
              entityType: "User",
              entityId: dbUser.id,
              details: JSON.stringify({ method: "azure-ad" }),
              userId: dbUser.id,
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            action: "USER_LOGOUT",
            entityType: "User",
            entityId: token.id as string,
            userId: token.id as string,
          },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};