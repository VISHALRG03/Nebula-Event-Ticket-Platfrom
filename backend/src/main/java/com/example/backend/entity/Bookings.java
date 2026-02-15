package com.example.backend.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Bookings {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private  User user;

    @ManyToOne
    private Events event;

    private  int totalTickets;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tickets> tickets;


    private boolean qrGenerated;


    // GETTERS  &    SETTERS

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    public Events getEvent() {
        return event;
    }
    public void setEvent(Events event) {
        this.event = event;
    }

    public int getTotalTickets() {
        return totalTickets;
    }
    public void setTotalTickets(int totalTickets) {
        this.totalTickets = totalTickets;
    }


    public void setQrGenerated(boolean b) {
        this.qrGenerated = qrGenerated;
    }
    public boolean isQrGenerated() {
        return qrGenerated;
    }

    public List<Tickets> getTickets() { return tickets; }
    public void setTickets(List<Tickets> tickets) { this.tickets = tickets; }
}
