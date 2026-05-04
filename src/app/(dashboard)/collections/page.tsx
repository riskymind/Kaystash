import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getDashboardCollections, CollectionForDashboard } from '@/lib/db/collections';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
} from 'lucide-react';

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

function CollectionCard({ col }: { col: CollectionForDashboard }) {
  return (
    <Link
      href={`/collections/${col.id}`}
      className="block rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors overflow-hidden"
      style={{ borderLeftColor: col.dominantColor, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium truncate">{col.name}</span>
          {col.isFavorite && (
            <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-1">{col.itemCount} items</p>

      {col.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{col.description}</p>
      )}

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
    </Link>
  );
}

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const collections = await getDashboardCollections(session.user.id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Collections</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}
    </div>
  );
}
