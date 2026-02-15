package com.example.backend.controller;

import com.example.backend.dto.BookingRequest;
import com.example.backend.entity.Bookings;
import com.example.backend.entity.Tickets;
import com.example.backend.repository.TicketRepository;
import com.example.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    BookingService bookingService;
    @Autowired TicketRepository ticketRepository;

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<?> bookEvent(
            @RequestBody BookingRequest bookingRequest,
            @RequestAttribute Long userId) { // ✅ Get userId from JWT token

        String msg = bookingService.bookEvent(
                userId,
                bookingRequest.getEventId(),
                bookingRequest.getTotalTickets()
        );

        System.out.println("UserID from JWT: " + userId);

        return ResponseEntity.ok(msg);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/mybookings")
    public List<Bookings> getMyBookings(@RequestAttribute Long userId) {
        return bookingService.getBookingsByUser(userId);
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long bookingId,
            @RequestAttribute Long userId) {
        bookingService.deleteBooking(bookingId, userId);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
    }

    @GetMapping("/booking/{id}/tickets")
    public List<Tickets> getTickets(@PathVariable Long id) {
        return ticketRepository.findByBookingId(id);
    }


}
