package com.tictactoe.model;

import java.util.Arrays;
import java.util.UUID;

public class GameSession {
    private String gameId;
    private GameMode gameMode;
    private Player currentPlayer;
    private GameStatus gameStatus;
    private Player[] board; // 0-8
    private Player winner;
    private int[] winningLine;
    private Player humanPlayer; // For AI mode

    public GameSession(GameMode gameMode, Player humanPlayer) {
        this.gameId = UUID.randomUUID().toString();
        this.gameMode = gameMode;
        this.humanPlayer = humanPlayer;
        this.currentPlayer = Player.X; // X always starts
        this.gameStatus = GameStatus.IN_PROGRESS;
        this.board = new Player[9]; // null indicates empty
    }

    public GameSession(GameMode gameMode) {
        this(gameMode, Player.X);
    }

    public String getGameId() {
        return gameId;
    }

    public GameMode getGameMode() {
        return gameMode;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(Player currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public GameStatus getGameStatus() {
        return gameStatus;
    }

    public void setGameStatus(GameStatus gameStatus) {
        this.gameStatus = gameStatus;
    }

    public Player[] getBoard() {
        return board;
    }

    public void setBoard(Player[] board) {
        this.board = board;
    }

    public Player getWinner() {
        return winner;
    }

    public void setWinner(Player winner) {
        this.winner = winner;
    }

    public int[] getWinningLine() {
        return winningLine;
    }

    public void setWinningLine(int[] winningLine) {
        this.winningLine = winningLine;
    }

    public Player getHumanPlayer() {
        return humanPlayer;
    }

    public void setHumanPlayer(Player humanPlayer) {
        this.humanPlayer = humanPlayer;
    }
}
