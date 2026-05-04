import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getDashboardCollections } from '@/lib/db/collections';
import { CollectionCardWithMenu } from '@/components/collections/CollectionCardWithMenu';

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
            <CollectionCardWithMenu key={col.id} col={col} />
          ))}
        </div>
      )}
    </div>
  );
}
