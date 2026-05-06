'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';
import { toggleCollectionFavoriteAction } from '@/actions/collections';

interface CollectionDetailActionsProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  async function handleToggleFavorite() {
    setTogglingFavorite(true);
    const prev = isFavorite;
    setIsFavorite(!prev);
    const result = await toggleCollectionFavoriteAction(collection.id);
    setTogglingFavorite(false);
    if (!result.success) {
      setIsFavorite(prev);
      toast.error(result.error);
      return;
    }
    setIsFavorite(result.isFavorite);
    router.refresh();
  }

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
          className={`gap-1.5 transition-colors ${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`}
          onClick={handleToggleFavorite}
          disabled={togglingFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`size-3.5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
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
