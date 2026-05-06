import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getFavoriteItems } from '@/lib/db/items';
import { getFavoriteCollections, getSelectableCollections } from '@/lib/db/collections';
import { FavoritesList } from '@/components/favorites/FavoritesList';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const [items, collections, drawerCollections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
    getSelectableCollections(userId),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="px-4 pt-6 pb-4 border-b border-border/50">
        <h1 className="text-base font-mono font-semibold">Favorites</h1>
        <p className="text-xs font-mono text-muted-foreground mt-0.5">
          {items.length + collections.length} starred{' '}
          {items.length + collections.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <FavoritesList
        items={items}
        collections={collections}
        drawerCollections={drawerCollections}
      />
    </div>
  );
}
