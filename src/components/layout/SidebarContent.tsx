'use client';

import Link from 'next/link';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SidebarItemType } from '@/lib/db/items';
import { SidebarCollection } from '@/lib/db/collections';

const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const;

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  itemTypes: SidebarItemType[];
  sidebarCollections: SidebarCollection[];
}

export function SidebarContent({
  collapsed = false,
  onNavigate,
  itemTypes,
  sidebarCollections,
}: SidebarContentProps) {
  const favoriteCollections = sidebarCollections.filter((c) => c.isFavorite);
  const otherCollections = sidebarCollections.filter((c) => !c.isFavorite);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {/* Types section label */}
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
            Types
          </p>
        )}

        <nav className="space-y-0.5">
          {itemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];

            return (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon
                  className="size-3.5 shrink-0"
                  style={{ color: type.color }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 capitalize">{type.name}s</span>
                    {type.count > 0 && (
                      <span className="text-xs text-muted-foreground/60">{type.count}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collections section — hidden when collapsed */}
        {!collapsed && (
          <>
            <div className="mt-5 mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
                Collections
              </p>
            </div>

            {/* Favorites */}
            {favoriteCollections.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1 px-2">
                  Favorites
                </p>
                <nav className="space-y-0.5 mb-3">
                  {favoriteCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <span className="flex-1 truncate">{col.name}</span>
                      <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    </Link>
                  ))}
                </nav>
              </>
            )}

            {/* Recent collections */}
            {otherCollections.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1 px-2">
                  Recent
                </p>
                <nav className="space-y-0.5">
                  {otherCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      {/* Colored circle for dominant item type */}
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.dominantColor }}
                      />
                      <span className="flex-1 truncate">{col.name}</span>
                    </Link>
                  ))}
                </nav>
              </>
            )}

            {/* View all collections link */}
            <Link
              href="/collections"
              onClick={onNavigate}
              className="flex items-center px-2 py-1.5 mt-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              View all collections
            </Link>
          </>
        )}
      </div>

      {/* User avatar — bottom */}
      <div
        className={cn(
          'border-t border-border p-3 flex items-center gap-2.5 shrink-0',
          collapsed && 'justify-center'
        )}
      >
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={undefined} />
          <AvatarFallback className="text-[10px] bg-muted">KS</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Kele</p>
              <p className="text-[10px] text-muted-foreground truncate">kele@kaystash.io</p>
            </div>
            <Settings className="size-3.5 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground transition-colors" />
          </>
        )}
      </div>
    </div>
  );
}
