'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCollectionAction } from '@/actions/collections';

interface NewCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCollectionDialog({ open, onOpenChange }: NewCollectionDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      formRef.current?.reset();
      setFieldErrors({});
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCollectionAction(formData);
      if (result.success) {
        toast.success('Collection created');
        handleOpenChange(false);
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        toast.error(result.error ?? 'Failed to create collection');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="collection-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="collection-name"
              name="name"
              placeholder="e.g. React Patterns"
              className="h-9 text-sm"
              autoFocus
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="collection-description">
              Description
            </label>
            <textarea
              id="collection-description"
              name="description"
              placeholder="What does this collection contain?"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
