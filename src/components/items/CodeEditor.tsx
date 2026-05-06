'use client';

import { useState } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';
import { useEditorPreferences } from '@/contexts/EditorPreferencesContext';

// Register monokai and github-dark themes on first load
loader.init().then((monaco) => {
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorLineNumber.foreground': '#75715e',
      'editor.selectionBackground': '#49483e',
    },
  });

  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'e6edf3' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e6edf3',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#6e7681',
      'editor.selectionBackground': '#264f78',
    },
  });
});

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
  const { preferences } = useEditorPreferences();

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

      <div style={{ height: editorHeight }}>
        <Editor
          height="100%"
          value={value}
          language={language?.toLowerCase() ?? 'plaintext'}
          theme={preferences.theme}
          options={{
            readOnly,
            minimap: { enabled: preferences.minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: preferences.fontSize,
            tabSize: preferences.tabSize,
            lineHeight: Math.round(preferences.fontSize * 1.6),
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            padding: { top: 12, bottom: 12 },
            wordWrap: preferences.wordWrap,
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
