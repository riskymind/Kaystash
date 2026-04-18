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
  FolderOpen,
  Heart,
  Bookmark,
} from 'lucide-react';
import { getDashboardCollections, getDashboardStats, CollectionForDashboard } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems, ItemForDashboard } from '@/lib/db/items';
import { prisma } from '@/lib/prisma';

// ─── Icon / color map ────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

function CollectionCard({ col }: { col: CollectionForDashboard }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors relative overflow-hidden"
      style={{ borderLeftColor: col.dominantColor, borderLeftWidth: '3px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium truncate">{col.name}</span>
          {col.isFavorite && (
            <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-1">{col.itemCount} items</p>

      {/* Description */}
      {col.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{col.description}</p>
      )}

      {/* Type icons */}
      {col.typeIcons.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {col.typeIcons.map((t) => {
            const Icon = ICON_MAP[t.icon as IconName];
            if (!Icon) return null;
            return (
              <div
                key={t.name}
                className="size-5 rounded flex items-center justify-center"
                style={{ backgroundColor: `${t.color}20`, color: t.color }}
                title={t.name}
              >
                <Icon className="size-3" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item }: { item: ItemForDashboard }) {
  const Icon = ICON_MAP[item.itemType.icon as IconName] ?? Box;
  const color = item.itemType.color;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      {/* Type icon */}
      <div
        className="size-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="size-3.5" />
      </div>

      {/* Body */}
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

      {/* Date */}
      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
        {formatDate(item.createdAt)}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  // TODO: replace with session user once auth is wired up
  const demoUser = await prisma.user.findUnique({ where: { email: 'kele@kaystash.io' } });

  const [collections, stats, pinnedItems, recentItems] = demoUser
    ? await Promise.all([
        getDashboardCollections(demoUser.id),
        getDashboardStats(demoUser.id),
        getPinnedItems(demoUser.id),
        getRecentItems(demoUser.id),
      ])
    : [
        [],
        { totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 },
        [],
        [],
      ];

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
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} col={col} />
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
          <div className="rounded-lg border border-border bg-card px-4">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent items */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Recent Items</h2>
        <div className="rounded-lg border border-border bg-card px-4">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
