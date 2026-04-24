'use client';

import { useEffect, useState } from 'react';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Box,
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ItemDetail } from '@/lib/db/items';

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

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Action bar */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-8 w-16 bg-muted rounded-md" />
        <div className="h-8 w-16 bg-muted rounded-md" />
        <div className="ml-auto h-8 w-8 bg-muted rounded-md" />
        <div className="h-8 w-8 bg-muted rounded-md" />
      </div>
      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-md" />
      </div>
      {/* Tags */}
      <div className="space-y-2">
        <div className="h-3 w-12 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }

    setLoading(true);
    setItem(null);

    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  const Icon = item ? (ICON_MAP[item.itemType.icon as IconName] ?? Box) : Box;
  const color = item?.itemType.color ?? '#6b7280';

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0" side="right">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="sr-only">
            {item ? item.title : 'Item detail'}
          </SheetTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {item && (
              <>
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <Icon className="size-3.5" />
                  {item.itemType.name.charAt(0).toUpperCase() + item.itemType.name.slice(1)}s
                </div>
                {item.language && (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </>
            )}
            {loading && (
              <div className="h-6 w-20 bg-muted rounded-md animate-pulse" />
            )}
          </div>
        </SheetHeader>

        {loading && <DrawerSkeleton />}

        {!loading && item && (
          <div className="flex flex-col gap-6 p-6">
            {/* Title */}
            <h2 className="text-base font-semibold leading-tight">{item.title}</h2>

            {/* Action bar */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.isFavorite
                    ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Favorite"
              >
                <Star className={`size-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                Favorite
              </button>

              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.isPinned
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Pin"
              >
                <Pin className="size-3.5" />
                Pin
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Copy"
              >
                <Copy className="size-3.5" />
                Copy
              </button>

              <div className="ml-auto flex items-center gap-1">
                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
              </section>
            )}

            {/* Content */}
            {item.content && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Content
                </p>
                <pre className="text-xs bg-muted rounded-md p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono leading-relaxed">
                  {item.content}
                </pre>
              </section>
            )}

            {/* URL */}
            {item.url && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  URL
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {item.url}
                </a>
              </section>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Collections */}
            {item.collections.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Collections
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.collections.map((col) => (
                    <span
                      key={col.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                    >
                      <FolderOpen className="size-3" />
                      {col.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Details */}
            <section className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Details
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Created
                  </span>
                  <span className="text-foreground/70">{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Updated
                  </span>
                  <span className="text-foreground/70">{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
