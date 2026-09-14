'use client';

import { useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { generateSummaryAction } from '@/actions/ai';

interface SummaryButtonProps {
  title: string;
  content?: string;
  url?: string;
  fileName?: string;
  onGenerated: (summary: string) => void;
  isPro: boolean;
  disabled?: boolean;
}

export function SummaryButton({
  title,
  content,
  url,
  fileName,
  onGenerated,
  isPro,
  disabled,
}: SummaryButtonProps) {
  const [loading, setLoading] = useState(false);

  // Pro-only feature — hide the trigger entirely for free users (server-side
  // gating in generateSummaryAction is what actually enforces this).
  if (!isPro) return null;

  const hasSourceMaterial = Boolean(content?.trim() || url?.trim() || fileName?.trim());

  async function handleGenerate() {
    if (!title.trim()) {
      toast.error('Add a title before generating a summary.');
      return;
    }
    if (!hasSourceMaterial) {
      toast.error('Add some content, a URL, or a file before generating a summary.');
      return;
    }

    setLoading(true);
    const result = await generateSummaryAction({ title, content, url, fileName });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onGenerated(result.data.summary);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0 text-muted-foreground"
      onClick={handleGenerate}
      disabled={loading || disabled || !title.trim() || !hasSourceMaterial}
      title="Generate AI summary"
    >
      <WandSparkles className={`size-3.5 ${loading ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
