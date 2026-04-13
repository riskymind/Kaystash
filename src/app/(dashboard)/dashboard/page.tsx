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
import { mockCollections, mockItems, mockItemTypes } from '@/lib/mock-data';

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

function getType(typeId: string) {
  return mockItemTypes.find((t) => t.id === typeId);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Derived data ─────────────────────────────────────────────────────────────

const totalItems = mockItems.length;
const totalCollections = mockCollections.length;
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

const recentCollections = [...mockCollections].sort(
  (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

const pinnedItems = mockItems.filter((i) => i.isPinned);

const recentItems = [...mockItems]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);

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

function CollectionCard({ col }: { col: (typeof mockCollections)[number] }) {
  const defaultType = col.defaultTypeId ? getType(col.defaultTypeId) : null;
  const accentColor = defaultType?.color ?? '#6b7280';

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors relative overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}
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
        <p className="text-xs text-muted-foreground line-clamp-2">{col.description}</p>
      )}
    </div>
  );
}

function ItemRow({ item }: { item: (typeof mockItems)[number] }) {
  const type = getType(item.itemTypeId);
  const Icon = type ? ICON_MAP[type.icon as IconName] : Box;
  const color = type?.color ?? '#6b7280';

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

export default function DashboardPage() {
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
        <StatCard label="Total Items" value={totalItems} icon={Box} />
        <StatCard label="Collections" value={totalCollections} icon={FolderOpen} />
        <StatCard label="Favorite Items" value={favoriteItems} icon={Heart} />
        <StatCard label="Favorite Collections" value={favoriteCollections} icon={Bookmark} />
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
          {recentCollections.map((col) => (
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
