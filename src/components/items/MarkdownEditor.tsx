'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const MAX_HEIGHT = 400;

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  placeholder = 'Write markdown here…',
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : 'write');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
          {!readOnly && (
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

      {/* Preview tab */}
      {(tab === 'preview' || readOnly) && (
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
    </div>
  );
}
