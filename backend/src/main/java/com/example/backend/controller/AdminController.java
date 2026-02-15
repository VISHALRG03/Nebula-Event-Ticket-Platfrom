package com.example.backend.controller;

import com.example.backend.entity.Bookings;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // ADMIN see all Bookings
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/bookings")
    public List<Bookings> getAllBookings() {
        return bookingRepository.findAll();
    }

    // See All Registered Users
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/registerusers")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // See All Users By ROLE USER
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user")
    public List<User> getAllUsersByRole() {
        return userRepository.findByRole(Role.USER);
    }

    // See All Ticket Checkers
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/ticket-checkers")
    public List<User> getAllTicketCheckers() {
        return userRepository.findByRole(Role.TICKET_CHECKER);
    }
}
