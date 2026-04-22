import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: "KayStash <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Verify your email</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">
          Thanks for signing up for KayStash. Click the button below to verify your email address.
          This link expires in 24 hours.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;"
        >
          Verify email
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
