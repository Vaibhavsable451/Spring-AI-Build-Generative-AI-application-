package com.test.rag.db.springairagagent.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {


        @GetMapping("/")
        public String home(){
            return "Spring AI Chatbot backend is running";
        }
    }

