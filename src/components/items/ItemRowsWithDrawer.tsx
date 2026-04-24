'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { ItemForDashboard } from '@/lib/db/items';
import { ItemDrawer } from './ItemDrawer';

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ItemRow({
  item,
  onClick,
}: {
  item: ItemForDashboard;
  onClick: (id: string) => void;
}) {
  const Icon = ICON_MAP[item.itemType.icon as IconName] ?? Box;
  const color = item.itemType.color;

  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/10 transition-colors -mx-4 px-4"
      onClick={() => onClick(item.id)}
    >
      <div
        className="size-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="size-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-medium truncate">{item.title}</span>
          {item.isFavorite && (
            <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
          {item.isPinned && (
            <Pin className="size-3 text-muted-foreground shrink-0" />
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mb-1.5">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
        {formatDate(item.createdAt)}
      </span>
    </div>
  );
}

interface ItemRowsWithDrawerProps {
  items: ItemForDashboard[];
}

export function ItemRowsWithDrawer({ items }: ItemRowsWithDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-lg border border-border bg-card px-4">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onClick={setSelectedId} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
