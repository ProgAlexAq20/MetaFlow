import React, { createContext, useState, useEffect, useContext } from 'react';
import { THEMES } from '../data/constants';
import { DataContext } from './DataProvider';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { settings, updateSettings } = useContext(DataContext);
  const [currentTheme, setCurrentTheme] = useState('azure-premium');

  // Load theme from settings
  useEffect(() => {
    if (settings?.theme) {
      setCurrentTheme(settings.theme);
      applyTheme(settings.theme);
    } else {
      applyTheme('azure-premium');
    }
  }, [settings]);

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
    
    // Save to settings
    if (updateSettings) {
      try {
        await updateSettings({ theme: themeName });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
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
