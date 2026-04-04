'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';

export function ThemeToggle() {
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme: () => void = () => {};

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // During SSR or when ThemeProvider is not available, use default values
    console.warn('ThemeToggle used outside ThemeProvider, using default theme');
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-10 h-10 p-0 relative transition-all duration-300"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
          theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
        }`}
      >
        <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
          theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
        }`}
      >
        <Sun className="w-5 h-5 text-yellow-400" />
      </span>
    </Button>
  );
}
