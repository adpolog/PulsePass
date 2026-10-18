package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.domain.EventStatus;
import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.dto.request.CreateEventRequest;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.dto.response.EventSummaryResponse;
import edu.unimag.pulsepass.dto.response.TicketResponse;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.service.EventService;
import edu.unimag.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService;

    public EventController(EventService eventService, TicketService ticketService) {
        this.eventService = eventService;
        this.ticketService = ticketService;
    }

    // ADMIN
    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request));
    }


    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> findByCode(@PathVariable String eventCode) {
        EventResponse event = eventService.findByCode(eventCode);
        if (event.status() != EventStatus.PUBLISHED && !isStaffOrAdmin()) {
            throw new ResourceNotFoundException("Evento no encontrado.");
        }
        return ResponseEntity.ok(event);
    }


    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>> findPublishedEvents() {
        return ResponseEntity.ok(eventService.findPublishedEvents());
    }

    // ADMIN
    @PatchMapping("/{eventCode}/publish")
    public ResponseEntity<EventResponse> publish(@PathVariable String eventCode) {
        return ResponseEntity.ok(eventService.publish(eventCode));
    }

    // ADMIN
    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<EventResponse> addArtist(@PathVariable String eventCode, @PathVariable Long artistId) {
        return ResponseEntity.ok(eventService.addArtist(eventCode, artistId));
    }


    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> findByArtist(@RequestParam String stageName) {
        List<EventSummaryResponse> events = eventService.findByArtist(stageName);
        if (!isStaffOrAdmin()) {
            events = events.stream()
                    .filter(e -> e.status() == EventStatus.PUBLISHED)
                    .toList();
        }
        return ResponseEntity.ok(events);
    }

    // STAFF/ADMIN
    @GetMapping("/{eventCode}/tickets/paid")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }

    private boolean isStaffOrAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.STAFF.getAuthority())
                        || a.getAuthority().equals(Role.ADMIN.getAuthority()));
    }
}