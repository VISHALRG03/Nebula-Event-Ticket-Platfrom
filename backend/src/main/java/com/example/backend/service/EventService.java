package com.example.backend.service;

import com.example.backend.entity.Events;
import com.example.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Events> getAllEvents() {
        return eventRepository.findAll();
    }

    public Events getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public Page<Events> getEventsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("date").descending());
        return eventRepository.findAll(pageable);
    }

    @Transactional
    public Events createEvent(String name, String artist, String location,
                              String date, String time, MultipartFile image) {
        Events event = new Events();
        event.setName(name);
        event.setArtist(artist);
        event.setLocation(location);
        event.setDate(date);
        event.setTime(time);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(image, name);
            event.setImageUrl(imageUrl);
        } else {
            event.setImageUrl("/uploads/events/default-event.jpg");
        }

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check for bookings
        if (!event.getBookings().isEmpty()) {
            throw new RuntimeException("Cannot delete event with existing bookings");
        }

        eventRepository.delete(event);
    }
}