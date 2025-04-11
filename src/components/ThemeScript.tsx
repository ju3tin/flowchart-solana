"use client";

import { useEffect } from "react";

// This component is used to synchronize the theme immediately
// before React hydration occurs to avoid flicker
export function ThemeScript() {
  // This is now handled by next-themes ThemeProvider
  /*
  useEffect(() => {
    // Check for system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    
    // Apply theme:
    // 1. Use saved theme if available
    // 2. Fall back to system preference if enabled
    // 3. Default to dark mode (matches defaultTheme in ColorModeProvider)
    const theme = savedTheme || "dark"; // Always default to dark to match ColorModeProvider
    
    // Ensure html element has the correct class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save the current theme to localStorage
    if (!savedTheme) {
      localStorage.setItem("theme", theme);
    }
  }, []);
  */
  
  return null;
} 