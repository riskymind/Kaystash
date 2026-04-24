import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Pin,
  Box,
} from 'lucide-react';
import { ItemForDashboard } from '@/lib/db/items';

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

export function ItemCard({
  item,
  onClick,
}: {
  item: ItemForDashboard;
  onClick?: (id: string) => void;
}) {
  const Icon = ICON_MAP[item.itemType.icon as IconName] ?? Box;
  const color = item.itemType.color;

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors cursor-pointer"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      onClick={() => onClick?.(item.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="size-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="size-3.5" />
          </div>
          <span className="text-sm font-medium truncate">{item.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.isFavorite && (
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          )}
          {item.isPinned && (
            <Pin className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 ml-9">
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-9">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
}
