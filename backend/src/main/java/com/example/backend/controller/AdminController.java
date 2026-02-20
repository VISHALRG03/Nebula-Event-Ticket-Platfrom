package com.example.backend.controller;

import com.example.backend.entity.Bookings;
import com.example.backend.entity.User;
import com.example.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/bookings")
    public ResponseEntity<List<Bookings>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/registerusers")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/user")
    public ResponseEntity<List<User>> getRegularUsers() {
        return ResponseEntity.ok(adminService.getUsersByRole("USER"));
    }

    @GetMapping("/ticket-checkers")
    public ResponseEntity<List<User>> getTicketCheckers() {
        return ResponseEntity.ok(adminService.getUsersByRole("TICKET_CHECKER"));
    }
}