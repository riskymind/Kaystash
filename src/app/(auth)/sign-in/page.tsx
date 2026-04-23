'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitBranch } from 'lucide-react';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const verified = searchParams.get('verified') === 'true';
  const resetSent = searchParams.get('reset') === 'sent';
  const tokenError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.code === 'email_not_verified') {
      setError('Please verify your email before signing in.');
      setInfo(email);
    } else if (result?.error) {
      setError('Invalid email or password.');
    } else {
      window.location.href = callbackUrl;
    }
  }

  async function handleGitHub() {
    await signIn('github', { callbackUrl });
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Sign in to kaystash</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleGitHub}
        type="button"
      >
        <GitBranch className="size-4" />
        Sign in with GitHub
      </Button>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleCredentials} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="space-y-1">
            <p className="text-xs text-destructive">{error}</p>
            {info && (
              <p className="text-xs text-muted-foreground">
                <Link
                  href={`/verify-email-sent?email=${encodeURIComponent(info)}`}
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Resend verification email
                </Link>
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {verified && (
        <p className="text-center text-xs text-emerald-500">
          Email verified! You can now sign in.
        </p>
      )}

      {resetSent && (
        <p className="text-center text-xs text-emerald-500">
          Password reset successfully. You can now sign in with your new password.
        </p>
      )}

      {tokenError === 'token_expired' && (
        <p className="text-center text-xs text-destructive">
          Your verification link has expired. Please register again or request a new link.
        </p>
      )}

      {tokenError === 'invalid_token' && (
        <p className="text-center text-xs text-destructive">
          Invalid verification link.
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
