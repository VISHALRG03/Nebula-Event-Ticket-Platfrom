package com.example.backend.service;

import com.example.backend.entity.Events;
import com.example.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Events getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    // ✅ NEW: Get first page with 8 events
    public List<Events> getFirstPageEvents() {
        Pageable firstPageWith8Items = PageRequest.of(0, 8, Sort.by("date").descending());
        Page<Events> page = eventRepository.findAll(firstPageWith8Items);
        return page.getContent();
    }

    // ✅ NEW: Get any page with 8 events
    public List<Events> getEventsByPage(int page) {
        Pageable pageable = PageRequest.of(page - 1, 8, Sort.by("date").descending());
        Page<Events> pageResult = eventRepository.findAll(pageable);
        return pageResult.getContent();
    }

    // ✅ NEW: Get pagination info
    public Page<Events> getEventsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("date").descending());
        return eventRepository.findAll(pageable);
    }
}