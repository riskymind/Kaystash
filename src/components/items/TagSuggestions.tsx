'use client';

import { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateAutoTagsAction } from '@/actions/ai';

interface TagSuggestionsProps {
  title: string;
  content: string;
  existingTags: string[];
  onAccept: (tag: string) => void;
  isPro: boolean;
  disabled?: boolean;
}

export function TagSuggestions({
  title,
  content,
  existingTags,
  onAccept,
  isPro,
  disabled,
}: TagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Pro-only feature — hide the trigger entirely for free users (server-side
  // gating in generateAutoTagsAction is what actually enforces this).
  if (!isPro) return null;

  async function handleSuggest() {
    if (!title.trim()) {
      toast.error('Add a title before requesting tag suggestions.');
      return;
    }

    setLoading(true);
    setSuggestions([]);
    const result = await generateAutoTagsAction({ title, content });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const fresh = result.data.tags.filter((tag) => !existingTags.includes(tag));
    if (fresh.length === 0) {
      toast.info('No new tag suggestions.');
      return;
    }
    setSuggestions(fresh);
  }

  function accept(tag: string) {
    onAccept(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function reject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={handleSuggest}
        disabled={loading || disabled}
      >
        <Sparkles className="size-3.5" />
        {loading ? 'Suggesting…' : 'Suggest Tags'}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-0.5 pr-1 border-dashed">
              {tag}
              <button
                type="button"
                onClick={() => accept(tag)}
                className="p-0.5 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                title="Accept"
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => reject(tag)}
                className="p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                title="Reject"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
