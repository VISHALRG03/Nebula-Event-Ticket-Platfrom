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
@PreAuthorize("hasRole('USER')")
public class QrController {

    @Autowired
    private QrGeneratorService qrGeneratorService;

    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<Map<String, Object>> generateQr(@PathVariable Long bookingId) {
        List<String> qrCodes = qrGeneratorService.generateTicketsForBooking(bookingId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "qrCodes", qrCodes
        ));
    }
}