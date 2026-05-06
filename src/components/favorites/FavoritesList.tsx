'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Box,
  FolderOpen,
} from 'lucide-react';
import { ItemForDashboard } from '@/lib/db/items';
import { FavoriteCollection } from '@/lib/db/collections';
import { ItemDrawer } from '@/components/items/ItemDrawer';

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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface FavoritesListProps {
  items: ItemForDashboard[];
  collections: FavoriteCollection[];
  drawerCollections: Array<{ id: string; name: string }>;
}

export function FavoritesList({ items, collections, drawerCollections }: FavoritesListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hasItems = items.length > 0;
  const hasCollections = collections.length > 0;
  const isEmpty = !hasItems && !hasCollections;

  return (
    <>
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground font-mono">No favorites yet.</p>
          <p className="text-xs text-muted-foreground/60 font-mono mt-1">
            Star items or collections to see them here.
          </p>
        </div>
      )}

      {hasItems && (
        <section>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
            <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Items
            </span>
            <span className="text-xs font-mono text-muted-foreground/50">({items.length})</span>
          </div>
          <div>
            {items.map((item) => {
              const Icon = ICON_MAP[item.itemType.icon as IconName] ?? Box;
              const color = item.itemType.color;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors text-left group"
                  onClick={() => setSelectedId(item.id)}
                >
                  <div
                    className="size-6 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <Icon className="size-3" />
                  </div>

                  <span className="flex-1 text-sm font-mono truncate">{item.title}</span>

                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {item.itemType.name}
                  </span>

                  <span className="text-xs font-mono text-muted-foreground/60 shrink-0 w-16 text-right">
                    {formatDate(item.createdAt)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {hasCollections && (
        <section className={hasItems ? 'mt-6' : ''}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
            <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Collections
            </span>
            <span className="text-xs font-mono text-muted-foreground/50">
              ({collections.length})
            </span>
          </div>
          <div>
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div
                  className="size-6 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${col.dominantColor}18`, color: col.dominantColor }}
                >
                  <FolderOpen className="size-3" />
                </div>

                <span className="flex-1 text-sm font-mono truncate">{col.name}</span>

                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>

                <span className="text-xs font-mono text-muted-foreground/60 shrink-0 w-16 text-right">
                  {formatDate(col.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ItemDrawer
        itemId={selectedId}
        onClose={() => setSelectedId(null)}
        collections={drawerCollections}
      />
    </>
  );
}
