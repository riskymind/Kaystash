'use client';

import { useState } from 'react';
import { Search, Plus, PanelLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarContent } from './SidebarContent';
import { SidebarItemType } from '@/lib/db/items';
import { SidebarCollection } from '@/lib/db/collections';

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: SidebarItemType[];
  sidebarCollections: SidebarCollection[];
}

export function DashboardShell({ children, itemTypes, sidebarCollections }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-8 h-8 text-sm bg-muted/50 border-border"
            />
          </div>
        </div>

        <Button size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="size-3.5" />
          New Item
        </Button>
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
    </div>
  );
}
