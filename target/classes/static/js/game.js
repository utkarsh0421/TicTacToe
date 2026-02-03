let currentGameId = null;
let currentPlayer = 'X'; 
let gameActive = false;
let myPlayer = 'X'; 
let gameMode = 'TWO_PLAYER';

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

async function startGame(mode) {
    gameMode = mode;
    try {
        // If 2 player, symbol selection doesn't matter much for logic (X always starts), 
        // but for AI it determines who the human is.
        // In 2 player, let's just ignore myPlayer for now or assume P1 is X.
        
        const response = await fetch(`/api/game/new?mode=${mode}&humanPlayer=${myPlayer}`, { method: 'POST' });
        const session = await response.json();
        
        currentGameId = session.gameId;
        currentPlayer = session.currentPlayer;
        gameActive = true;
        
        // Reset board
        elements.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        updateStatus(`Player ${currentPlayer}'s Turn`);
        showScreen('game');

        // Check if AI needs to move first
        checkAiTurn(session);

    } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to start game. Please try again.');
    }
}

async function handleCellClick(index) {
    if (!gameActive || elements.cells[index].classList.contains('taken')) return;

    // Prevent human from moving during AI turn
    if (gameMode === 'AI' && currentPlayer !== myPlayer) return;

    // Optimistic UI update
    updateCell(index, currentPlayer);
    
    try {
        const response = await fetch('/api/game/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId: currentGameId,
                position: index,
                player: currentPlayer
            })
        });
        
        if (!response.ok) throw new Error('Move failed');
        
        const session = await response.json();
        syncGameState(session);
        
    } catch (error) {
        console.error('Error making move:', error);
        // Revert move if failed (omitted for brevity)
    }
}

function updateCell(index, player) {
    const cell = elements.cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    // Add pop animation class
    cell.classList.add('pop-in');
    setTimeout(() => cell.classList.remove('pop-in'), 300);
}

function syncGameState(session) {
    // Sync board
    session.board.forEach((val, idx) => {
        const cell = elements.cells[idx];
        if (val && !cell.classList.contains('taken')) {
            updateCell(idx, val);
        }
    });

    currentPlayer = session.currentPlayer;
    gameActive = session.gameStatus === 'IN_PROGRESS';

    if (gameActive) {
        updateStatus(`Player ${currentPlayer}'s Turn`);
        checkAiTurn(session);
    } else {
        showResult(session);
    }
}

async function checkAiTurn(session) {
    if (gameMode === 'AI' && session.gameStatus === 'IN_PROGRESS' && currentPlayer !== myPlayer) {
        // It's AI's turn
        updateStatus("Computer is thinking...");
        
        // Delay 1 second
        await new Promise(r => setTimeout(r, 1000));
        
        try {
            const response = await fetch(`/api/game/${currentGameId}/ai-move`, { method: 'POST' });
            if (!response.ok) throw new Error('AI move failed');
            const newSession = await response.json();
            syncGameState(newSession);
        } catch (error) {
            console.error('AI Move Error:', error);
        }
    }
}

function updateStatus(message) {
    elements.status.textContent = message;
}

function showResult(session) {
    let message = '';
    if (session.gameStatus === 'WIN') {
        message = `${session.winner} Wins!`;
        // Highlight winning line
        if (session.winningLine) {
            session.winningLine.forEach(idx => elements.cells[idx].classList.add('winner'));
        }
    } else {
        message = "It's a Draw!";
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

// Event Listeners
document.getElementById('btn-2player').addEventListener('click', () => startGame('TWO_PLAYER'));
document.getElementById('btn-ai').addEventListener('click', () => startGame('AI'));
document.getElementById('btn-restart').addEventListener('click', () => startGame(gameMode)); 
document.getElementById('btn-home').addEventListener('click', () => showScreen('home'));
document.getElementById('btn-play-again').addEventListener('click', resetGame);

elements.cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});
