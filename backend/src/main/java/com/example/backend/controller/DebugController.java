package com.example.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @PreAuthorize("hasRole('TICKET_CHECKER')")
    @GetMapping("/check-role")
    public String checkRole() {
        return "✅ TICKET_CHECKER role is working!";
    }

    @PreAuthorize("hasRole('TICKET_CHECKER')")
    @PostMapping("/test-validate")
    public String testValidate() {
        return "✅ POST method with TICKET_CHECKER role is working!";
    }
}