'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // return (
  //   <Button
  //     variant="ghost"
  //     size="sm"
  //     onClick={toggleTheme}
  //     className="relative h-10 w-10 p-0 transition-all duration-300"
  //     aria-label="Toggle theme"
  //   >
  //     <span
  //       className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
  //         theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
  //       }`}
  //     >
  //       <Moon className="h-5 w-5 text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]" />
  //     </span>

  //     <span
  //       className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
  //         theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
  //       }`}
  //     >
  //       <Sun className="h-5 w-5 text-[color:var(--logo-gold)]" />
  //     </span>
  //   </Button>
  // );
}
