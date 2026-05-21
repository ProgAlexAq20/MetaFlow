import React, { createContext, useState, useEffect } from 'react';
import { THEMES } from '../data/constants';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('azure-premium');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('metaflow_theme') || 'azure-premium';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    const theme = THEMES[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-card', theme.card);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);

    // Update body background
    document.body.style.backgroundColor = theme.background;
  };

  const changeTheme = async (themeName) => {
    if (!THEMES[themeName]) return;
    
    setCurrentTheme(themeName);
    applyTheme(themeName);
    
    // Save to localStorage
    localStorage.setItem('metaflow_theme', themeName);
  };

  const value = {
    currentTheme,
    theme: THEMES[currentTheme],
    themes: THEMES,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
