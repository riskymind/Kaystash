'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteAccountAction } from '@/actions/profile';

const CONFIRM_PHRASE = 'delete my account';

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPhrase('');
      setError('');
    }
  }

  async function handleDelete() {
    if (phrase !== CONFIRM_PHRASE) {
      setError(`Type "${CONFIRM_PHRASE}" to confirm.`);
      return;
    }
    setLoading(true);
    await deleteAccountAction();
    // signOut redirect handles navigation — no need to reset state
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete account
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This will permanently delete your account, all your items, and collections. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Type{' '}
            <span className="font-mono text-foreground text-xs bg-muted px-1 py-0.5 rounded">
              {CONFIRM_PHRASE}
            </span>{' '}
            to confirm.
          </p>
          <Input
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              setError('');
            }}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete my account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
