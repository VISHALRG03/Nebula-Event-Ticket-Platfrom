package com.example.backend.controller;

import com.example.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
public class TicketScanController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/validate")
    public ResponseEntity<?> validateTicket(@RequestBody Map<String, String> request) {
        String qrCode = request.get("qrCode");
        System.out.println("🔍 SCAN REQUEST: " + qrCode);

        Map<String, Object> result = ticketService.validateTicket(qrCode);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status/{bookingId}")
    public ResponseEntity<?> getTicketStatus(@PathVariable Long bookingId) {
        System.out.println("📊 STATUS REQUEST: Booking ID = " + bookingId);

        Map<String, Object> status = ticketService.getTicketStatus(bookingId);
        return ResponseEntity.ok(status);
    }

    // ✅ COMPLETELY PUBLIC ENDPOINT - Bina kisi security ke
    @GetMapping("/public/status/{bookingId}")
    public ResponseEntity<?> getPublicTicketStatus(@PathVariable Long bookingId) {
        System.out.println("📊 COMPLETELY PUBLIC STATUS: Booking ID = " + bookingId);
        Map<String, Object> status = ticketService.getTicketStatus(bookingId);
        return ResponseEntity.ok(status);
    }
}