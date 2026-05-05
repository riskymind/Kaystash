'use client';

import { useRouter } from 'next/navigation';
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
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { SearchItem } from '@/lib/db/items';
import { SearchCollection } from '@/lib/db/collections';

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

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
  collections: SearchCollection[];
  onItemSelect: (id: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  collections,
  onItemSelect,
}: CommandPaletteProps) {
  const router = useRouter();

  function handleItemSelect(id: string) {
    onOpenChange(false);
    onItemSelect(id);
  }

  function handleCollectionSelect(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {items.length > 0 && (
          <CommandGroup heading="Items">
            {items.map((item) => {
              const Icon = ICON_MAP[item.itemType.icon as IconName] ?? Box;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.itemType.name}`}
                  onSelect={() => handleItemSelect(item.id)}
                >
                  <Icon style={{ color: item.itemType.color }} className="size-4 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm">{item.title}</span>
                    {item.contentPreview && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.contentPreview}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        {items.length > 0 && collections.length > 0 && <CommandSeparator />}
        {collections.length > 0 && (
          <CommandGroup heading="Collections">
            {collections.map((col) => (
              <CommandItem
                key={col.id}
                value={col.name}
                onSelect={() => handleCollectionSelect(col.id)}
              >
                <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">{col.name}</span>
                <span className="text-xs text-muted-foreground">{col.itemCount} items</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
