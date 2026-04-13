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
import { mockUser, mockItemTypes, mockCollections, mockItems } from '@/lib/mock-data';

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
}

export function SidebarContent({ collapsed = false, onNavigate }: SidebarContentProps) {
  const itemCountByType = mockItemTypes.reduce<Record<string, number>>((acc, type) => {
    acc[type.id] = mockItems.filter((item) => item.itemTypeId === type.id).length;
    return acc;
  }, {});

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const otherCollections = mockCollections.filter((c) => !c.isFavorite);

  const userInitials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('');

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
          {mockItemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
            const count = itemCountByType[type.id] ?? 0;

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
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground/60">{count}</span>
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

            {/* All collections */}
            {otherCollections.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1 px-2">
                  All Collections
                </p>
                <nav className="space-y-0.5">
                  {otherCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground/60">
                        {col.itemCount}
                      </span>
                    </Link>
                  ))}
                </nav>
              </>
            )}
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
          <AvatarImage src={mockUser.image ?? undefined} />
          <AvatarFallback className="text-[10px] bg-muted">{userInitials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{mockUser.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{mockUser.email}</p>
            </div>
            <Settings className="size-3.5 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground transition-colors" />
          </>
        )}
      </div>
    </div>
  );
}
