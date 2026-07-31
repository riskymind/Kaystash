'use client';

import { useState } from 'react';
import { ItemForDashboard } from '@/lib/db/items';
import { ItemCard } from './ItemCard';
import { ImageCard } from './ImageCard';
import { FileListItem } from './FileListItem';
import { ItemDrawer } from './ItemDrawer';

interface ItemCardsWithDrawerProps {
  items: ItemForDashboard[];
  collections: Array<{ id: string; name: string }>;
  isImageGrid?: boolean;
  isFileList?: boolean;
}

export function ItemCardsWithDrawer({ items, collections, isImageGrid, isFileList }: ItemCardsWithDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div
        className={
          isFileList
            ? 'flex flex-col gap-2'
            : isImageGrid
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'grid grid-cols-1 md:grid-cols-2 gap-3'
        }
      >
        {items.map((item) =>
          isFileList ? (
            <FileListItem key={item.id} item={item} onClick={setSelectedId} />
          ) : isImageGrid ? (
            <ImageCard key={item.id} item={item} onClick={setSelectedId} />
          ) : (
            <ItemCard key={item.id} item={item} onClick={setSelectedId} />
          ),
        )}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} collections={collections} />
    </>
  );
}
