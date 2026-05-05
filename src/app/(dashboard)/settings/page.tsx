import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getProfileUser } from '@/lib/db/profile';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await getProfileUser(session.user.id);
  if (!user) redirect('/sign-in');

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings</p>
      </div>

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
