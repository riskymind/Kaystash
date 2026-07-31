import { FileText, FileJson, FileCode, FileSpreadsheet, FileCog, File, Download, Star, Pin } from 'lucide-react';
import { ItemForDashboard } from '@/lib/db/items';
import { formatFileSize, getFileIconName } from '@/lib/constants/file-upload';

const ICON_MAP = {
  FileText,
  FileJson,
  FileCode,
  FileSpreadsheet,
  FileCog,
  File,
} as const;

type IconName = keyof typeof ICON_MAP;

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function FileListItem({
  item,
  onClick,
}: {
  item: ItemForDashboard;
  onClick?: (id: string) => void;
}) {
  const Icon = ICON_MAP[getFileIconName(item.fileName) as IconName];

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => onClick?.(item.id)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{item.title}</span>
            {item.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />}
            {item.isPinned && <Pin className="size-3 text-muted-foreground shrink-0" />}
          </div>
          {item.fileName && <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-11 sm:pl-0 shrink-0">
        <span className="text-xs text-muted-foreground">
          {item.fileSize != null ? formatFileSize(item.fileSize) : '—'}
        </span>
        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
        {item.fileUrl && (
          <a
            href={item.fileUrl}
            download={item.fileName ?? undefined}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Download"
          >
            <Download className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
