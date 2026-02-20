package com.example.backend.service;

import com.example.backend.entity.Bookings;
import com.example.backend.entity.Events;
import com.example.backend.entity.Tickets;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class QrGeneratorService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Transactional
    public List<String> generateTicketsForBooking(Long bookingId) {
        if (ticketRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "QR codes already generated for this booking"
            );
        }

        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        String userName = booking.getUser().getName();
        int totalTickets = booking.getTotalTickets();
        List<String> qrCodes = new ArrayList<>();

        for (int i = 1; i <= totalTickets; i++) {
            Tickets ticket = new Tickets();
            ticket.setBooking(booking);
            ticket.setEvent(booking.getEvent());
            ticket.setTicketNumber(i);

            String qrContent = String.format(
                    "%d|%d|%d|%s|%s",
                    booking.getId(),
                    booking.getEvent().getId(),
                    i,
                    userName,
                    UUID.randomUUID().toString()
            );

            ticket.setQrCode(qrContent);
            ticketRepository.save(ticket);
            qrCodes.add(qrContent);
        }

        booking.setQrGenerated(true);
        bookingRepository.save(booking);

        return qrCodes;
    }
}