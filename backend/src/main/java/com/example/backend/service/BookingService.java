package com.example.backend.service;

import com.example.backend.entity.Bookings;
import com.example.backend.entity.Events;
import com.example.backend.entity.Tickets;
import com.example.backend.entity.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Transactional
    public String bookEvent(Long userId, Long eventId, int ticketCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Bookings booking = new Bookings();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setTotalTickets(ticketCount);
        booking.setQrGenerated(false);

        bookingRepository.save(booking);
        return "Booking done successfully!";
    }

    public List<Bookings> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteBooking(Long bookingId, Long userId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own bookings");
        }

        bookingRepository.delete(booking);
    }

    public List<String> getTicketQRCodes(Long bookingId) {
        return ticketRepository.findByBookingId(bookingId)
                .stream()
                .map(Tickets::getQrCode)
                .collect(Collectors.toList());
    }
}