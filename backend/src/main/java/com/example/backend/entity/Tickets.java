package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Tickets {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnoreProperties("tickets")
    private Bookings booking;

    @ManyToOne
    private Events event;

    @Column(nullable = false, unique = true)
    private String qrCode;

    @Column(nullable = false)
    private boolean checkedIn = false;

    @Column
    private LocalDateTime checkedInAt;  // Add this field

    private int ticketNumber;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Bookings getBooking() { return booking; }
    public void setBooking(Bookings booking) { this.booking = booking; }

    public Events getEvent() { return event; }
    public void setEvent(Events event) { this.event = event; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public boolean isCheckedIn() { return checkedIn; }
    public void setCheckedIn(boolean checkedIn) { this.checkedIn = checkedIn; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public int getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(int ticketNumber) { this.ticketNumber = ticketNumber; }
}