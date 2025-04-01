import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { GitUrlImport } from '~/components/git/GitUrlImport.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Waves } from '~/components/ui/waves-background';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Nexus AI' },
    { name: 'description', content: 'Talk with Nexus AI, your intelligent coding assistant' }
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  return json({ url: args.params.url });
}

export default function Index() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    // Check if the document has a data-theme attribute
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'light' || dataTheme === 'dark') {
      setTheme(dataTheme);
    }
    
    // Set up a mutation observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme as 'light' | 'dark');
          }
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <div className="absolute inset-0 z-0">
        <Waves 
          lineColor={theme === 'dark' ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
          className="animate-wave-pulse"
        />
      </div>
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <GitUrlImport />}</ClientOnly>
    </div>
  );
}
