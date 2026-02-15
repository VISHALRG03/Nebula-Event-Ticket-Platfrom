package com.example.backend.dto;

import lombok.Data;

@Data
public class BookingRequest {

    private Long eventId;
    private int totalTickets;

    // Note: userId will come from JWT token, not from request body
    // So we don't need userId field here


    public Long getEventId() {
        return eventId;
    }
    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Integer getTotalTickets() {
        return totalTickets;
    }
    public void setTotalTickets(Integer totalTickets) {
        this.totalTickets = totalTickets;
    }
}