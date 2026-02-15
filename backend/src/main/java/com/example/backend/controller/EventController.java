package com.example.backend.controller;

import com.example.backend.entity.Events;
import com.example.backend.repository.EventRepository;
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
    EventRepository eventRepository;

    @Autowired
    EventService eventService;

    @Autowired
    FileStorageService fileStorageService;

    // ✅ FIXED: consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/admin/events", consumes = {"multipart/form-data"})
    public ResponseEntity<Events> createEvent(
            @RequestParam("name") String name,
            @RequestParam("artist") String artist,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("time") String time,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {  // Changed @RequestParam to @RequestPart

        Events event = new Events();
        event.setName(name);
        event.setArtist(artist);
        event.setLocation(location);
        event.setDate(date);
        event.setTime(time);

        // Handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile, name);
            event.setImageUrl(imageUrl);
        } else {
            // Set default image if no image uploaded
            event.setImageUrl("/uploads/events/default-event.jpg");
        }

        Events savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    // ✅ FIXED: Update method bhi fix karo
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/admin/events/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Events> updateEvent(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("artist") String artist,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("time") String time,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {  // Changed to @RequestPart

        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setName(name);
        event.setArtist(artist);
        event.setLocation(location);
        event.setDate(date);
        event.setTime(time);

        // Update image if new file uploaded
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile, name);
            event.setImageUrl(imageUrl);
        }

        Events updatedEvent = eventRepository.save(event);
        return ResponseEntity.ok(updatedEvent);
    }

    // Rest of the methods remain same...
    @GetMapping("/events")
    public ResponseEntity<List<Events>> getAllEvent(){
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @GetMapping("/events/page/{pageNumber}")
    public ResponseEntity<Map<String, Object>> getEventsByPage(
            @PathVariable int pageNumber) {

        List<Events> events = eventService.getEventsByPage(pageNumber);
        Page<Events> pageInfo = eventService.getEventsPage(pageNumber, 8);

        Map<String, Object> response = new HashMap<>();
        response.put("events", events);
        response.put("currentPage", pageNumber);
        response.put("totalPages", pageInfo.getTotalPages());
        response.put("totalItems", pageInfo.getTotalElements());
        response.put("hasNext", pageInfo.hasNext());
        response.put("hasPrevious", pageInfo.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/events/{id}")
    public Events getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id ){
        if (!eventRepository.existsById(id)) {
            return ResponseEntity
                    .badRequest()
                    .body("Event not found");
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}