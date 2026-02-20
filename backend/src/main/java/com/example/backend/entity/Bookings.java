package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties("booking")
    private List<Tickets> tickets;


    private boolean qrGenerated = false;

    // Add transient field or calculate in service
    @Transient
    private Integer ticketsUsed;


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


    public void setQrGenerated(boolean qrGenerated) {
        this.qrGenerated = qrGenerated;
    }
    public boolean isQrGenerated() {
        return qrGenerated;
    }

    public List<Tickets> getTickets() { return tickets; }
    public void setTickets(List<Tickets> tickets) { this.tickets = tickets; }


    @Transient
    public Integer getTicketsUsed() {
        if (tickets != null) {
            return (int) tickets.stream().filter(Tickets::isCheckedIn).count();
        }
        return 0;
    }
}
