'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';

interface CollectionDetailActionsProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-yellow-400"
          disabled
          title="Favorites coming soon"
        >
          <Star className="size-3.5" />
          Favorite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={{ id: collection.id, name: collection.name }}
        onSuccess={() => router.push('/collections')}
      />
    </>
  );
}
