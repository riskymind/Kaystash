import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getCollectionDetail, getItemsInCollection } from '@/lib/db/collections';
import { getSelectableCollections } from '@/lib/db/collections';
import { ItemCardsWithDrawer } from '@/components/items/ItemCardsWithDrawer';
import { Star } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { id } = await params;

  const [collection, items, selectableCollections] = await Promise.all([
    getCollectionDetail(id, session.user.id),
    getItemsInCollection(id, session.user.id),
    getSelectableCollections(session.user.id),
  ]);

  if (!collection) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{collection.name}</h1>
          {collection.isFavorite && (
            <Star className="size-4 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
        </div>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-0.5">
          {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        </div>
      ) : (
        <ItemCardsWithDrawer items={items} collections={selectableCollections} />
      )}
    </div>
  );
}
