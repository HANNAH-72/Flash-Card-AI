import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage, default to dark for the default SaaS appearance
    const saved = localStorage.getItem("theme");
    if (saved && ["light", "dark", "purple", "ocean", "emerald"].includes(saved)) {
      return saved;
    }
    
    // Fallback to system preferences for dark mode check
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove(
      "dark",
      "theme-light", 
      "theme-dark", 
      "theme-purple", 
      "theme-ocean", 
      "theme-emerald"
    );
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Add standard 'dark' utility class if it is a dark-based theme (all except light)
    if (theme !== "light") {
      root.classList.add("dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Allows setting any of the 5 themes directly
  const changeTheme = (newTheme) => {
    if (["light", "dark", "purple", "ocean", "emerald"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
