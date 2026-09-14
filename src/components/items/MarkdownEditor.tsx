'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { optimizePromptAction } from '@/actions/ai';

interface MarkdownEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  // AI "Optimize Prompt" — drawer read view only (see enableOptimize).
  title?: string;
  isPro?: boolean;
  enableOptimize?: boolean;
  onOptimized?: (optimizedPrompt: string) => void;
}

const MAX_HEIGHT = 400;

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  placeholder = 'Write markdown here…',
  title,
  isPro = false,
  enableOptimize = false,
  onOptimized,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview' | 'optimized'>(
    readOnly ? 'preview' : 'write'
  );
  const [copied, setCopied] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleOptimize() {
    if (optimizing) return;
    setOptimizing(true);
    const result = await optimizePromptAction({ title: title ?? '', content: value });
    setOptimizing(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setOptimizedPrompt(result.data.optimizedPrompt);
    setTab('optimized');
  }

  function handleUseOptimized() {
    if (!optimizedPrompt) return;
    onOptimized?.(optimizedPrompt);
    setOptimizedPrompt(null);
    setTab(readOnly ? 'preview' : 'write');
  }

  function handleKeepOriginal() {
    setOptimizedPrompt(null);
    setTab(readOnly ? 'preview' : 'write');
  }

  const showOptimizedTab = enableOptimize && optimizedPrompt !== null;

  return (
    <div className="rounded-md overflow-hidden border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#404040]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex items-center gap-3">
          {!readOnly && !showOptimizedTab && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setTab('write')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  tab === 'write'
                    ? 'bg-[#404040] text-[#cccccc]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  tab === 'preview'
                    ? 'bg-[#404040] text-[#cccccc]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                Preview
              </button>
            </div>
          )}
          {showOptimizedTab && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  tab === 'preview'
                    ? 'bg-[#404040] text-[#cccccc]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setTab('optimized')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  tab === 'optimized'
                    ? 'bg-[#404040] text-[#cccccc]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                Optimized
              </button>
            </div>
          )}

          {enableOptimize &&
            (isPro ? (
              <button
                type="button"
                onClick={handleOptimize}
                disabled={optimizing}
                className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors disabled:opacity-50"
                title="Optimize this prompt with AI"
              >
                {optimizing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {optimizing ? 'Optimizing…' : 'Optimize'}
              </button>
            ) : (
              <span
                className="flex items-center text-[#858585]"
                title="AI features require Pro subscription"
              >
                <Crown className="size-3.5" />
              </span>
            ))}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Copy"
          >
            {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Write tab */}
      {tab === 'write' && !readOnly && (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{ maxHeight: MAX_HEIGHT }}
          className="w-full min-h-[120px] bg-[#1e1e1e] text-[#d4d4d4] text-sm font-mono px-4 py-3 resize-y focus:outline-none placeholder:text-[#858585]"
        />
      )}

      {/* Preview tab (original content) */}
      {tab === 'preview' && (
        <div
          style={{ maxHeight: MAX_HEIGHT }}
          className="overflow-y-auto px-4 py-3 min-h-[120px]"
        >
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-[#858585] italic">Nothing to preview.</p>
          )}
        </div>
      )}

      {/* Optimized tab */}
      {showOptimizedTab && tab === 'optimized' && (
        <div>
          <div
            style={{ maxHeight: MAX_HEIGHT }}
            className="overflow-y-auto px-4 py-3 min-h-[120px]"
          >
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedPrompt}</ReactMarkdown>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-[#404040] bg-[#2d2d2d]">
            <button
              type="button"
              onClick={handleKeepOriginal}
              className="px-2.5 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
            >
              Keep original
            </button>
            <button
              type="button"
              onClick={handleUseOptimized}
              className="px-2.5 py-1 rounded text-xs bg-[#404040] text-[#cccccc] hover:bg-[#4a4a4a] transition-colors"
            >
              Use this version
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
