'use client';

import { useState } from 'react';
import { ItemForDashboard } from '@/lib/db/items';
import { ItemCard } from './ItemCard';
import { ItemDrawer } from './ItemDrawer';

interface ItemCardsWithDrawerProps {
  items: ItemForDashboard[];
  collections: Array<{ id: string; name: string }>;
}

export function ItemCardsWithDrawer({ items, collections }: ItemCardsWithDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onClick={setSelectedId} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} collections={collections} />
    </>
  );
}
