'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MailOpen } from 'lucide-react';

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setSent(true);
  }

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-muted p-4">
          <MailOpen className="size-8 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{' '}
          {email ? <span className="text-foreground font-medium">{email}</span> : 'your email address'}.
          Click the link to activate your account.
        </p>
      </div>

      {email && (
        <div className="space-y-2">
          {sent ? (
            <p className="text-sm text-muted-foreground">Verification email resent.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Didn&apos;t receive it?</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense>
      <VerifyEmailSentContent />
    </Suspense>
  );
}
