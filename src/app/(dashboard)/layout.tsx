import { DashboardShell } from '@/components/layout/DashboardShell';
import { getSidebarCollections, getSearchCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts, getSearchItems } from '@/lib/db/items';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const [itemTypes, sidebarCollections, searchItems, searchCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getSearchItems(userId),
    getSearchCollections(userId),
  ]);

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      searchItems={searchItems}
      searchCollections={searchCollections}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
