'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';
import { toggleCollectionFavoriteAction } from '@/actions/collections';
import type { CollectionForDashboard } from '@/lib/db/collections';

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

interface CollectionCardWithMenuProps {
  col: CollectionForDashboard;
  onDeleteSuccess?: () => void;
}

export function CollectionCardWithMenu({ col, onDeleteSuccess }: CollectionCardWithMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(col.isFavorite);

  async function handleToggleFavorite() {
    const prev = isFavorite;
    setIsFavorite(!prev);
    const result = await toggleCollectionFavoriteAction(col.id);
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
      <div
        className="relative rounded-lg border border-border bg-card overflow-hidden hover:bg-muted/20 transition-colors"
        style={{ borderLeftColor: col.dominantColor, borderLeftWidth: '3px' }}
      >
        {/* Card body — navigates to collection detail */}
        <Link href={`/collections/${col.id}`} className="block p-4 pr-10">
          <div className="flex items-center gap-1.5 min-w-0 mb-1">
            <span className="text-sm font-medium truncate">{col.name}</span>
            {isFavorite && (
              <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-1">{col.itemCount} items</p>

          {col.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{col.description}</p>
          )}

          {col.typeIcons.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {col.typeIcons.map((t) => {
                const Icon = ICON_MAP[t.icon as IconName];
                if (!Icon) return null;
                return (
                  <div
                    key={t.name}
                    className="size-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${t.color}20`, color: t.color }}
                    title={t.name}
                  >
                    <Icon className="size-3" />
                  </div>
                );
              })}
            </div>
          )}
        </Link>

        {/* 3-dots menu — positioned outside the Link so clicks don't navigate */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
              aria-label="Collection options"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleToggleFavorite}>
                <Star className={isFavorite ? 'fill-yellow-400 text-yellow-400' : ''} />
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={{ id: col.id, name: col.name, description: col.description }}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={{ id: col.id, name: col.name }}
        onSuccess={onDeleteSuccess}
      />
    </>
  );
}
