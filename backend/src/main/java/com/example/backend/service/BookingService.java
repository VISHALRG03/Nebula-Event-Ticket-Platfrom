package com.example.backend.service;

import com.example.backend.entity.Bookings;
import com.example.backend.entity.Events;
import com.example.backend.entity.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class BookingService {

    @Autowired  UserRepository userRepository;
    @Autowired  EventRepository eventRepository;
    @Autowired  BookingRepository bookingRepository;


    public String bookEvent(Long userId, Long eventId, int count) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Events events = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Bookings booking = new Bookings();
        booking.setUser(user);
        booking.setEvent(events);
        booking.setTotalTickets(count);
        booking.setQrGenerated(true);
        bookingRepository.save(booking);

        return "Booking done successfully!";
    }

    // Get all bookings by user
    public List<Bookings> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Delete booking by user
    public void deleteBooking(Long bookingId, Long userId) {

        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own bookings");
        }

        bookingRepository.delete(booking);
    }
}
