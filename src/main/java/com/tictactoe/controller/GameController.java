package com.tictactoe.controller;

import com.tictactoe.model.GameMode;
import com.tictactoe.model.GameSession;
import com.tictactoe.model.MoveRequest;
import com.tictactoe.model.Player;
import com.tictactoe.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/api/game/new")
    @ResponseBody
    public ResponseEntity<GameSession> createGame(
            @RequestParam GameMode mode,
            @RequestParam(required = false, defaultValue = "X") Player humanPlayer) {
        return ResponseEntity.ok(gameService.createGame(mode, humanPlayer));
    }

    @PostMapping("/api/game/move")
    @ResponseBody
    public ResponseEntity<GameSession> makeMove(@RequestBody MoveRequest request) {
        try {
            return ResponseEntity.ok(gameService.makeMove(request.getGameId(), request.getPosition(), request.getPlayer()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/api/game/{gameId}/ai-move")
    @ResponseBody
    public ResponseEntity<GameSession> makeAiMove(@PathVariable String gameId) {
        try {
            return ResponseEntity.ok(gameService.makeAiMove(gameId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/api/game/{gameId}")
    @ResponseBody
    public ResponseEntity<GameSession> getGame(@PathVariable String gameId) {
        GameSession session = gameService.getGame(gameId);
        if (session != null) {
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }
}
