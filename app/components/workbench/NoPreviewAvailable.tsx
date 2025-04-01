import React, { useState, useEffect } from 'react';

const messageConfig = [
  {
    text: "Select specific elements to modify",
    icon: "i-ph:cursor-click-bold"
  },
  {
    text: "Upload images as a reference",
    icon: "i-ph:image-square-bold"
  },
  {
    text: "Instantly preview your changes",
    icon: "i-ph:eye-bold"
  },
  {
    text: "Customize your workspace layout",
    icon: "i-ph:layout-bold"
  },
  {
    text: "Access powerful AI features",
    icon: "i-ph:brain-bold"
  },
  {
    text: "Create responsive designs",
    icon: "i-ph:devices-bold"
  }
];

export const NoPreviewAvailable = () => {
  const [visibleMessages, setVisibleMessages] = useState(messageConfig.slice(0, 3));
  const [isMoving, setIsMoving] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMoving(true);
      
      // Start fading after initial movement begins
      setTimeout(() => setIsFading(true), 300);
      
      setTimeout(() => {
        setVisibleMessages(prev => {
          const nextMessage = messageConfig[(messageConfig.indexOf(prev[2]) + 1) % messageConfig.length];
          return [...prev.slice(1), nextMessage];
        });
        setIsMoving(false);
        setTimeout(() => setIsFading(false), 50);
      }, 800);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bolt-elements-bg-depth-1">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo.gif" 
            alt="Nexus AI Logo" 
            className="w-16 h-16 invert dark:invert-0"
          />
          <span className="text-2xl font-light tracking-wider text-bolt-elements-textPrimary mt-2 font-mono">
            NEXUS AI
          </span>
          <h2 className="text-2xl font-light tracking-wider text-bolt-elements-textPrimary mt-4 font-mono">
            Spinning up preview...
          </h2>
        </div>
        <div className="h-[120px] relative overflow-hidden w-full">
          {visibleMessages.map((message, index) => (
            <div 
              key={message.text}
              className="absolute left-0 right-0 flex items-center justify-center gap-3 text-sm text-bolt-elements-textSecondary"
              style={{
                transform: `
                  translateY(${isMoving ? 
                    (index === 0 ? '-40px' : 
                     index === 2 ? (isFading ? '80px' : '100px') : 
                     '40px') : 
                    (index * 40)}px)
                  scale(${isMoving ? 
                    (index === 0 ? 0.8 : 
                     index === 2 ? (isFading ? 1 : 0.9) : 
                     1) : 
                    1})
                `,
                opacity: isMoving ? 
                  (index === 0 ? 0 : 
                   index === 2 ? (isFading ? 1 : 0) : 
                   1) : 
                  1,
                transition: `
                  transform ${index === 2 ? 700 : 600}ms cubic-bezier(0.2, 0.8, 0.2, 1),
                  opacity ${index === 2 ? 500 : 300}ms cubic-bezier(0.4, 0, 0.2, 1)
                `,
                transformOrigin: index === 0 ? 'center top' : 'center bottom'
              }}
            >
              <div className={`${message.icon} w-4 h-4`} />
              <span>{message.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 