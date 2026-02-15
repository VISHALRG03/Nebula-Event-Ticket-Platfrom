package com.example.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")  // ✅ Add /api prefix
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    @GetMapping("/check-role")
    @PreAuthorize("hasRole('TICKET_CHECKER')")
    public String checkRole() {
        return "✅ You have TICKET_CHECKER role!";
    }
}