let currentPlayer = 'X'; 
let gameActive = false;
let myPlayer = 'X'; 
let gameMode = 'TWO_PLAYER';
let boardState = Array(9).fill(null); // Local board state

const screens = {
    home: document.getElementById('home-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    status: document.getElementById('status-text'),
    board: document.getElementById('board'),
    cells: Array.from(document.querySelectorAll('.cell')),
    resultMessage: document.getElementById('result-message'),
    symbolBtns: document.querySelectorAll('.toggle-btn')
};

// Symbol Selection Logic
elements.symbolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.symbolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        myPlayer = btn.dataset.symbol;
    });
});

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    currentPlayer = 'X'; // X always starts
    boardState.fill(null);

    // Reset UI
    elements.cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    
    updateStatus(`Player ${currentPlayer}'s Turn`);
    showScreen('game');

    // If AI mode and human is O, AI (X) moves first
    if (gameMode === 'AI' && myPlayer === 'O') {
        makeAiMove();
    }
}

function handleCellClick(index) {
    if (!gameActive || boardState[index] !== null) return;

    // Prevent human from moving during AI turn
    if (gameMode === 'AI' && currentPlayer !== myPlayer) return;

    makeMove(index, currentPlayer);
    
    if (gameActive && gameMode === 'AI') {
        setTimeout(makeAiMove, 500); // Small delay for realism
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    updateCell(index, player);

    const winner = checkWinner(boardState);
    if (winner) {
        gameActive = false;
        showResult(winner);
        return;
    }

    if (isBoardFull(boardState)) {
        gameActive = false;
        showResult('DRAW');
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`Player ${currentPlayer}'s Turn`);
}

function makeAiMove() {
    if (!gameActive) return;
    
    updateStatus("Computer is thinking...");
    
    // Use Minimax to find best move
    const bestMove = getBestMove(boardState, currentPlayer);
    
    if (bestMove !== -1) {
        makeMove(bestMove, currentPlayer);
    }
}

function updateCell(index, player) {
    const cell = elements.cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    cell.classList.add('pop-in');
    setTimeout(() => cell.classList.remove('pop-in'), 300);
}

function updateStatus(message) {
    elements.status.textContent = message;
}

function showResult(result) {
    let message = '';
    if (result === 'DRAW') {
        message = "It's a Draw!";
    } else {
        message = `${result} Wins!`;
        // Highlight winning line
        const winningLine = getWinningLine(boardState);
        if (winningLine) {
            winningLine.forEach(idx => elements.cells[idx].classList.add('winner'));
        }
    }
    
    setTimeout(() => {
        elements.resultMessage.textContent = message;
        screens.result.classList.remove('hidden');
    }, 500);
}

function resetGame() {
    screens.result.classList.add('hidden');
    showScreen('home');
}

// --- AI Logic (Minimax) ---

function getBestMove(board, aiPlayer) {
    // Opening move optimization: pick center or corners if empty
    if (board.every(cell => cell === null)) {
        return Math.floor(Math.random() * 9); 
    }

    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = aiPlayer;
            let score = minimax(board, 0, false, aiPlayer);
            board[i] = null;
            
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = {
    X: 10,
    O: -10,
    TIE: 0
};

function minimax(board, depth, isMaximizing, aiPlayer) {
    const winner = checkWinner(board);
    if (winner) {
        // If AI is X, X win is +10. If AI is O, O win is +10 (relative perspective)
        // But standard minimax uses absolute scores. Let's fix scores:
        // Assume AI wants to maximize its own win.
        // Actually, easier: 
        // If winner == aiPlayer => return 10 - depth
        // If winner == opponent => return depth - 10
        return winner === aiPlayer ? (10 - depth) : (depth - 10);
    }
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = aiPlayer;
                let score = minimax(board, depth + 1, false, aiPlayer);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        const opponent = aiPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = opponent;
                let score = minimax(board, depth + 1, true, aiPlayer);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combo of winCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function getWinningLine(board) {
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combo of winCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combo;
        }
    }
    return null;
}

function isBoardFull(board) {
    return board.every(cell => cell !== null);
}

// Event Listeners
document.getElementById('btn-2player').addEventListener('click', () => startGame('TWO_PLAYER'));
document.getElementById('btn-ai').addEventListener('click', () => startGame('AI'));
document.getElementById('btn-restart').addEventListener('click', () => startGame(gameMode)); 
document.getElementById('btn-home').addEventListener('click', () => showScreen('home'));
document.getElementById('btn-play-again').addEventListener('click', resetGame);

elements.cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});
