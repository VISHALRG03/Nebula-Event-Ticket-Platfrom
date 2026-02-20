package com.example.backend.controller;

import com.example.backend.entity.Events;
import com.example.backend.service.EventService;
import com.example.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/events")
    public ResponseEntity<List<Events>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/events/page/{pageNumber}")
    public ResponseEntity<Map<String, Object>> getEventsByPage(@PathVariable int pageNumber) {
        Page<Events> page = eventService.getEventsPage(pageNumber, 8);

        Map<String, Object> response = new HashMap<>();
        response.put("events", page.getContent());
        response.put("currentPage", pageNumber);
        response.put("totalPages", page.getTotalPages());
        response.put("totalItems", page.getTotalElements());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<Events> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/admin/events", consumes = {"multipart/form-data"})
    public ResponseEntity<Events> createEvent(
            @RequestParam("name") String name,
            @RequestParam("artist") String artist,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("time") String time,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Events event = eventService.createEvent(name, artist, location, date, time, image);
        return ResponseEntity.ok(event);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<Map<String, String>> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot delete event with existing bookings"));
        }
    }
}