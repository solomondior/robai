import { useEffect, useState, useRef } from 'react';

// Chess piece Unicode characters
const PIECES = {
  'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
  'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚',
};

// Initial board setup - matching the image with white at bottom, black at top
const INITIAL_BOARD = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

export function ChessGame() {
  const [board, setBoard] = useState(JSON.parse(JSON.stringify(INITIAL_BOARD)));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [playerTurn, setPlayerTurn] = useState<'w' | 'b'>('w'); // White starts
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');
  const [message, setMessage] = useState("Your turn! Click on a piece to move.");
  const [capturedPieces, setCapturedPieces] = useState<{ w: string[], b: string[] }>({ w: [], b: [] });
  const [gameStarted, setGameStarted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const botThinkingTimer = useRef<NodeJS.Timeout | null>(null);

  // Start a new game
  const startGame = () => {
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    setSelectedCell(null);
    setPossibleMoves([]);
    setPlayerTurn('w');
    setGameStatus('playing');
    setMessage("Your turn! Click on a piece to move.");
    setCapturedPieces({ w: [], b: [] });
    setGameStarted(true);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || playerTurn !== 'w' || thinking || gameStatus === 'checkmate' || gameStatus === 'stalemate') {
      return;
    }

    const piece = board[row][col];

    // If no piece is selected and the clicked cell has a piece of the current player's color
    if (!selectedCell && piece && piece[0] === playerTurn) {
      setSelectedCell([row, col]);
      const moves = getValidMoves(row, col, board, playerTurn);
      setPossibleMoves(moves);
      return;
    }

    // If a piece is already selected
    if (selectedCell) {
      const [selectedRow, selectedCol] = selectedCell;
      const selectedPiece = board[selectedRow][selectedCol];

      // If clicking on another piece of the same color, select that piece instead
      if (piece && piece[0] === playerTurn && (row !== selectedRow || col !== selectedCol)) {
        setSelectedCell([row, col]);
        const moves = getValidMoves(row, col, board, playerTurn);
        setPossibleMoves(moves);
        return;
      }

      // Check if the move is valid
      const isValidMove = possibleMoves.some(([r, c]) => r === row && c === col);

      if (isValidMove) {
        // Make the move
        const newBoard = JSON.parse(JSON.stringify(board));
        
        // Check if a piece is being captured
        if (newBoard[row][col]) {
          const capturedPiece = newBoard[row][col];
          setCapturedPieces(prev => ({
            ...prev,
            w: capturedPiece[0] === 'b' ? [...prev.w, capturedPiece] : prev.w,
            b: capturedPiece[0] === 'w' ? [...prev.b, capturedPiece] : prev.b,
          }));
        }
        
        // Move the piece
        newBoard[row][col] = selectedPiece;
        newBoard[selectedRow][selectedCol] = null;
        
        // Handle pawn promotion (automatically to Queen for simplicity)
        if (selectedPiece === 'wP' && row === 0) {
          newBoard[row][col] = 'wQ';
          setMessage("Pawn promoted to Queen!");
        }
        
        setBoard(newBoard);
        setSelectedCell(null);
        setPossibleMoves([]);
        
        // Check game status after player's move
        const status = checkGameStatus(newBoard, 'b');
        setGameStatus(status);
        
        if (status === 'checkmate') {
          setMessage("Checkmate! You win!");
          return;
        } else if (status === 'stalemate') {
          setMessage("Stalemate! The game is a draw.");
          return;
        } else if (status === 'check') {
          setMessage("You put the bot in check!");
        } else {
          setMessage("Bot is thinking...");
        }
        
        // Switch to bot's turn
        setPlayerTurn('b');
        setThinking(true);
        
        // Bot makes a move after a delay
        botThinkingTimer.current = setTimeout(() => {
          makeBotMove(newBoard);
        }, 1000);
      }
    }
  };

  // Bot makes a move
  const makeBotMove = (currentBoard: (string | null)[][]) => {
    // Find all possible moves for the bot
    const botMoves: { from: [number, number], to: [number, number], piece: string }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col];
        if (piece && piece[0] === 'b') {
          const moves = getValidMoves(row, col, currentBoard, 'b');
          moves.forEach(([toRow, toCol]) => {
            botMoves.push({ from: [row, col], to: [toRow, toCol], piece });
          });
        }
      }
    }
    
    if (botMoves.length === 0) {
      // No valid moves for bot
      const status = isInCheck(currentBoard, 'b') ? 'checkmate' : 'stalemate';
      setGameStatus(status);
      setMessage(status === 'checkmate' ? "Checkmate! You win!" : "Stalemate! The game is a draw.");
      setThinking(false);
      return;
    }
    
    // Choose a move (with some basic strategy)
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of botMoves) {
      let score = 0;
      
      // Simulate the move
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      const [fromRow, fromCol] = move.from;
      const [toRow, toCol] = move.to;
      
      // Check if capturing a piece
      if (newBoard[toRow][toCol]) {
        const capturedPiece = newBoard[toRow][toCol];
        // Assign values to pieces
        const pieceValues: Record<string, number> = {
          'wP': 1, 'wN': 3, 'wB': 3, 'wR': 5, 'wQ': 9, 'wK': 100,
          'bP': 1, 'bN': 3, 'bB': 3, 'bR': 5, 'bQ': 9, 'bK': 100
        };
        score += pieceValues[capturedPiece] || 0;
      }
      
      // Prefer center control for knights and bishops
      if (move.piece === 'bN' || move.piece === 'bB') {
        const centerDistance = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
        score += (4 - centerDistance) * 0.1;
      }
      
      // Pawns should advance
      if (move.piece === 'bP') {
        score += toRow * 0.05; // Encourage forward movement
      }
      
      // Add some randomness
      score += Math.random() * 0.3;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    if (bestMove) {
      const [fromRow, fromCol] = bestMove.from;
      const [toRow, toCol] = bestMove.to;
      
      // Make the bot's move
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      
      // Check if a piece is being captured
      if (newBoard[toRow][toCol]) {
        const capturedPiece = newBoard[toRow][toCol];
        setCapturedPieces(prev => ({
          ...prev,
          w: capturedPiece[0] === 'b' ? [...prev.w, capturedPiece] : prev.w,
          b: capturedPiece[0] === 'w' ? [...prev.b, capturedPiece] : prev.b,
        }));
      }
      
      // Move the piece
      newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = null;
      
      // Handle pawn promotion
      if (newBoard[toRow][toCol] === 'bP' && toRow === 7) {
        newBoard[toRow][toCol] = 'bQ';
        setMessage("Bot promoted a pawn to Queen!");
      } else {
        setMessage("Your turn! Click on a piece to move.");
      }
      
      setBoard(newBoard);
      
      // Check game status after bot's move
      const status = checkGameStatus(newBoard, 'w');
      setGameStatus(status);
      
      if (status === 'checkmate') {
        setMessage("Checkmate! Bot wins!");
      } else if (status === 'stalemate') {
        setMessage("Stalemate! The game is a draw.");
      } else if (status === 'check') {
        setMessage("Check! Your king is in danger!");
      }
      
      // Switch back to player's turn
      setPlayerTurn('w');
    }
    
    setThinking(false);
  };

  // Get valid moves for a piece
  const getValidMoves = (row: number, col: number, currentBoard: (string | null)[][], turn: 'w' | 'b'): [number, number][] => {
    const piece = currentBoard[row][col];
    if (!piece || piece[0] !== turn) return [];
    
    const pieceType = piece[1];
    let moves: [number, number][] = [];
    
    switch (pieceType) {
      case 'P': // Pawn
        moves = getPawnMoves(row, col, currentBoard, turn);
        break;
      case 'R': // Rook
        moves = getRookMoves(row, col, currentBoard, turn);
        break;
      case 'N': // Knight
        moves = getKnightMoves(row, col, currentBoard, turn);
        break;
      case 'B': // Bishop
        moves = getBishopMoves(row, col, currentBoard, turn);
        break;
      case 'Q': // Queen
        moves = [...getRookMoves(row, col, currentBoard, turn), ...getBishopMoves(row, col, currentBoard, turn)];
        break;
      case 'K': // King
        moves = getKingMoves(row, col, currentBoard, turn);
        break;
    }
    
    // Filter out moves that would put or leave the king in check
    return moves.filter(([toRow, toCol]) => {
      const testBoard = JSON.parse(JSON.stringify(currentBoard));
      testBoard[toRow][toCol] = testBoard[row][col];
      testBoard[row][col] = null;
      return !isInCheck(testBoard, turn);
    });
  };

  // Pawn movement logic
  const getPawnMoves = (row: number, col: number, board: (string | null)[][], color: 'w' | 'b'): [number, number][] => {
    const moves: [number, number][] = [];
    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    
    // Move forward one square
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
      moves.push([row + direction, col]);
      
      // Move forward two squares from starting position
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Capture diagonally
    const captureDirections = [[direction, -1], [direction, 1]];
    for (const [dr, dc] of captureDirections) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 && newRow < 8 && 
        newCol >= 0 && newCol < 8 && 
        board[newRow][newCol] && 
        board[newRow][newCol]![0] !== color
      ) {
        moves.push([newRow, newCol]);
      }
    }
    
    return moves;
  };

  // Rook movement logic
  const getRookMoves = (row: number, col: number, board: (string | null)[][], color: 'w' | 'b'): [number, number][] => {
    const moves: [number, number][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
    for (const [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;
      
      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!board[newRow][newCol]) {
          // Empty square
          moves.push([newRow, newCol]);
        } else if (board[newRow][newCol]![0] !== color) {
          // Opponent's piece
          moves.push([newRow, newCol]);
          break;
        } else {
          // Own piece
          break;
        }
        
        newRow += dr;
        newCol += dc;
      }
    }
    
    return moves;
  };

  // Knight movement logic
  const getKnightMoves = (row: number, col: number, board: (string | null)[][], color: 'w' | 'b'): [number, number][] => {
    const moves: [number, number][] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dr, dc] of knightMoves) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (
        newRow >= 0 && newRow < 8 && 
        newCol >= 0 && newCol < 8 && 
        (!board[newRow][newCol] || board[newRow][newCol]![0] !== color)
      ) {
        moves.push([newRow, newCol]);
      }
    }
    
    return moves;
  };

  // Bishop movement logic
  const getBishopMoves = (row: number, col: number, board: (string | null)[][], color: 'w' | 'b'): [number, number][] => {
    const moves: [number, number][] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
    
    for (const [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;
      
      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!board[newRow][newCol]) {
          // Empty square
          moves.push([newRow, newCol]);
        } else if (board[newRow][newCol]![0] !== color) {
          // Opponent's piece
          moves.push([newRow, newCol]);
          break;
        } else {
          // Own piece
          break;
        }
        
        newRow += dr;
        newCol += dc;
      }
    }
    
    return moves;
  };

  // King movement logic
  const getKingMoves = (row: number, col: number, board: (string | null)[][], color: 'w' | 'b'): [number, number][] => {
    const moves: [number, number][] = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dr, dc] of kingMoves) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (
        newRow >= 0 && newRow < 8 && 
        newCol >= 0 && newCol < 8 && 
        (!board[newRow][newCol] || board[newRow][newCol]![0] !== color)
      ) {
        moves.push([newRow, newCol]);
      }
    }
    
    return moves;
  };

  // Check if a king is in check
  const isInCheck = (board: (string | null)[][], color: 'w' | 'b'): boolean => {
    // Find the king
    let kingRow = -1;
    let kingCol = -1;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === `${color}K`) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    if (kingRow === -1) return false; // King not found (shouldn't happen in a valid game)
    
    // Check if any opponent's piece can capture the king
    const opponentColor = color === 'w' ? 'b' : 'w';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[0] === opponentColor) {
          const pieceType = piece[1];
          let moves: [number, number][] = [];
          
          switch (pieceType) {
            case 'P':
              // Pawns capture diagonally
              const direction = opponentColor === 'w' ? -1 : 1;
              if (
                (row + direction === kingRow && (col - 1 === kingCol || col + 1 === kingCol))
              ) {
                return true;
              }
              break;
            case 'R':
              moves = getRookMoves(row, col, board, opponentColor);
              break;
            case 'N':
              moves = getKnightMoves(row, col, board, opponentColor);
              break;
            case 'B':
              moves = getBishopMoves(row, col, board, opponentColor);
              break;
            case 'Q':
              moves = [...getRookMoves(row, col, board, opponentColor), ...getBishopMoves(row, col, board, opponentColor)];
              break;
            case 'K':
              // Kings can't directly check each other, but we'll include for completeness
              moves = getKingMoves(row, col, board, opponentColor);
              break;
          }
          
          // Check if any of the moves can capture the king
          if (moves.some(([r, c]) => r === kingRow && c === kingCol)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Check game status (check, checkmate, stalemate)
  const checkGameStatus = (board: (string | null)[][], turn: 'w' | 'b'): 'playing' | 'check' | 'checkmate' | 'stalemate' => {
    const inCheck = isInCheck(board, turn);
    
    // Check if there are any valid moves
    let hasValidMoves = false;
    
    for (let row = 0; row < 8 && !hasValidMoves; row++) {
      for (let col = 0; col < 8 && !hasValidMoves; col++) {
        const piece = board[row][col];
        if (piece && piece[0] === turn) {
          const moves = getValidMoves(row, col, board, turn);
          if (moves.length > 0) {
            hasValidMoves = true;
            break;
          }
        }
      }
    }
    
    if (!hasValidMoves) {
      return inCheck ? 'checkmate' : 'stalemate';
    }
    
    return inCheck ? 'check' : 'playing';
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (botThinkingTimer.current) {
        clearTimeout(botThinkingTimer.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-[280px] mx-auto scale-90 transform origin-center">
      <div className="mb-2 text-center">
        <h2 className="text-lg font-bold mb-1 text-bolt-elements-textPrimary">Chess Game</h2>
        
        {!gameStarted ? (
          <button 
            onClick={startGame}
            className="px-3 py-1 bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded-md hover:bg-bolt-elements-button-primary-backgroundHover transition-colors text-sm"
          >
            Start Game
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <p className={`mb-1 text-xs ${gameStatus === 'check' ? 'text-red-500 font-bold' : 'text-bolt-elements-textSecondary'}`}>
              {message}
            </p>
            <div className="flex justify-between w-full mb-1 text-xs">
              <div className="flex items-center">
                <span className="text-bolt-elements-textSecondary mr-1">Bot:</span>
                {capturedPieces.b.map((piece, i) => (
                  <span key={i} className="text-sm mr-1">{PIECES[piece as keyof typeof PIECES]}</span>
                ))}
              </div>
              <div className="flex items-center">
                <span className="text-bolt-elements-textSecondary mr-1">You:</span>
                {capturedPieces.w.map((piece, i) => (
                  <span key={i} className="text-sm mr-1">{PIECES[piece as keyof typeof PIECES]}</span>
                ))}
              </div>
            </div>
            <button 
              onClick={startGame}
              className="px-2 py-0.5 bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text rounded-md hover:bg-bolt-elements-button-secondary-backgroundHover transition-colors text-xs mb-1"
            >
              New Game
            </button>
          </div>
        )}
      </div>
      
      <div 
        className="grid grid-cols-8 border border-gray-800 rounded-md overflow-hidden shadow-md"
        style={{ width: '100%', aspectRatio: '1/1' }}
      >
        {board.map((row: (string | null)[], rowIndex: number) => (
          row.map((cell: string | null, colIndex: number) => {
            const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
            const isPossibleMove = possibleMoves.some(([r, c]) => r === rowIndex && c === colIndex);
            const isLightSquare = (rowIndex + colIndex) % 2 === 0;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center relative
                  ${isLightSquare ? 'bg-amber-200' : 'bg-gray-700'}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  ${isPossibleMove ? 'cursor-pointer' : cell ? 'cursor-pointer' : 'cursor-default'}
                  transition-all
                `}
                style={{ aspectRatio: '1/1' }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <span className="text-lg font-bold" style={{ 
                    color: isLightSquare ? '#000000' : '#ffffff'
                  }}>
                    {PIECES[cell as keyof typeof PIECES]}
                  </span>
                )}
                {isPossibleMove && (
                  <div className={`absolute inset-0 flex items-center justify-center ${cell ? 'bg-red-500 bg-opacity-40' : ''}`}>
                    {!cell && <div className="w-2 h-2 rounded-full bg-gray-500 bg-opacity-50"></div>}
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <div className="mt-1 text-center">
        <p className="text-xs text-bolt-elements-textTertiary">
          {gameStarted ? 'You play as white. Click on a piece to move it.' : 'Press Start Game to begin!'}
        </p>
      </div>
    </div>
  );
} 