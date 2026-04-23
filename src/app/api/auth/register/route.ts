import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/resend";

const EMAIL_VERIFICATION_ENABLED =
  process.env.EMAIL_VERIFICATION_ENABLED !== "false";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword } = body as {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      // Auto-verify when email verification is disabled
      emailVerified: EMAIL_VERIFICATION_ENABLED ? null : new Date(),
    },
  });

  if (EMAIL_VERIFICATION_ENABLED) {
    try {
      const token = await generateVerificationToken(email);
      await sendVerificationEmail(email, token);
    } catch {
      // Email sending failed — user is created and can resend from the verify page
    }
  }

  return NextResponse.json(
    { success: true, emailVerificationRequired: EMAIL_VERIFICATION_ENABLED },
    { status: 201 }
  );
}
