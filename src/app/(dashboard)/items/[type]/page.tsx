import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getItemsByType, typeSlugToName } from '@/lib/db/items';
import { ItemCardsWithDrawer } from '@/components/items/ItemCardsWithDrawer';

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ItemsListPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { type } = await params;
  const typeName = typeSlugToName(type);
  if (!typeName) notFound();

  const items = await getItemsByType(session.user.id, typeName);

  const label = typeName.charAt(0).toUpperCase() + typeName.slice(1) + 's';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{label}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
        </div>
      ) : (
        <ItemCardsWithDrawer items={items} />
      )}
    </div>
  );
}
