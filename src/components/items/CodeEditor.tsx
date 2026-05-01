'use client';

import { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

export function CodeEditor({ value, language, readOnly = false, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const handleMount: OnMount = (editor) => {
    const updateHeight = () => {
      const next = Math.min(Math.max(editor.getContentHeight(), MIN_HEIGHT), MAX_HEIGHT);
      setEditorHeight((prev) => (prev === next ? prev : next));
    };
    updateHeight();
    editor.onDidContentSizeChange(updateHeight);
  };

  return (
    <div className="rounded-md overflow-hidden border border-border bg-[#1e1e1e]">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#404040]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="text-xs text-[#858585] font-mono">{language}</span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Copy"
          >
            {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Wrapper div drives the height; Monaco fills it via height="100%" */}
      <div style={{ height: editorHeight }}>
        <Editor
          height="100%"
          value={value}
          language={language?.toLowerCase() ?? 'plaintext'}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            lineHeight: 20,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            overviewRulerLanes: 0,
            renderLineHighlight: readOnly ? 'none' : 'line',
            contextmenu: false,
            folding: false,
            lineNumbers: readOnly ? 'off' : 'on',
            glyphMargin: false,
            lineDecorationsWidth: readOnly ? 0 : 4,
            lineNumbersMinChars: readOnly ? 0 : 3,
          }}
          onChange={(v) => onChange?.(v ?? '')}
          onMount={handleMount}
        />
      </div>
    </div>
  );
}
