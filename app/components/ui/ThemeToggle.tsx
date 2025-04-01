import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore, toggleTheme } from '~/lib/stores/theme';
import { IconButton } from './IconButton';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = memo(({ className }: ThemeToggleProps) => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    domLoaded && (
      <button
        className={`flex items-center justify-center p-1 rounded-md hover:bg-bolt-elements-item-backgroundActive transition-colors ${className}`}
        onClick={handleToggle}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className={theme === 'dark' ? 'i-ph:sun-bold' : 'i-ph:moon-bold'} style={{ fontSize: '1.25rem' }}></div>
      </button>
    )
  );
}); 