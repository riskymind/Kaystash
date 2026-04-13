import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          kaystash
        </span>

        <div className="flex items-center gap-2 flex-1 max-w-sm mx-6">
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
        {/* Sidebar placeholder */}
        <aside className="w-56 border-r border-border shrink-0 p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Sidebar</h2>
        </aside>

        {/* Main area placeholder */}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Main</h2>
          {children}
        </main>
      </div>
    </div>
  );
}
