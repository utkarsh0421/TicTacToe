package com.tictactoe.service;

import com.tictactoe.model.Player;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class AIService {

    private final Random random = new Random();

    public int getBestMove(Player[] board, Player aiPlayer) {
        int bestScore = Integer.MIN_VALUE;
        List<Integer> bestMoves = new ArrayList<>();
        
        // If the board is empty, pick a random move to ensure variety.
        // All opening moves are theoretically sound (draw-able) in Tic-Tac-Toe.
        if (isBoardEmpty(board)) {
            return random.nextInt(9);
        }

        for (int i = 0; i < 9; i++) {
            if (board[i] == null) {
                board[i] = aiPlayer;
                int score = minimax(board, 0, false, aiPlayer);
                board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMoves.clear();
                    bestMoves.add(i);
                } else if (score == bestScore) {
                    bestMoves.add(i);
                }
            }
        }
        
        if (bestMoves.isEmpty()) return -1;
        return bestMoves.get(random.nextInt(bestMoves.size()));
    }

    private int minimax(Player[] board, int depth, boolean isMaximizing, Player aiPlayer) {
        Player opponent = (aiPlayer == Player.X) ? Player.O : Player.X;
        Player winner = checkWinner(board);
        
        if (winner == aiPlayer) return 10 - depth;
        if (winner == opponent) return depth - 10;
        if (isBoardFull(board)) return 0;

        if (isMaximizing) {
            int bestScore = Integer.MIN_VALUE;
            for (int i = 0; i < 9; i++) {
                if (board[i] == null) {
                    board[i] = aiPlayer;
                    int score = minimax(board, depth + 1, false, aiPlayer);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            int bestScore = Integer.MAX_VALUE;
            for (int i = 0; i < 9; i++) {
                if (board[i] == null) {
                    board[i] = opponent;
                    int score = minimax(board, depth + 1, true, aiPlayer);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    private Player checkWinner(Player[] board) {
        int[][] winCombinations = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // Rows
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // Columns
            {0, 4, 8}, {2, 4, 6}             // Diagonals
        };

        for (int[] combo : winCombinations) {
            if (board[combo[0]] != null &&
                board[combo[0]] == board[combo[1]] &&
                board[combo[0]] == board[combo[2]]) {
                return board[combo[0]];
            }
        }
        return null;
    }

    private boolean isBoardFull(Player[] board) {
        for (Player p : board) {
            if (p == null) return false;
        }
        return true;
    }
    
    private boolean isBoardEmpty(Player[] board) {
        for (Player p : board) {
            if (p != null) return false;
        }
        return true;
    }
}
