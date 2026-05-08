'use client';

import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { NewCollectionDialog } from './NewCollectionDialog';

export function NewCollectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
      >
        <FolderPlus className="size-3.5" />
        New Collection
      </button>
      <NewCollectionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
