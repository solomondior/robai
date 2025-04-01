import { useEffect, useRef, useState } from 'react';

export function RoadmapSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check if the user prefers light mode
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    setIsLightMode(!prefersDarkScheme.matches);

    // Listen for changes in color scheme preference
    const handleChange = (e: MediaQueryListEvent) => {
      setIsLightMode(!e.matches);
    };

    prefersDarkScheme.addEventListener("change", handleChange);
    return () => prefersDarkScheme.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // First make the section visible
          setSectionVisible(true);
          
          // Then show the title after a short delay
          setTimeout(() => {
            setTitleVisible(true);
          }, 300);
          
          // Then show each roadmap item with a delay
          const timeouts: NodeJS.Timeout[] = [];
          
          timeouts.push(setTimeout(() => {
            setVisibleItems(prev => [...prev, 0]);
          }, 1000));
          
          timeouts.push(setTimeout(() => {
            setVisibleItems(prev => [...prev, 1]);
          }, 2000));
          
          timeouts.push(setTimeout(() => {
            setVisibleItems(prev => [...prev, 2]);
          }, 3000));
          
          timeouts.push(setTimeout(() => {
            setVisibleItems(prev => [...prev, 3]);
          }, 4000));
          
          observer.disconnect();
          
          return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
          };
        }
      },
      {
        root: null,
        rootMargin: '-100px 0px',
        threshold: 0.2,
      }
    );

    if (roadmapRef.current) {
      observer.observe(roadmapRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const roadmapItems = [
    {
      title: "Q1 2025 - Launch Phase",
      items: [
        "Fair Launch on PumpFun",
        "T3-T2 KOLs & Advisor Partnerships",
        "CMC & CG Listings",
        "DexScreener Ads & Boosts",
        "Target: $50M-$100M MarketCap"
      ],
      position: "left"
    },
    {
      title: "Q2 2025 - Growth Phase",
      items: [
        "T1 KOLs & CEX Listings",
        "iOS & Android App Integration",
        "AppStore Marketing Campaign",
        "Subscription Model Launch",
        "Target: $100M-$400M MarketCap"
      ],
      position: "right"
    },
    {
      title: "Q3 2025 - Expansion Phase",
      items: [
        "Binance, Bybit & Coinbase Listings",
        "App Centralization Implementation",
        "Retail-Focused Governance",
        "Enhanced Platform Features",
        "Target: $400M-$1B MarketCap"
      ],
      position: "left"
    },
    {
      title: "Q4 2025 - Maturity Phase",
      items: [
        "Full DAO Transition",
        "Cross-chain Integration",
        "Advanced Market Predictions",
        "Global Expansion",
        "Target: $1B-$10B+ MarketCap"
      ],
      position: "right"
    }
  ];

  // Damascus steel SVG pattern - responsive to theme
  const damascusSteelPattern = `
    <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${isLightMode ? '#e0e0e0' : '#222222'}" />
          <stop offset="50%" stop-color="${isLightMode ? '#f0f0f0' : '#444444'}" />
          <stop offset="100%" stop-color="${isLightMode ? '#e0e0e0' : '#222222'}" />
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>
        </filter>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="0.6"/>
        </filter>
        <filter id="damascus">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="3" stitchTiles="stitch"/>
          <feDisplacementMap in="SourceGraphic" scale="10"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.5" intercept="-0.1"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="500" height="500" fill="${isLightMode ? '#f5f5f5' : '#1a1a1a'}"/>
      <rect width="500" height="500" filter="url(#noise)" opacity="0.35"/>
      
      <!-- Damascus steel pattern with layered waves - responsive to theme -->
      <g filter="url(#damascus)">
        <!-- Horizontal wave layers -->
        <g opacity="0.85">
          ${Array.from({ length: 23 }, (_, i) => {
            const y = 50 + i * 20;
            return `<path d="M0,${y} Q125,${y-25} 250,${y} T500,${y}" stroke="${isLightMode ? 'rgba(100,100,100,0.45)' : 'rgba(255,255,255,0.45)'}" fill="none" stroke-width="1.2"/>`;
          }).join('')}
        </g>
        
        <!-- Damascus steel swirl patterns -->
        <g opacity="0.75" filter="url(#softBlur)">
          ${[
            { cx: 150, cy: 150, radii: [100, 80, 60, 40] },
            { cx: 350, cy: 350, radii: [120, 100, 80, 60] },
            { cx: 250, cy: 250, radii: [80, 60, 40] },
            { cx: 400, cy: 100, radii: [70, 50, 30] },
            { cx: 100, cy: 400, radii: [60, 40, 20] }
          ].map(group => 
            group.radii.map(r => 
              `<ellipse cx="${group.cx}" cy="${group.cy}" rx="${r}" ry="${r/2}" stroke="${isLightMode ? 'rgba(100,100,100,0.4)' : 'rgba(255,255,255,0.4)'}" fill="none" stroke-width="1.2"/>`
            ).join('')
          ).join('')}
        </g>
      </g>
      
      <!-- Overlay to create depth and matte finish -->
      <rect width="500" height="500" fill="url(#steel)" opacity="0.3" filter="url(#softBlur)"/>
    </svg>
  `;

  const encodedDamascusPattern = encodeURIComponent(damascusSteelPattern);

  return (
    <div 
      ref={roadmapRef} 
      className={`w-full max-w-4xl mx-auto my-20 px-4 py-16 transition-opacity duration-1000 ${sectionVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: `linear-gradient(${isLightMode ? 'rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.75)'}), url("data:image/svg+xml;utf8,${encodedDamascusPattern}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '12px',
        boxShadow: `0 0 30px ${isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.8)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Additional matte overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-30" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.08)'} 0%, transparent 60%), 
                            radial-gradient(circle at 20% 30%, ${isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.08)'} 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, ${isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.08)'} 0%, transparent 50%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'soft-light'
        }}
      ></div>

      <div className="relative z-10">
        <h2 
          className={`text-4xl font-bold mb-16 text-center transition-all duration-700 ${
            titleVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'
          }`}
          style={{ 
            fontFamily: 'monospace', 
            letterSpacing: '0.1em', 
            textShadow: `0 0 10px ${isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
            background: `linear-gradient(to right, ${isLightMode ? '#333333, #666666, #333333' : '#ffffff, #a0a0a0, #ffffff'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Roadmap 2025
        </h2>
        
        <div className="relative flex flex-col space-y-24">
          {/* Vertical line with subtle damascus steel effect */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2"
            style={{
              background: `linear-gradient(to bottom, ${isLightMode ? 'rgba(0,0,0,0.1), rgba(0,0,0,0.3), rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2), rgba(255,255,255,0.5), rgba(255,255,255,0.2)'})`,
              boxShadow: `0 0 8px ${isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`
            }}
          ></div>
          
          {roadmapItems.map((item, index) => (
            <div 
              key={index}
              className={`relative ${item.position === 'left' ? 'self-start pr-8 md:pr-0 md:mr-auto md:w-[45%] text-right' : 'self-end pl-8 md:pl-0 md:ml-auto md:w-[45%] text-left'}`}
            >
              {/* Dot on timeline with subtle pulse effect */}
              <div 
                className={`absolute top-6 w-3 h-3 rounded-full z-10 md:left-auto md:right-0 md:translate-x-0 ${
                  visibleItems.includes(index) ? 'animate-pulse' : ''
                }`}
                style={{ 
                  [item.position === 'left' ? 'right' : 'left']: '-1.5rem',
                  opacity: visibleItems.includes(index) ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  boxShadow: `0 0 6px ${isLightMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'}`,
                  backgroundColor: isLightMode ? '#333' : '#fff'
                }}
              ></div>
              
              <div 
                className={`p-6 rounded-lg border transform transition-all duration-700 ${
                  visibleItems.includes(index) 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-10 scale-95'
                } ${
                  hoveredItem === index 
                    ? `shadow-[0_0_20px_${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}] scale-[1.02]` 
                    : `hover:shadow-[0_0_12px_${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)'}] hover:scale-[1.01]`
                }`}
                style={{
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: isLightMode 
                    ? 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))' 
                    : 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85))',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <h3 
                  className="text-xl font-bold mb-4" 
                  style={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: '0.05em',
                    background: `linear-gradient(to right, ${isLightMode ? '#111111, #444444' : '#ffffff, #a0a0a0'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {item.title}
                </h3>
                <ul className="space-y-3">
                  {item.items.map((listItem, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className={`transition-all duration-500 font-mono ${
                        visibleItems.includes(index) 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 translate-x-4'
                      } hover:text-opacity-80 cursor-default text-sm`}
                      style={{ 
                        transitionDelay: visibleItems.includes(index) 
                          ? `${200 + itemIndex * 100}ms` 
                          : '0ms',
                        letterSpacing: '0.03em',
                        textShadow: hoveredItem === index ? `0 0 3px ${isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.3)'}` : 'none',
                        color: isLightMode ? '#333' : '#fff'
                      }}
                    >
                      • {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 