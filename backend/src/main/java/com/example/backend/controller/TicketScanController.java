package com.example.backend.controller;

import com.example.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scan")
public class TicketScanController {

    @Autowired
    private TicketService ticketService;

    @PreAuthorize("hasRole('TICKET_CHECKER')")
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateTicket(@RequestBody Map<String, String> request) {
        String qrCode = request.get("qrCode");
        return ResponseEntity.ok(ticketService.validateTicket(qrCode));
    }

    @PreAuthorize("hasRole('TICKET_CHECKER')")
    @GetMapping("/status/{bookingId}")
    public ResponseEntity<Map<String, Object>> getTicketStatus(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ticketService.getTicketStatus(bookingId));
    }

    @GetMapping("/public/status/{bookingId}")
    public ResponseEntity<Map<String, Object>> getPublicTicketStatus(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ticketService.getTicketStatus(bookingId));
    }
}