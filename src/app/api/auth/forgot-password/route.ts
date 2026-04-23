import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/resend";
import { checkRateLimit, getIp, makeRateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const rl = await checkRateLimit("forgotPassword", ip);
    if (!rl.success) return makeRateLimitResponse(rl.reset);

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    const token = await generatePasswordResetToken(email);

    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      // Silent — user can re-request
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
