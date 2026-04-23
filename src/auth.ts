import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import { checkRateLimit, getIp } from "@/lib/rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited" as const;
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified" as const;
}

const EMAIL_VERIFICATION_ENABLED =
  process.env.EMAIL_VERIFICATION_ENABLED !== "false";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const ip = getIp(req as Request);
        const rl = await checkRateLimit("login", `${ip}:${email}`);
        if (!rl.success) throw new RateLimitedError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return user;
      },
    }),
  ],
});
