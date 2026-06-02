import React from 'react';
import { useTheme } from '../context/ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from './ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-full border border-border/40 backdrop-blur-md">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
        className={`h-8 w-8 rounded-full ${
          theme === 'light' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modo Claro"
      >
        <Sun className="h-4.5 w-4.5" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
        className={`h-8 w-8 rounded-full ${
          theme === 'dark' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modo Oscuro"
      >
        <Moon className="h-4.5 w-4.5" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('system')}
        className={`h-8 w-8 rounded-full ${
          theme === 'system' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modo Sistema"
      >
        <Laptop className="h-4.5 w-4.5" />
      </Button>
    </div>
  );
};
