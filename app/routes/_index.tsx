import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Header } from '~/components/header/Header';
import { Waves } from '~/components/ui/waves-background';
import { AIFeatureShowcase } from '~/components/ui/AIFeatureShowcase';
import { GlowingEffect } from '~/components/ui/GlowingEffect';
import { cn } from '~/lib/utils';
import { toggleTheme } from '~/lib/stores/theme';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { RoadmapSection } from '~/components/ui/RoadmapSection';
import { ChessGame } from '~/components/ui/ChessGame';
import ContractAddress from '~/components/ui/ContractAddress';

export const meta: MetaFunction = () => {
  return [
    { title: 'Nexus AI' },
    { name: 'description', content: 'Your intelligent coding assistant powered by AI' }
  ];
};

export const loader = () => json({});

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
  
  const handleThemeToggle = () => {
    toggleTheme();
  };

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
      
      {/* Top Header with Theme Toggle and Twitter X Icon */}
      <div className="flex items-center justify-between p-5 relative z-10">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.gif" 
            alt="Nexus AI Logo" 
            className="w-6 h-6 invert dark:invert-0"
          />
          <span className="text-xl font-light tracking-wider text-bolt-elements-textPrimary font-mono">
            NEXUS AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={handleThemeToggle}
              className="flex items-center justify-center p-2 text-bolt-elements-textPrimary hover:scale-110 transition-transform"
              style={{ background: 'none', border: 'none', outline: 'none' }}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={theme === 'dark' ? 'i-ph:sun-bold' : 'i-ph:moon-bold'} style={{ fontSize: '1.5rem' }}></div>
            </button>
          </div>
          <div className="relative">
            <a 
              href="https://x.com/NexusAIDEV" 
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer z-10 rounded-md hover:bg-bolt-elements-item-backgroundActive"
              aria-label="Follow us on Twitter/X"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-bolt-elements-textPrimary fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 relative z-10">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="flex-1 text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-bolt-elements-textPrimary">
              Build Faster with <span className="block">Nexus AI</span>
            </h1>
            <p className="text-xl mb-8 text-bolt-elements-textSecondary">
              Your intelligent coding assistant powered by advanced AI technology.
              Build, debug, and deploy your projects with ease.
            </p>
            <div className="relative inline-block">
              <Link 
                to="/chat" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium rounded-lg hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text transition-theme relative border border-bolt-elements-button-primary-background"
              >
                <span className="i-ph:robot w-5 h-5" />
                Use AI Agent
              </Link>
              <GlowingEffect 
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
                variant="white"
              />
            </div>
          </div>
        </div>
        
        {/* AI Feature Showcase */}
        <AIFeatureShowcase />
        
        {/* Contract Address */}
        <ContractAddress />
        
        <h2 className="text-2xl font-bold mb-8 text-bolt-elements-textPrimary mt-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <FeatureCard 
            icon="i-ph:code-bold" 
            title="Smart Code Generation" 
            description="Generate code in multiple languages with intelligent context understanding."
          />
          <FeatureCard 
            icon="i-ph:bug-beetle-bold" 
            title="Debugging Assistant" 
            description="Identify and fix bugs quickly with AI-powered analysis."
          />
          <FeatureCard 
            icon="i-ph:rocket-launch-bold" 
            title="Project Acceleration" 
            description="Build complete projects from scratch with guided assistance."
          />
        </div>
        
        {/* Spacer before Roadmap */}
        <div className="h-32"></div>
        
        {/* Roadmap 2025 Section - Moved to bottom of page */}
        <RoadmapSection />
      </main>
      
      <footer className="w-full border-t border-bolt-elements-borderColor py-8 mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.gif" 
                alt="Nexus AI Logo" 
                className="w-6 h-6 invert dark:invert-0"
              />
              <span className="text-lg font-light tracking-wider text-bolt-elements-textPrimary font-mono">
                NEXUS AI
              </span>
            </div>
            
            <div className="flex gap-6">
              <div className="relative inline-block">
                <Link to="/chat" className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-theme relative">
                  Chat
                </Link>
                <GlowingEffect 
                  spread={30}
                  glow={true}
                  disabled={false}
                  proximity={40}
                  inactiveZone={0.01}
                  borderWidth={2}
                  variant="white"
                />
              </div>
              <div className="relative inline-block">
                <a href="#" className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-theme relative">
                  Documentation
                </a>
                <GlowingEffect 
                  spread={30}
                  glow={true}
                  disabled={false}
                  proximity={40}
                  inactiveZone={0.01}
                  borderWidth={2}
                  variant="white"
                />
              </div>
              <div className="relative inline-block">
                <a href="#" className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-theme relative">
                  GitHub
                </a>
                <GlowingEffect 
                  spread={30}
                  glow={true}
                  disabled={false}
                  proximity={40}
                  inactiveZone={0.01}
                  borderWidth={2}
                  variant="white"
                />
              </div>
            </div>
            
            <div className="text-sm text-bolt-elements-textTertiary">
              © {new Date().getFullYear()} Nexus AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="relative p-6 rounded-lg border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorActive transition-theme">
      <GlowingEffect 
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        variant="white"
      />
      <div className={cn(icon, "w-10 h-10 mb-4 text-bolt-elements-textPrimary")} />
      <h3 className="text-xl font-medium mb-2 text-bolt-elements-textPrimary">{title}</h3>
      <p className="text-bolt-elements-textSecondary">{description}</p>
    </div>
  );
}
