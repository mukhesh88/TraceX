package com.tracex.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "TraceX Edge-Optimized Lexical URL Forensics Engine",
            "version", "1.0.0",
            "endpoints", Map.of(
                "scan", "POST /api/v1/scan",
                "history", "GET /api/v1/history",
                "stats", "GET /api/v1/stats",
                "health", "GET /health"
            )
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
