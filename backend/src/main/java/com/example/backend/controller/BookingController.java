package com.example.backend.controller;

import com.example.backend.dto.BookingRequest;
import com.example.backend.entity.Bookings;
import com.example.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@PreAuthorize("hasRole('USER')")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Map<String, String>> bookEvent(
            @RequestBody BookingRequest request,
            @RequestAttribute Long userId) {
        String message = bookingService.bookEvent(userId, request.getEventId(), request.getTotalTickets());
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/mybookings")
    public ResponseEntity<List<Bookings>> getMyBookings(@RequestAttribute Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, String>> deleteBooking(
            @PathVariable Long bookingId,
            @RequestAttribute Long userId) {
        bookingService.deleteBooking(bookingId, userId);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
    }

    @GetMapping("/booking/{id}/tickets")
    public ResponseEntity<List<String>> getTicketQRCodes(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getTicketQRCodes(id));
    }
}