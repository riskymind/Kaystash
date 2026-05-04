'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { deleteCollectionAction } from '@/actions/collections';

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: { id: string; name: string };
  onSuccess?: () => void;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSuccess,
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteCollectionAction(collection.id);
      if (result.success) {
        toast.success('Collection deleted');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error ?? 'Failed to delete collection');
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{collection.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the collection. Items in this collection will not be
            deleted — they&apos;ll just be removed from it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
