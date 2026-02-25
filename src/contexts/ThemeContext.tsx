import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  searchShortcut: 'ctrl-k' | 'cmd-f';
  setSearchShortcut: (shortcut: 'ctrl-k' | 'cmd-f') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('blink-theme') as Theme;
    return savedTheme || 'light';
  });

  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('blink-animations');
    return saved !== null ? saved === 'true' : true;
  });

  const [searchShortcut, setSearchShortcutState] = useState<'ctrl-k' | 'cmd-f'>(() => {
    const saved = localStorage.getItem('blink-search-shortcut') as 'ctrl-k' | 'cmd-f';
    return saved || 'ctrl-k';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('blink-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (animationsEnabled) {
      root.classList.add('animations-enabled');
    } else {
      root.classList.remove('animations-enabled');
    }
    localStorage.setItem('blink-animations', String(animationsEnabled));
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem('blink-search-shortcut', searchShortcut);
  }, [searchShortcut]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  const setSearchShortcut = (shortcut: 'ctrl-k' | 'cmd-f') => {
    setSearchShortcutState(shortcut);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    animationsEnabled,
    toggleAnimations,
    searchShortcut,
    setSearchShortcut
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
