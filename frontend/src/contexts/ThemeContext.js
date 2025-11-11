// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cms/theme');
      if (!response.ok) throw new Error('Failed to fetch theme');

      const data = await response.json();

      // backend return: { status: "success", theme: {...} }
      if (data.status === 'success' && data.theme) {
        setTheme(data.theme);
      } else {
        setTheme(getDefaultTheme());
      }
    } catch (err) {
      console.error('Theme Error:', err);
      setTheme(getDefaultTheme());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    if (theme) applyTheme(theme);
  }, [theme]);

  const updateTheme = async (newTheme) => {
    try {
      const response = await fetch('http://localhost:5000/api/cms/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme: newTheme }),
      });

      const data = await response.json();

      // backend return: { status: "success", theme: {...} }
      if (data.status === 'success' && data.theme) {
        setTheme(data.theme); // update langsung biar instant
        return { status: 'success' };
      }
      return { status: 'error', message: data.message || 'Update failed' };
    } catch (err) {
      console.error('Update Theme Error:', err);
      return { status: 'error', message: err.message };
    }
  };

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    if (themeData.colors) {
      root.style.setProperty('--primary-color', themeData.colors.primary || '#667eea');
      root.style.setProperty('--secondary-color', themeData.colors.secondary || '#764ba2');
      root.style.setProperty('--accent-color', themeData.colors.accent || '#4CAF50');
      root.style.setProperty('--text-color', themeData.colors.text || '#333333');
      root.style.setProperty('--background-color', themeData.colors.background || '#ffffff');
    }
    if (themeData.fontFamily) {
      root.style.setProperty('--font-family', themeData.fontFamily);
    }
  };

  const getDefaultTheme = () => ({
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#4CAF50',
      text: '#333333',
      background: '#ffffff',
    },
    fontFamily: 'Segoe UI, sans-serif',
  });

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        updateTheme,
        refreshTheme: fetchTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider };
