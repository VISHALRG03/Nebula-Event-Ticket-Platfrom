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

    // ✅ CHECKER SCAN KAREGA - YEH FUNCTION CALL HOGA
    @Transactional
    public Map<String, Object> validateTicket(String qrCode) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. QR code se ticket dhundo
            Tickets ticket = ticketRepository.findByQrCode(qrCode)
                    .orElseThrow(() -> new RuntimeException("Invalid Ticket ❌"));

            System.out.println("🔍 Ticket mila: ID=" + ticket.getId() +
                    ", Booking ID=" + ticket.getBooking().getId() +
                    ", CheckedIn=" + ticket.isCheckedIn());

            // 2. Check karo pehle se scan to nahi hai
            if (ticket.isCheckedIn()) {
                response.put("status", "error");
                response.put("message", "❌ Ticket already used!");
                response.put("ticketNumber", ticket.getTicketNumber());
                response.put("eventName", ticket.getEvent().getName());
                response.put("usedAt", ticket.getCheckedInAt());
                return response;
            }

            // 3. Ticket ko scan mark karo
            ticket.setCheckedIn(true);
            ticket.setCheckedInAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            // 4. Booking ID nikaalo
            Long bookingId = ticket.getBooking().getId();

            // 5. Count karo kitne tickets scan hue is booking mein
            long scannedCount = ticketRepository.countScannedTicketsByBookingId(bookingId);
            List<Tickets> allTickets = ticketRepository.findByBookingId(bookingId);

            // 6. Response prepare karo - CHECKER KO YE DIKHEGA
            response.put("status", "success");
            response.put("message", "✅ Valid Ticket! Enjoy the event!");
            response.put("ticketNumber", ticket.getTicketNumber());
            response.put("eventName", ticket.getEvent().getName());
            response.put("attendeeName", ticket.getBooking().getUser().getName());
            response.put("bookingId", bookingId);
            response.put("checkedInAt", LocalDateTime.now().toString());

            // ✅ IMPORTANT - Ye fields USER SIDE NOTIFICATION ke liye
            response.put("anyTicketScanned", true);
            response.put("scannedTickets", scannedCount);
            response.put("totalTickets", (long) allTickets.size());

            System.out.println("✅ SCAN SUCCESS: Booking ID: " + bookingId +
                    ", Scanned: " + scannedCount + "/" + allTickets.size());

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            System.out.println("❌ SCAN ERROR: " + e.getMessage());
        }

        return response;
    }

    // ✅ USER KI POLLING KE LIYE - HAR 3 SECOND MEIN YE CALL HOGA
    public Map<String, Object> getTicketStatus(Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Saare tickets dhundo is booking ke
            List<Tickets> tickets = ticketRepository.findByBookingId(bookingId);

            if (tickets.isEmpty()) {
                response.put("anyTicketScanned", false);
                response.put("scannedTickets", 0);
                response.put("totalTickets", 0);
                response.put("eventName", "");
                return response;
            }

            // Count scanned tickets
            long scannedCount = tickets.stream()
                    .filter(Tickets::isCheckedIn)
                    .count();

            // Pehla ticket leke event name nikaalo
            String eventName = tickets.get(0).getEvent().getName();

            // ✅ YE RESPONSE USER KO JAYEGA - isi se frontend notification trigger karega
            response.put("anyTicketScanned", scannedCount > 0);
            response.put("scannedTickets", scannedCount);
            response.put("totalTickets", (long) tickets.size());
            response.put("eventName", eventName);

            System.out.println("📊 STATUS CHECK: Booking " + bookingId +
                    " - " + scannedCount + "/" + tickets.size() + " scanned");

        } catch (Exception e) {
            response.put("anyTicketScanned", false);
            response.put("scannedTickets", 0);
            response.put("totalTickets", 0);
            System.out.println("❌ STATUS ERROR: " + e.getMessage());
        }

        return response;
    }
}