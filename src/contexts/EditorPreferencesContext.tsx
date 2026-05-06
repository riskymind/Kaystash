'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from '@/types/editor-preferences';

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  setPreferences: (prefs: EditorPreferences) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  setPreferences: () => {},
});

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: ReactNode;
  initialPreferences?: Partial<EditorPreferences>;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>({
    ...DEFAULT_EDITOR_PREFERENCES,
    ...initialPreferences,
  });

  return (
    <EditorPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
