import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center p-5 border-b h-[var(--header-height)] sticky top-0 z-20', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <img 
          src="/logo.gif" 
          alt="Nexus AI Logo" 
          className="w-6 h-6 invert dark:invert-0"
        />
        <a href="/" className="text-2xl font-light tracking-wider text-bolt-elements-textPrimary flex items-center font-mono">
          NEXUS AI
        </a>
      </div>
      {chat.started ? (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      ) : (
        <div className="flex-1"></div>
      )}
      
      {/* X icon only - removed theme toggle */}
      <div className="flex items-center">
        <a 
          href="https://x.com/NexusAIDEV" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center p-1 text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive rounded-md transition-colors"
        >
          <div className="i-ph:twitter-logo text-xl"></div>
        </a>
      </div>
    </header>
  );
}
