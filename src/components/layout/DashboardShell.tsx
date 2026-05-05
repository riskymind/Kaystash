'use client';

import { useEffect, useState } from 'react';
import { Plus, PanelLeft, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './SidebarContent';
import { SidebarItemType, SearchItem } from '@/lib/db/items';
import { SidebarCollection, SearchCollection } from '@/lib/db/collections';
import { NewItemDialog } from '@/components/items/NewItemDialog';
import { NewCollectionDialog } from '@/components/collections/NewCollectionDialog';
import { CommandPalette } from './CommandPalette';
import { ItemDrawer } from '@/components/items/ItemDrawer';

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: SidebarItemType[];
  sidebarCollections: SidebarCollection[];
  searchItems: SearchItem[];
  searchCollections: SearchCollection[];
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
    image: string | null | undefined;
  };
}

export function DashboardShell({
  children,
  itemTypes,
  sidebarCollections,
  searchItems,
  searchCollections,
  user,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const drawerCollections = sidebarCollections.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0 z-10 relative">
        <div className="flex items-center gap-1.5">
          {/* Mobile drawer trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden size-8"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>

          {/* Desktop sidebar collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex size-8"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="size-4" />
          </Button>

          <span className="text-sm font-semibold tracking-tight">kaystash</span>
        </div>

        <div className="flex items-center flex-1 max-w-sm mx-6">
          <button
            type="button"
            className="relative w-full flex items-center h-8 rounded-md bg-muted/50 border border-border px-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => setPaletteOpen(true)}
          >
            <Search className="size-3.5 mr-2 shrink-0" />
            <span className="flex-1 text-left truncate">Search items...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/70 bg-muted rounded px-1 py-0.5 ml-2 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setNewCollectionOpen(true)}>
            <Plus className="size-3.5" />
            New Collection
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setNewItemOpen(true)}>
            <Plus className="size-3.5" />
            New Item
          </Button>
        </div>
        <NewItemDialog open={newItemOpen} onOpenChange={setNewItemOpen} collections={sidebarCollections} />
        <NewCollectionDialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen} />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col border-r border-border shrink-0 overflow-hidden"
          style={{
            width: sidebarCollapsed ? '3.5rem' : '14rem',
            transition: 'width 200ms ease-in-out',
          }}
        >
          <SidebarContent
            collapsed={sidebarCollapsed}
            itemTypes={itemTypes}
            sidebarCollections={sidebarCollections}
            user={user}
          />
        </aside>

        {/* Mobile drawer — overlay + slide-in panel */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <div className="absolute inset-y-0 left-0 w-56 bg-background border-r border-border flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-3 h-14 border-b border-border shrink-0">
                <span className="text-sm font-semibold tracking-tight">kaystash</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent
                  onNavigate={() => setMobileOpen(false)}
                  itemTypes={itemTypes}
                  sidebarCollections={sidebarCollections}
                  user={user}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global command palette */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={searchItems}
        collections={searchCollections}
        onItemSelect={setSelectedItemId}
      />

      {/* Global item drawer — opened from command palette */}
      <ItemDrawer
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
        collections={drawerCollections}
      />
    </div>
  );
}
