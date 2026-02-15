package com.example.backend.repository;

import com.example.backend.entity.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Bookings, Long> {

    //List<Bookings> getBookingByUser(Long userId);
    List<Bookings> findByUserId(Long userId);
}
