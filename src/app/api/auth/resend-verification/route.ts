import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/resend";
import { checkRateLimit, getIp, makeRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body as { email: string };

  const ip = getIp(request);
  const identifier = email ? `${ip}:${email}` : ip;
  const rl = await checkRateLimit("resendVerification", identifier);
  if (!rl.success) return makeRateLimitResponse(rl.reset);

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Return success even if user not found to avoid email enumeration
    return NextResponse.json({ success: true });
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { error: "Email is already verified" },
      { status: 400 }
    );
  }

  const token = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return NextResponse.json({ success: true });
}
