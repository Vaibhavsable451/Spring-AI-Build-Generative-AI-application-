package com.test.rag.db.springairagagent.service;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatModel chatModel;

    public ChatService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String getMyResponse(String question) {
        System.out.println("User Question: " + question);

        Prompt prompt = new Prompt(List.of(
                new SystemMessage("""
                        You are Sam, a polite and knowledgeable AI assistant.
                        Answer the user's question politely and clearly.
                        Always be respectful and never respond rudely, even if provoked.
                        """),
                new UserMessage(question)
        ));

        ChatResponse response = chatModel.call(prompt);

        if (response == null || response.getResult() == null || response.getResult().getOutput() == null) {
            throw new RuntimeException("Empty response from AI model");
        }

        return response.getResult().getOutput().getText();
    }
}