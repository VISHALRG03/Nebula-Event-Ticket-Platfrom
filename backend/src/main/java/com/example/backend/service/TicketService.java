package com.example.backend.service;

import com.example.backend.entity.Tickets;
import com.example.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Transactional
    public Map<String, Object> validateTicket(String qrCode) {
        Map<String, Object> response = new HashMap<>();

        Tickets ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid ticket"));

        if (ticket.isCheckedIn()) {
            response.put("status", "error");
            response.put("message", "Ticket already used");
            response.put("ticketNumber", ticket.getTicketNumber());
            response.put("eventName", ticket.getEvent().getName());
            response.put("usedAt", ticket.getCheckedInAt());
            return response;
        }

        ticket.setCheckedIn(true);
        ticket.setCheckedInAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        Long bookingId = ticket.getBooking().getId();
        long scannedCount = ticketRepository.countScannedTicketsByBookingId(bookingId);
        List<Tickets> allTickets = ticketRepository.findByBookingId(bookingId);

        response.put("status", "success");
        response.put("message", "Valid ticket! Enjoy the event!");
        response.put("ticketNumber", ticket.getTicketNumber());
        response.put("eventName", ticket.getEvent().getName());
        response.put("attendeeName", ticket.getBooking().getUser().getName());
        response.put("bookingId", bookingId);
        response.put("scannedTickets", scannedCount);
        response.put("totalTickets", (long) allTickets.size());

        return response;
    }

    public Map<String, Object> getTicketStatus(Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        List<Tickets> tickets = ticketRepository.findByBookingId(bookingId);

        if (tickets.isEmpty()) {
            response.put("anyTicketScanned", false);
            response.put("scannedTickets", 0);
            response.put("totalTickets", 0);
            response.put("eventName", "");
            return response;
        }

        long scannedCount = tickets.stream()
                .filter(Tickets::isCheckedIn)
                .count();

        response.put("anyTicketScanned", scannedCount > 0);
        response.put("scannedTickets", scannedCount);
        response.put("totalTickets", (long) tickets.size());
        response.put("eventName", tickets.get(0).getEvent().getName());

        return response;
    }
}