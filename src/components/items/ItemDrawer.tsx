'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Box,
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  FolderOpen,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ItemDetail } from '@/lib/db/items';
import { updateItemAction, deleteItemAction } from '@/actions/items';

const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const;

type IconName = keyof typeof ICON_MAP;

const TEXT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const LANGUAGE_TYPES = ['snippet', 'command'];

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-8 w-16 bg-muted rounded-md" />
        <div className="h-8 w-16 bg-muted rounded-md" />
        <div className="ml-auto h-8 w-8 bg-muted rounded-md" />
        <div className="h-8 w-8 bg-muted rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? '',
    tags: item.tags.join(', '),
  };
}

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsEditing(false);
      setEditState(null);
      return;
    }

    setLoading(true);
    setItem(null);
    setIsEditing(false);
    setEditState(null);

    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  function startEditing() {
    if (!item) return;
    setEditState(itemToEditState(item));
    setFieldErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    if (!item) return;
    setEditState(itemToEditState(item));
    setFieldErrors({});
    setIsEditing(false);
  }

  async function handleSave() {
    if (!item || !editState) return;

    setSaving(true);
    setFieldErrors({});

    const tags = editState.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItemAction(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
      return;
    }

    setItem(result.data);
    setIsEditing(false);
    toast.success('Item saved.');
    router.refresh();
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    const result = await deleteItemAction(item.id);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Item deleted.');
    onClose();
    router.refresh();
  }

  function patch(key: keyof EditState, value: string) {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const Icon = item ? (ICON_MAP[item.itemType.icon as IconName] ?? Box) : Box;
  const color = item?.itemType.color ?? '#6b7280';
  const typeName = item?.itemType.name ?? '';
  const showContent = TEXT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = typeName === 'link';

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50';
  const labelClass = 'text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block';

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0" side="right">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="sr-only">
            {item ? item.title : 'Item detail'}
          </SheetTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {item && (
              <>
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <Icon className="size-3.5" />
                  {item.itemType.name.charAt(0).toUpperCase() + item.itemType.name.slice(1)}s
                </div>
                {item.language && !isEditing && (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </>
            )}
            {loading && (
              <div className="h-6 w-20 bg-muted rounded-md animate-pulse" />
            )}
          </div>
        </SheetHeader>

        {loading && <DrawerSkeleton />}

        {!loading && item && !isEditing && (
          <div className="flex flex-col gap-6 p-6">
            {/* Title */}
            <h2 className="text-base font-semibold leading-tight">{item.title}</h2>

            {/* Action bar — view mode */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.isFavorite
                    ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Favorite"
              >
                <Star className={`size-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                Favorite
              </button>

              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.isPinned
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Pin"
              >
                <Pin className="size-3.5" />
                Pin
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Copy"
              >
                <Copy className="size-3.5" />
                Copy
              </button>

              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={startEditing}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete"
                        disabled={deleting}
                      />
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &ldquo;{item.title}&rdquo;. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? 'Deleting…' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
              </section>
            )}

            {/* Content */}
            {item.content && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Content
                </p>
                <pre className="text-xs bg-muted rounded-md p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono leading-relaxed">
                  {item.content}
                </pre>
              </section>
            )}

            {/* URL */}
            {item.url && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  URL
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {item.url}
                </a>
              </section>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Collections */}
            {item.collections.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Collections
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.collections.map((col) => (
                    <span
                      key={col.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                    >
                      <FolderOpen className="size-3" />
                      {col.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Details */}
            <section className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Details
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Created
                  </span>
                  <span className="text-foreground/70">{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Updated
                  </span>
                  <span className="text-foreground/70">{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {!loading && item && isEditing && editState && (
          <div className="flex flex-col gap-6 p-6">
            {/* Action bar — edit mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || editState.title.trim() === ''}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="size-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <X className="size-3.5" />
                Cancel
              </button>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={editState.title}
                onChange={(e) => patch('title', e.target.value)}
                placeholder="Item title"
                className={inputClass}
                disabled={saving}
              />
              {fieldErrors.title && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={editState.description}
                onChange={(e) => patch('description', e.target.value)}
                placeholder="Optional description"
                rows={3}
                className={`${inputClass} resize-none`}
                disabled={saving}
              />
            </div>

            {/* Content — text types only */}
            {showContent && (
              <div>
                <label className={labelClass}>Content</label>
                <textarea
                  value={editState.content}
                  onChange={(e) => patch('content', e.target.value)}
                  placeholder="Paste your content here"
                  rows={8}
                  className={`${inputClass} resize-y font-mono text-xs`}
                  disabled={saving}
                />
              </div>
            )}

            {/* Language — snippet + command only */}
            {showLanguage && (
              <div>
                <label className={labelClass}>Language</label>
                <input
                  type="text"
                  value={editState.language}
                  onChange={(e) => patch('language', e.target.value)}
                  placeholder="e.g. typescript"
                  className={inputClass}
                  disabled={saving}
                />
              </div>
            )}

            {/* URL — link only */}
            {showUrl && (
              <div>
                <label className={labelClass}>URL</label>
                <input
                  type="url"
                  value={editState.url}
                  onChange={(e) => patch('url', e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                  disabled={saving}
                />
                {fieldErrors.url && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.url[0]}</p>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags</label>
              <input
                type="text"
                value={editState.tags}
                onChange={(e) => patch('tags', e.target.value)}
                placeholder="react, hooks, typescript"
                className={inputClass}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>

            {/* Non-editable: Collections */}
            {item.collections.length > 0 && (
              <div>
                <label className={labelClass}>Collections</label>
                <div className="flex flex-wrap gap-1.5">
                  {item.collections.map((col) => (
                    <span
                      key={col.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                    >
                      <FolderOpen className="size-3" />
                      {col.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Non-editable: Dates */}
            <section className="border-t border-border pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Created
                  </span>
                  <span className="text-foreground/70">{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Updated
                  </span>
                  <span className="text-foreground/70">{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
