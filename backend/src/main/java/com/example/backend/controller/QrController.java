package com.example.backend.controller;

import com.example.backend.service.QrGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "http://localhost:5173")
public class QrController {

    @Autowired
    private QrGeneratorService qrGeneratorService;

    // ✅ USER can generate QR for their booking
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<?> generateQr(@PathVariable Long bookingId) {
        try {
            List<String> qrCodes = qrGeneratorService.generateTicketsForBooking(bookingId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "qrCodes", qrCodes
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}
