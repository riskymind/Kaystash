'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useEditorPreferences } from '@/contexts/EditorPreferencesContext';
import { updateEditorPreferencesAction } from '@/actions/settings';
import {
  EditorPreferences,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
} from '@/types/editor-preferences';

export function EditorPreferencesForm() {
  const { preferences, setPreferences } = useEditorPreferences();
  const [isPending, startTransition] = useTransition();

  function handleChange<K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    startTransition(async () => {
      const result = await updateEditorPreferencesAction(updated);
      if (result.success) {
        toast.success('Editor preferences saved.');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Font Size */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Font size</p>
          <p className="text-xs text-muted-foreground">Code editor font size in pixels.</p>
        </div>
        <select
          value={preferences.fontSize}
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
          disabled={isPending}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          {FONT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Tab Size */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Tab size</p>
          <p className="text-xs text-muted-foreground">Number of spaces per indentation level.</p>
        </div>
        <select
          value={preferences.tabSize}
          onChange={(e) => handleChange('tabSize', Number(e.target.value))}
          disabled={isPending}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          {TAB_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} spaces
            </option>
          ))}
        </select>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground">Color theme for the code editor.</p>
        </div>
        <select
          value={preferences.theme}
          onChange={(e) =>
            handleChange('theme', e.target.value as EditorPreferences['theme'])
          }
          disabled={isPending}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          {THEME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Word wrap</p>
          <p className="text-xs text-muted-foreground">Wrap long lines in the editor.</p>
        </div>
        <button
          role="switch"
          aria-checked={preferences.wordWrap === 'on'}
          onClick={() =>
            handleChange('wordWrap', preferences.wordWrap === 'on' ? 'off' : 'on')
          }
          disabled={isPending}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            preferences.wordWrap === 'on' ? 'bg-primary' : 'bg-input',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
              preferences.wordWrap === 'on' ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Minimap */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Minimap</p>
          <p className="text-xs text-muted-foreground">Show code overview on the right side.</p>
        </div>
        <button
          role="switch"
          aria-checked={preferences.minimap}
          onClick={() => handleChange('minimap', !preferences.minimap)}
          disabled={isPending}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            preferences.minimap ? 'bg-primary' : 'bg-input',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
              preferences.minimap ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  );
}
