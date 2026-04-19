import { DashboardShell } from '@/components/layout/DashboardShell';
import { getSidebarCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: replace with session user once auth is wired up
  const demoUser = await prisma.user.findUnique({ where: { email: 'kele@kaystash.io' } });

  const [itemTypes, sidebarCollections] = demoUser
    ? await Promise.all([
        getItemTypesWithCounts(demoUser.id),
        getSidebarCollections(demoUser.id),
      ])
    : [[], []];

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections}>
      {children}
    </DashboardShell>
  );
}
