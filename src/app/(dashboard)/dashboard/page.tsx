import Link from 'next/link';
import {
  Pin,
  Box,
  FolderOpen,
  FolderPlus,
  Heart,
  Bookmark,
} from 'lucide-react';
import { getDashboardCollections, getDashboardStats, getSelectableCollections } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ItemRowsWithDrawer } from '@/components/items/ItemRowsWithDrawer';
import { CollectionCardWithMenu } from '@/components/collections/CollectionCardWithMenu';

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [collections, stats, pinnedItems, recentItems, selectableCollections] = await Promise.all([
    getDashboardCollections(session.user.id),
    getDashboardStats(session.user.id),
    getPinnedItems(session.user.id),
    getRecentItems(session.user.id),
    getSelectableCollections(session.user.id),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your developer knowledge hub
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={stats.totalItems} icon={Box} />
        <StatCard label="Collections" value={stats.totalCollections} icon={FolderOpen} />
        <StatCard label="Favorite Items" value={stats.favoriteItems} icon={Heart} />
        <StatCard label="Favorite Collections" value={stats.favoriteCollections} icon={Bookmark} />
      </div>

      {/* Recent collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Collections</h2>
          <div className="flex items-center gap-3">
            <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
            <button className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
              <FolderPlus className="size-3.5" />
              New Collection
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <CollectionCardWithMenu key={col.id} col={col} />
          ))}
        </div>
      </section>

      {/* Pinned items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Pinned</h2>
          </div>
          <ItemRowsWithDrawer items={pinnedItems} collections={selectableCollections} />
        </section>
      )}

      {/* Recent items */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Recent Items</h2>
        <ItemRowsWithDrawer items={recentItems} collections={selectableCollections} />
      </section>
    </div>
  );
}
