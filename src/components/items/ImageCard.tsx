import { ImageOff, Star, Pin } from 'lucide-react';
import { ItemForDashboard } from '@/lib/db/items';

export function ImageCard({
  item,
  onClick,
}: {
  item: ItemForDashboard;
  onClick?: (id: string) => void;
}) {
  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
      onClick={() => onClick?.(item.id)}
    >
      {item.fileUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.fileUrl}
          alt={item.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-muted">
          <ImageOff className="size-6 text-muted-foreground" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
        <p className="truncate text-xs font-medium text-white">{item.title}</p>
      </div>

      {(item.isFavorite || item.isPinned) && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {item.isFavorite && <Star className="size-3.5 fill-yellow-400 text-yellow-400 drop-shadow" />}
          {item.isPinned && <Pin className="size-3.5 fill-white text-white drop-shadow" />}
        </div>
      )}
    </div>
  );
}
