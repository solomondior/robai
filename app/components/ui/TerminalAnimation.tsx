import React, { useEffect, useState, useRef } from 'react';
import { cn } from '~/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessGame } from './ChessGame';

interface TerminalAnimationProps {
  className?: string;
}

type AnimationStep = {
  type: 'input' | 'output' | 'result';
  text: string;
  delay?: number;
  typingSpeed?: number;
  resultComponent?: React.ReactNode;
};

export function TerminalAnimation({ className }: TerminalAnimationProps) {
  const [currentText, setCurrentText] = useState<string>('');
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<React.ReactNode | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Basic chess board component
  const ChessBoard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="w-64 h-64 grid grid-cols-8 grid-rows-8 border border-gray-800 shadow-lg"
    >
      {Array.from({ length: 64 }).map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isBlack = (row + col) % 2 === 1;
        
        // Determine if this square should have a piece
        let piece = null;
        if (row === 0 || row === 7) {
          // Back rows with major pieces
          const pieceRow = row === 0 ? 'black' : 'white';
          const pieceType = [
            'rook', 'knight', 'bishop', 'queen', 
            'king', 'bishop', 'knight', 'rook'
          ][col];
          piece = `${pieceRow}-${pieceType}`;
        } else if (row === 1 || row === 6) {
          // Pawn rows
          const pieceRow = row === 1 ? 'black' : 'white';
          piece = `${pieceRow}-pawn`;
        }
        
        return (
          <motion.div
            key={index}
            className={`${isBlack ? 'bg-gray-700' : 'bg-amber-200'} flex items-center justify-center`}
            style={{ aspectRatio: '1/1' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.005 }}
          >
            {piece && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.5 + index * 0.01,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="text-xl font-bold"
                style={{ color: isBlack ? '#ffffff' : '#000000' }}
              >
                {piece.includes('white') ? (
                  piece.includes('pawn') ? '♙' :
                  piece.includes('rook') ? '♖' :
                  piece.includes('knight') ? '♘' :
                  piece.includes('bishop') ? '♗' :
                  piece.includes('queen') ? '♕' : '♔'
                ) : (
                  piece.includes('pawn') ? '♟' :
                  piece.includes('rook') ? '♜' :
                  piece.includes('knight') ? '♞' :
                  piece.includes('bishop') ? '♝' :
                  piece.includes('queen') ? '♛' : '♚'
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Interactive chess board component
  const InteractiveChessBoard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="w-64 h-64 grid grid-cols-8 grid-rows-8 border border-gray-800 shadow-lg cursor-pointer"
    >
      {Array.from({ length: 64 }).map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isBlack = (row + col) % 2 === 1;
        
        // Determine if this square should have a piece
        let piece = null;
        if (row === 0 || row === 7) {
          // Back rows with major pieces
          const pieceRow = row === 0 ? 'black' : 'white';
          const pieceType = [
            'rook', 'knight', 'bishop', 'queen', 
            'king', 'bishop', 'knight', 'rook'
          ][col];
          piece = `${pieceRow}-${pieceType}`;
        } else if (row === 1 || row === 6) {
          // Pawn rows
          const pieceRow = row === 1 ? 'black' : 'white';
          piece = `${pieceRow}-pawn`;
        }
        
        return (
          <motion.div
            key={index}
            className={`${isBlack ? 'bg-gray-700' : 'bg-amber-200'} flex items-center justify-center`}
            style={{ aspectRatio: '1/1' }}
            whileHover={{ 
              backgroundColor: isBlack ? 'rgba(55, 65, 81, 0.8)' : 'rgba(253, 230, 138, 0.8)',
              scale: 1.05
            }}
            transition={{ duration: 0.2 }}
          >
            {piece && (
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                className="text-xl font-bold cursor-grab"
                style={{ color: isBlack ? '#ffffff' : '#000000' }}
              >
                {piece.includes('white') ? (
                  piece.includes('pawn') ? '♙' :
                  piece.includes('rook') ? '♖' :
                  piece.includes('knight') ? '♘' :
                  piece.includes('bishop') ? '♗' :
                  piece.includes('queen') ? '♕' : '♔'
                ) : (
                  piece.includes('pawn') ? '♟' :
                  piece.includes('rook') ? '♜' :
                  piece.includes('knight') ? '♞' :
                  piece.includes('bishop') ? '♝' :
                  piece.includes('queen') ? '♛' : '♚'
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Chess board with piece movement
  const ChessBoardWithMovement = () => {
    // Define some piece movements
    const movements = [
      { from: [6, 4], to: [4, 4], piece: '♙', delay: 1 }, // White pawn e2-e4
      { from: [1, 4], to: [3, 4], piece: '♟', delay: 2 }, // Black pawn e7-e5
      { from: [7, 6], to: [5, 5], piece: '♘', delay: 3 }, // White knight f1-e3
      { from: [0, 1], to: [2, 2], piece: '♞', delay: 4 }, // Black knight b8-c6
    ];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="w-64 h-64 grid grid-cols-8 grid-rows-8 border border-gray-800 shadow-lg relative"
      >
        {Array.from({ length: 64 }).map((_, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const isBlack = (row + col) % 2 === 1;
          
          return (
            <motion.div
              key={index}
              className={`${isBlack ? 'bg-gray-700' : 'bg-amber-200'} flex items-center justify-center`}
              style={{ aspectRatio: '1/1' }}
            />
          );
        })}
        
        {/* Animated pieces */}
        {movements.map((move, idx) => (
          <motion.div
            key={idx}
            className="absolute text-xl font-bold flex items-center justify-center"
            style={{ 
              color: ((move.from[0] + move.from[1]) % 2 === 0) ? '#000000' : '#ffffff'
            }}
            initial={{ 
              top: `${move.from[0] * 12.5}%`, 
              left: `${move.from[1] * 12.5}%`,
              width: '12.5%',
              height: '12.5%',
              zIndex: 10
            }}
            animate={{ 
              top: `${move.to[0] * 12.5}%`, 
              left: `${move.to[1] * 12.5}%`,
              color: ((move.to[0] + move.to[1]) % 2 === 0) ? '#000000' : '#ffffff'
            }}
            transition={{ 
              delay: move.delay,
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            {move.piece}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Chess board with special effects
  const EnhancedChessBoard = () => {
    // Define some piece movements with effects
    const movements = [
      { from: [6, 4], to: [4, 4], piece: '♙', delay: 1 }, // White pawn e2-e4
      { from: [1, 4], to: [3, 4], piece: '♟', delay: 2 }, // Black pawn e7-e5
      { from: [7, 6], to: [5, 5], piece: '♘', delay: 3 }, // White knight f1-e3
      { from: [0, 1], to: [2, 2], piece: '♞', delay: 4 }, // Black knight b8-c6
    ];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="w-64 h-64 grid grid-cols-8 grid-rows-8 border border-gray-800 shadow-lg relative overflow-hidden"
      >
        {/* Background with subtle animation */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        {Array.from({ length: 64 }).map((_, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const isBlack = (row + col) % 2 === 1;
          
          return (
            <motion.div
              key={index}
              className={`${isBlack ? 'bg-gray-700/90' : 'bg-amber-200/90'} flex items-center justify-center relative z-10`}
              style={{ aspectRatio: '1/1' }}
            />
          );
        })}
        
        {/* Animated pieces with effects */}
        {movements.map((move, idx) => (
          <React.Fragment key={idx}>
            {/* Trail effect */}
            <motion.div
              className="absolute rounded-full bg-blue-500/30 z-0"
              initial={{ 
                top: `${move.from[0] * 12.5 + 6.25}%`, 
                left: `${move.from[1] * 12.5 + 6.25}%`,
                width: '0%',
                height: '0%',
                opacity: 0
              }}
              animate={{ 
                top: `${move.to[0] * 12.5 + 6.25}%`, 
                left: `${move.to[1] * 12.5 + 6.25}%`,
                width: '20%',
                height: '20%',
                opacity: [0, 0.7, 0]
              }}
              transition={{ 
                delay: move.delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            />
            
            {/* Piece */}
            <motion.div
              className="absolute text-xl font-bold flex items-center justify-center z-20"
              style={{ 
                color: ((move.from[0] + move.from[1]) % 2 === 0) ? '#000000' : '#ffffff'
              }}
              initial={{ 
                top: `${move.from[0] * 12.5}%`, 
                left: `${move.from[1] * 12.5}%`,
                width: '12.5%',
                height: '12.5%',
                textShadow: "0 0 0px rgba(59, 130, 246, 0)"
              }}
              animate={{ 
                top: `${move.to[0] * 12.5}%`, 
                left: `${move.to[1] * 12.5}%`,
                color: ((move.to[0] + move.to[1]) % 2 === 0) ? '#000000' : '#ffffff',
                textShadow: [
                  "0 0 0px rgba(59, 130, 246, 0)",
                  "0 0 10px rgba(59, 130, 246, 0.8)",
                  "0 0 0px rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ 
                delay: move.delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15,
                textShadow: {
                  delay: move.delay,
                  duration: 1.2
                }
              }}
            >
              {move.piece}
            </motion.div>
          </React.Fragment>
        ))}
      </motion.div>
    );
  };

  // Animation steps
  const animationSteps: AnimationStep[] = [
    { 
      type: 'input', 
      text: 'create a chess board', 
      typingSpeed: 80,
      resultComponent: <ChessBoard />
    },
    { 
      type: 'input', 
      text: 'make it interactive', 
      typingSpeed: 80, 
      delay: 3000,
      resultComponent: <InteractiveChessBoard />
    },
    { 
      type: 'input', 
      text: 'add piece movement', 
      typingSpeed: 80, 
      delay: 3000,
      resultComponent: <ChessBoardWithMovement />
    },
    { 
      type: 'input', 
      text: 'enhance with special effects', 
      typingSpeed: 80, 
      delay: 5000,
      resultComponent: <EnhancedChessBoard />
    },
    { 
      type: 'input', 
      text: 'make it playable', 
      typingSpeed: 80, 
      delay: 5000,
      resultComponent: <ChessGame />
    }
  ];

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Scroll to bottom when new text is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines, currentText]);

  // Function to simulate typing with improved handling
  const typeText = async (text: string, speed = 50) => {
    setIsTyping(true);
    let currentString = '';

    for (let i = 0; i < text.length; i++) {
      currentString += text[i];
      setCurrentText('> ' + currentString);
      
      // Random typing speed variation for more realistic effect
      const randomDelay = speed * (0.8 + Math.random() * 0.4);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }

    setIsTyping(false);
  };

  // Run the animation with fixed reset logic
  useEffect(() => {
    if (!isAnimating) return;

    const runAnimation = async () => {
      const step = animationSteps[currentStep];
      
      // Wait for the specified delay
      if (step.delay) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // For input steps, simulate typing
      if (step.type === 'input') {
        await typeText(step.text, step.typingSpeed);
        
        // Add the completed line to displayed lines and clear current text
        // to prevent duplication
        setDisplayedLines(prev => [...prev, `> ${step.text}`]);
        setCurrentText('');
        
        // Show the result
        if (step.resultComponent) {
          setCurrentResult(step.resultComponent);
          setShowResult(true);
        }
      }

      // Move to the next step
      setCurrentStep(prev => prev + 1);
    };

    if (currentStep < animationSteps.length) {
      runAnimation();
    } else {
      // Clear immediately to prevent any text duplication
      setCurrentText('');
      
      // Reset animation after all steps are complete
      const timer = setTimeout(() => {
        setDisplayedLines([]);
        setShowResult(false);
        setCurrentResult(null);
        setCurrentStep(0);
        // Add a small delay before restarting to prevent text duplication
        setTimeout(() => {
          setIsAnimating(true);
        }, 500);
      }, 5000);
      
      // Temporarily pause animation while resetting
      setIsAnimating(false);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isAnimating]);

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {/* Terminal Section */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.5 
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-30 rounded-lg"
          animate={{ 
            rotate: [0, 1, -1, 0],
            scale: [1, 1.02, 0.98, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        ></motion.div>
        
        <div className="relative border border-bolt-elements-borderColor rounded-lg overflow-hidden shadow-xl bg-bolt-elements-background-depth-2">
          <div className="flex items-center gap-2 border-b border-bolt-elements-borderColor p-3">
            <motion.div 
              className="i-ph:circle-fill w-3 h-3 text-red-500"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            ></motion.div>
            <motion.div 
              className="i-ph:circle-fill w-3 h-3 text-yellow-500"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            ></motion.div>
            <motion.div 
              className="i-ph:circle-fill w-3 h-3 text-green-500"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            ></motion.div>
            <div className="ml-2 text-sm font-medium text-bolt-elements-textPrimary font-mono">Nexus AI Terminal</div>
          </div>
          <div 
            ref={terminalRef}
            className="font-mono text-sm text-bolt-elements-textSecondary p-4 h-[300px] overflow-y-auto"
          >
            {displayedLines.map((line, index) => (
              <motion.div 
                key={index} 
                className="mb-2 text-bolt-elements-textPrimary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1
                }}
              >
                {line}
              </motion.div>
            ))}
            <div className="text-bolt-elements-textPrimary">
              {currentText}
              <span className={cn(
                "inline-block w-2 h-4 ml-1 bg-bolt-elements-textPrimary",
                showCursor ? "opacity-100" : "opacity-0",
                "transition-opacity duration-200"
              )}></span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Result Preview Section */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.5,
          delay: 0.2
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-30 rounded-lg"
          animate={{ 
            rotate: [0, -1, 1, 0],
            scale: [1, 0.98, 1.02, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        ></motion.div>
        
        <div className="relative border border-bolt-elements-borderColor rounded-lg overflow-hidden shadow-xl bg-bolt-elements-background-depth-2 h-[350px]">
          <div className="flex items-center gap-2 border-b border-bolt-elements-borderColor p-3">
            <div className="text-sm font-medium text-bolt-elements-textPrimary font-mono">Preview</div>
          </div>
          <div className="flex items-center justify-center h-[300px] p-4">
            <AnimatePresence mode="wait">
              {showResult && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="flex items-center justify-center"
                >
                  {currentResult}
                </motion.div>
              )}
              {!showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  className="text-bolt-elements-textSecondary text-center"
                >
                  <div className="i-ph:code-bold w-12 h-12 mx-auto mb-4 opacity-50"></div>
                  <p className="font-mono">Enter a prompt to see the result</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}