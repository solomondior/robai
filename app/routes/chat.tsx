import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Waves } from '~/components/ui/waves-background';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Nexus AI - Chat' },
    { name: 'description', content: 'Talk with Nexus AI, your intelligent coding assistant' }
  ];
};

export const loader = () => json({});

export default function ChatRoute() {
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
    <div className="flex flex-col min-h-screen w-full bg-bolt-elements-background-depth-1">
      <div className="fixed inset-0 z-0">
        <BackgroundRays />
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
      <div className="flex-1 relative z-10">
        <ClientOnly fallback={<BaseChat />}>
          {() => <Chat />}
        </ClientOnly>
      </div>
    </div>
  );
} 