package com.example.backend.repository;

import com.example.backend.entity.Events;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EventRepository extends JpaRepository<Events, Long> {

    // ✅ Add this method for pagination
    Page<Events> findAll(Pageable pageable);

    // Optional: Custom query with sorting
    @Query("SELECT e FROM Events e ORDER BY e.date DESC")
    Page<Events> findAllSortedByDate(Pageable pageable);
}