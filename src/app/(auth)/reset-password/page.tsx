'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error === 'token_expired') {
        setError('This reset link has expired. Please request a new one.');
      } else if (data.error === 'invalid_token') {
        setError('Invalid reset link. Please request a new one.');
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
      return;
    }

    router.push('/sign-in?reset=sent');
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is missing or invalid.{' '}
          <Link
            href="/forgot-password"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Request a new one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="space-y-1">
            <p className="text-xs text-destructive">{error}</p>
            {(error.includes('expired') || error.includes('Invalid')) && (
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/forgot-password"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Request a new reset link
                </Link>
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
