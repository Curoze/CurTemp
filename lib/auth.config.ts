import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getClientIP } from "@/utils/getClient";
import { createUserLog } from "@/lib/userLogger";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      role_id: number;
      allowedPaths: string[];
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    role_id: number;
    allowedPaths: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    role_id: number;
    allowedPaths: string[];
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(
    prisma
  ) as unknown as import("next-auth/adapters").Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: { label: "Password", type: "password" },
        ipAddress: { label: "IP Address", type: "hidden" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        const clientIP = getClientIP(req, credentials);
        const userAgent = req?.headers?.["user-agent"] || "Unknown";

        try {
          const user = await prisma.users.findFirst({
            where: {
              name: credentials.username,
              is_active: true,
            },
            include: {
              role: {
                include: {
                  menuRoles: {
                    include: {
                      menu: {
                        select: {
                          path: true,
                          is_active: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!user) {
            throw new Error("Invalid username or password");
          }

          if (!user.is_active) {
            await createUserLog({
              userId: user.id,
              action: "LOGIN_FAILED",
              ip: clientIP,
              userAgent,
              success: false,
              note: "Account is inactive",
            });
            throw new Error("Account is inactive");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.pass
          );

          if (!isPasswordValid) {
            await createUserLog({
              userId: user.id,
              action: "LOGIN_FAILED",
              ip: clientIP,
              userAgent,
              success: false,
              note: "Invalid password",
            });
            throw new Error("Invalid username or password");
          }

          const allowedPaths = user.role.menuRoles
            .filter((mr) => mr.menu.is_active && mr.menu.path)
            .map((mr) => mr.menu.path as string);

          await createUserLog({
            userId: user.id,
            action: "LOGIN",
            ip: clientIP,
            userAgent,
            success: true,
          });

          return {
            id: String(user.id),
            username: user.name,
            role: user.role.role,
            role_id: user.role_id,
            allowedPaths,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.role_id = user.role_id;
        token.allowedPaths = user.allowedPaths;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.role_id = token.role_id;
        session.user.allowedPaths = token.allowedPaths;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
