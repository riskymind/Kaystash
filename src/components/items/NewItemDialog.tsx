'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Code, Sparkles, Terminal, StickyNote, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createItemAction } from '@/actions/items';
import { CodeEditor } from './CodeEditor';
import { MarkdownEditor } from './MarkdownEditor';

const ITEM_TYPES = [
  { name: 'snippet', label: 'Snippet', icon: Code, color: '#3b82f6' },
  { name: 'prompt', label: 'Prompt', icon: Sparkles, color: '#8b5cf6' },
  { name: 'command', label: 'Command', icon: Terminal, color: '#f97316' },
  { name: 'note', label: 'Note', icon: StickyNote, color: '#fde047' },
  { name: 'link', label: 'Link', icon: Link, color: '#10b981' },
] as const;

type ItemTypeName = (typeof ITEM_TYPES)[number]['name'];

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Shell', 'SQL', 'Other'];

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Array<{ id: string; name: string }>;
}

export function NewItemDialog({ open, onOpenChange, collections }: NewItemDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedType, setSelectedType] = useState<ItemTypeName>('snippet');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [codeContent, setCodeContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  const showContent = selectedType !== 'link';
  const showLanguage = selectedType === 'snippet' || selectedType === 'command';
  const showUrl = selectedType === 'link';
  const useCodeEditor = selectedType === 'snippet' || selectedType === 'command';
  const useMarkdownEditor = selectedType === 'note' || selectedType === 'prompt';

  function handleOpenChange(next: boolean) {
    if (!next) {
      formRef.current?.reset();
      setSelectedType('snippet');
      setFieldErrors({});
      setCodeContent('');
      setMarkdownContent('');
      setLanguage('');
      setSelectedCollectionIds([]);
    }
    onOpenChange(next);
  }

  function handleTypeChange(name: ItemTypeName) {
    setSelectedType(name);
    setCodeContent('');
    setMarkdownContent('');
    setFieldErrors({});
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('type', selectedType);
    if (useCodeEditor) {
      formData.set('content', codeContent);
      formData.set('language', language);
    }
    if (useMarkdownEditor) {
      formData.set('content', markdownContent);
    }
    formData.set('collectionIds', JSON.stringify(selectedCollectionIds));

    startTransition(async () => {
      const result = await createItemAction(formData);
      if (result.success) {
        toast.success('Item created');
        handleOpenChange(false);
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        {/* Type selector */}
        <div className="flex gap-1.5 flex-wrap">
          {ITEM_TYPES.map(({ name, label, icon: Icon, color }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleTypeChange(name)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                selectedType === name
                  ? 'border-transparent bg-muted'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              <Icon className="size-3.5" style={{ color }} />
              {label}
            </button>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <Input
              name="title"
              placeholder="Title *"
              className="h-8 text-sm"
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Description */}
          <Input
            name="description"
            placeholder="Description (optional)"
            className="h-8 text-sm"
          />

          {/* URL — link type only */}
          {showUrl && (
            <div className="flex flex-col gap-1">
              <Input
                name="url"
                placeholder="URL *"
                className="h-8 text-sm"
                type="url"
              />
              {fieldErrors.url && (
                <p className="text-xs text-destructive">{fieldErrors.url[0]}</p>
              )}
            </div>
          )}

          {/* Language — snippet and command only (above editor so language is set before render) */}
          {showLanguage && (
            <select
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Language (optional)</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang.toLowerCase()}>
                  {lang}
                </option>
              ))}
            </select>
          )}

          {/* Content — all non-link types */}
          {showContent && (
            useCodeEditor ? (
              <CodeEditor
                value={codeContent}
                language={language || undefined}
                onChange={setCodeContent}
              />
            ) : useMarkdownEditor ? (
              <MarkdownEditor
                value={markdownContent}
                onChange={setMarkdownContent}
                placeholder="Write markdown here…"
              />
            ) : null
          )}

          {/* Tags */}
          <Input
            name="tags"
            placeholder="Tags (comma-separated)"
            className="h-8 text-sm"
          />

          {/* Collections */}
          {collections.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Collections</span>
              <div className="max-h-28 overflow-y-auto rounded-md border border-input bg-background p-2 space-y-1.5">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={selectedCollectionIds.includes(col.id)}
                      onChange={(e) =>
                        setSelectedCollectionIds((prev) =>
                          e.target.checked
                            ? [...prev, col.id]
                            : prev.filter((id) => id !== col.id),
                        )
                      }
                    />
                    <span className="text-sm">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter showCloseButton>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
