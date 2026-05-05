import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getCollectionDetail, getItemsInCollection } from '@/lib/db/collections';
import { getSelectableCollections } from '@/lib/db/collections';
import { ItemCardsWithDrawer } from '@/components/items/ItemCardsWithDrawer';
import { CollectionDetailActions } from '@/components/collections/CollectionDetailActions';
import { Pagination } from '@/components/shared/Pagination';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';
import { Star } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [collection, { items, totalCount }, selectableCollections] = await Promise.all([
    getCollectionDetail(id, session.user.id),
    getItemsInCollection(id, session.user.id, currentPage, ITEMS_PER_PAGE),
    getSelectableCollections(session.user.id),
  ]);

  if (!collection) notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
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
          <CollectionDetailActions
            collection={{
              id: collection.id,
              name: collection.name,
              description: collection.description,
            }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        </div>
      ) : (
        <>
          <ItemCardsWithDrawer items={items} collections={selectableCollections} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/collections/${id}`}
          />
        </>
      )}
    </div>
  );
}
