import React, { createContext, useContext } from 'react';

// Simplified theme context - removed theme switching since we're using light theme only
interface ThemeContextType {
  theme: 'light';
  setTheme: (theme: 'light') => void;
  effectiveTheme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ 
      theme: 'light', 
      setTheme: () => {}, 
      effectiveTheme: 'light' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}