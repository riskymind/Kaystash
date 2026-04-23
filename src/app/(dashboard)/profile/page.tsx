import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getProfileUser, getProfileStats } from '@/lib/db/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from 'lucide-react';

const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const;

type IconName = keyof typeof ICON_MAP;

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatJoinDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!user) redirect('/sign-in');

  const initials = getInitials(user.name);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your account details and usage</p>
      </div>

      {/* User info */}
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Account</h2>
        <div className="flex items-center gap-4">
          <Avatar className="size-14 shrink-0">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
            <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <p className="font-medium truncate">{user.name ?? '—'}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              Joined {formatJoinDate(user.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Usage stats */}
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Usage</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Total items</p>
            <p className="text-2xl font-semibold">{stats.totalItems}</p>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Collections</p>
            <p className="text-2xl font-semibold">{stats.totalCollections}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-3">By type</p>
          <div className="space-y-2">
            {stats.byType.map((t) => {
              const Icon = ICON_MAP[t.icon as IconName];
              return (
                <div key={t.name} className="flex items-center gap-3">
                  <div
                    className="size-6 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${t.color}20`, color: t.color }}
                  >
                    {Icon && <Icon className="size-3.5" />}
                  </div>
                  <span className="text-sm capitalize flex-1">{t.name}s</span>
                  <span className="text-sm font-medium tabular-nums">{t.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Change password — credential accounts only */}
      {user.hasPassword && (
        <section className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Change password</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update the password for your account.
            </p>
          </div>
          <ChangePasswordForm />
        </section>
      )}

      {/* Danger zone */}
      <section className="rounded-lg border border-destructive/40 bg-card p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <DeleteAccountDialog />
      </section>
    </div>
  );
}
