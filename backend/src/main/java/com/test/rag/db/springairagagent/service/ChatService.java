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
        System.out.println(">>> [1/4] User Question received: " + question);

        try {
            System.out.println(">>> [2/4] Preparing AI prompt...");
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage("""
                            You are Sam, a polite and knowledgeable AI assistant.
                            Answer the user's question politely and clearly.
                            Always be respectful and never respond rudely, even if provoked.
                            """),
                    new UserMessage(question)
            ));

            System.out.println(">>> [3/4] Calling Groq API via OpenAI library...");
            ChatResponse response = chatModel.call(prompt);

            if (response == null || response.getResult() == null || response.getResult().getOutput() == null) {
                System.err.println(">>> [ERROR] Received empty response from AI model!");
                throw new RuntimeException("Empty response from AI model");
            }

            System.out.println(">>> [4/4] AI Response successfully received!");
            return response.getResult().getOutput().getText();
        } catch (Exception e) {
            System.err.println(">>> [ERROR] AI Processing failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return "ERROR: I encountered an issue while talking to the AI. Check backend logs. (" + e.getMessage() + ")";
        }
    }
}