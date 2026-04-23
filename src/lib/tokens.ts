import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing token for this email before creating a new one
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  const identifier = `reset:${email}`;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset token for this email before creating a new one
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}
