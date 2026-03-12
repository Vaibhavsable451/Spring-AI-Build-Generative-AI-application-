package com.test.rag.db.springairagagent.controller;


import com.test.rag.db.springairagagent.service.ChatService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping(value = "/user/chat", produces = "text/plain")
    public ResponseEntity<String> chat(@RequestParam String question) {
        try {
            String result = chatService.getMyResponse(question);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/")
    public String home() {
        return "Spring AI Chatbot backend is running";
    }
}