export type EditorTheme = 'vs-dark' | 'monokai' | 'github-dark';
export type EditorWordWrap = 'on' | 'off';

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: EditorWordWrap;
  minimap: boolean;
  theme: EditorTheme;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: 'on',
  minimap: false,
  theme: 'vs-dark',
};

export const FONT_SIZE_OPTIONS = [11, 12, 13, 14, 15, 16, 18] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;
export const THEME_OPTIONS: { value: EditorTheme; label: string }[] = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github-dark', label: 'GitHub Dark' },
];
