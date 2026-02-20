package com.example.backend.repository;

import com.example.backend.entity.Tickets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Tickets, Long> {

    List<Tickets> findByBookingId(Long bookingId);

    Optional<Tickets> findByQrCode(String qrCode);

    @Query("SELECT COUNT(t) > 0 FROM Tickets t WHERE t.booking.id = :bookingId")
    boolean existsByBookingId(@Param("bookingId") Long bookingId);

    @Query("SELECT COUNT(t) FROM Tickets t WHERE t.booking.id = :bookingId AND t.checkedIn = true")
    long countScannedTicketsByBookingId(@Param("bookingId") Long bookingId);
}
