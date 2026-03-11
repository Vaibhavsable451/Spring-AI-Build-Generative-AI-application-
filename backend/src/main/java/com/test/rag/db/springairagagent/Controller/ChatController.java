package com.test.rag.db.springairagagent.Controller;


import com.test.rag.db.springairagagent.service.ChatService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {
      private final ChatService chatService;

      public ChatController(ChatService chatService) {
          this.chatService = chatService;
      }

      @CrossOrigin(origins = "http://localhost:3000")
      @GetMapping(value = "/user/chat", produces = "application/json")
      public String chat(@RequestParam String question){
          return chatService.getMyResponse(question);
      }
}
