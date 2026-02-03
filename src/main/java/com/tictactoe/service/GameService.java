package com.tictactoe.service;

import com.tictactoe.model.GameMode;
import com.tictactoe.model.GameSession;
import com.tictactoe.model.GameStatus;
import com.tictactoe.model.Player;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private final Map<String, GameSession> gameSessions = new ConcurrentHashMap<>();
    private final AIService aiService;

    public GameService(AIService aiService) {
        this.aiService = aiService;
    }

    public GameSession createGame(GameMode mode) {
        return createGame(mode, Player.X); // Default to X
    }

    public GameSession createGame(GameMode mode, Player humanPlayer) {
        GameSession session = new GameSession(mode, humanPlayer);
        gameSessions.put(session.getGameId(), session);
        return session;
    }

    public GameSession getGame(String gameId) {
        return gameSessions.get(gameId);
    }

    public GameSession makeMove(String gameId, int position, Player player) {
        GameSession session = gameSessions.get(gameId);
        if (session == null || session.getGameStatus() != GameStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Invalid game or game over");
        }

        if (session.getCurrentPlayer() != player) {
            throw new IllegalArgumentException("Not your turn");
        }

        if (position < 0 || position > 8 || session.getBoard()[position] != null) {
            throw new IllegalArgumentException("Invalid move");
        }

        // Apply move
        session.getBoard()[position] = player;

        // Check for win/draw
        updateGameStatus(session);

        // Switch turn if game is still in progress
        if (session.getGameStatus() == GameStatus.IN_PROGRESS) {
            session.setCurrentPlayer(player == Player.X ? Player.O : Player.X);
        }

        return session;
    }

    public GameSession makeAiMove(String gameId) {
        GameSession session = gameSessions.get(gameId);
        if (session == null || session.getGameStatus() != GameStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Invalid game or game over");
        }

        if (session.getGameMode() != GameMode.AI) {
            throw new IllegalArgumentException("Not an AI game");
        }

        Player aiPlayer = session.getHumanPlayer() == Player.X ? Player.O : Player.X;

        if (session.getCurrentPlayer() != aiPlayer) {
            throw new IllegalArgumentException("Not AI's turn");
        }

        // Calculate AI move
        int aiMove = aiService.getBestMove(session.getBoard(), aiPlayer);
        
        if (aiMove != -1) {
            session.getBoard()[aiMove] = aiPlayer;
            updateGameStatus(session);
            
            if (session.getGameStatus() == GameStatus.IN_PROGRESS) {
                session.setCurrentPlayer(session.getHumanPlayer());
            }
        }

        return session;
    }

    private void updateGameStatus(GameSession session) {
        Player[] board = session.getBoard();
        int[][] winCombinations = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // Rows
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // Columns
            {0, 4, 8}, {2, 4, 6}             // Diagonals
        };

        for (int[] combo : winCombinations) {
            if (board[combo[0]] != null &&
                board[combo[0]] == board[combo[1]] &&
                board[combo[0]] == board[combo[2]]) {
                
                session.setGameStatus(GameStatus.WIN);
                session.setWinner(board[combo[0]]);
                session.setWinningLine(combo);
                return;
            }
        }

        boolean isFull = true;
        for (Player p : board) {
            if (p == null) {
                isFull = false;
                break;
            }
        }

        if (isFull) {
            session.setGameStatus(GameStatus.DRAW);
        }
    }
}
