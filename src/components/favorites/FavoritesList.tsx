'use client';

import { useState, useMemo } from 'react';
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

type SortKey = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'type-asc';

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="ml-auto text-[10px] font-mono bg-transparent text-muted-foreground border border-border/40 rounded px-1.5 py-0.5 cursor-pointer hover:border-border/80 focus:outline-none"
    >
      <option value="date-desc">Newest</option>
      <option value="date-asc">Oldest</option>
      <option value="name-asc">Name A–Z</option>
      <option value="name-desc">Name Z–A</option>
      <option value="type-asc">Type A–Z</option>
    </select>
  );
}

interface FavoritesListProps {
  items: ItemForDashboard[];
  collections: FavoriteCollection[];
  drawerCollections: Array<{ id: string; name: string }>;
}

export function FavoritesList({ items, collections, drawerCollections }: FavoritesListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [itemSort, setItemSort] = useState<SortKey>('date-desc');
  const [collectionSort, setCollectionSort] = useState<SortKey>('date-desc');

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      switch (itemSort) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'type-asc':
          return a.itemType.name.localeCompare(b.itemType.name);
      }
    });
  }, [items, itemSort]);

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      switch (collectionSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'date-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'type-asc':
          return a.dominantTypeName.localeCompare(b.dominantTypeName);
      }
    });
  }, [collections, collectionSort]);

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
            <SortSelect value={itemSort} onChange={setItemSort} />
          </div>
          <div>
            {sortedItems.map((item) => {
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
            <SortSelect value={collectionSort} onChange={setCollectionSort} />
          </div>
          <div>
            {sortedCollections.map((col) => (
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
