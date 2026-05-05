import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getItemsByType, typeSlugToName } from '@/lib/db/items';
import { getSelectableCollections } from '@/lib/db/collections';
import { ItemCardsWithDrawer } from '@/components/items/ItemCardsWithDrawer';
import { Pagination } from '@/components/shared/Pagination';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsListPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { type } = await params;
  const typeName = typeSlugToName(type);
  if (!typeName) notFound();

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [{ items, totalCount }, selectableCollections] = await Promise.all([
    getItemsByType(session.user.id, typeName, currentPage, ITEMS_PER_PAGE),
    getSelectableCollections(session.user.id),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const label = typeName.charAt(0).toUpperCase() + typeName.slice(1) + 's';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{label}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
        </div>
      ) : (
        <>
          <ItemCardsWithDrawer items={items} collections={selectableCollections} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/items/${type}`}
          />
        </>
      )}
    </div>
  );
}
