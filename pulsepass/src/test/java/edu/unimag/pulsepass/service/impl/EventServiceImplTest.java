package edu.unimag.pulsepass.service.impl;

import edu.unimag.pulsepass.domain.Event;
import edu.unimag.pulsepass.domain.EventCategory;
import edu.unimag.pulsepass.domain.EventStatus;
import edu.unimag.pulsepass.domain.Venue;
import edu.unimag.pulsepass.dto.request.CreateEventRequest;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.mapper.EventMapper;
import edu.unimag.pulsepass.repository.ArtistRepository;
import edu.unimag.pulsepass.repository.EventRepository;
import edu.unimag.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void findByCode_WhenExists_ShouldReturnResponse() {
        Event event = new Event();
        EventResponse response = new EventResponse(1L, "CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(10),
                18, "VEN-01", "Arena", Collections.emptyList());

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result = eventService.findByCode("CMF-2026");

        assertThat(result).isNotNull();
        assertThat(result.eventCode()).isEqualTo("CMF-2026");
        verify(eventRepository).findByEventCode("CMF-2026");
    }

    @Test
    void findByCode_WhenNotFound_ShouldThrowResourceNotFoundException() {
        when(eventRepository.findByEventCode("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.findByCode("INVALID"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_WhenValid_ShouldSaveAndReturnResponse() {
        CreateEventRequest request = new CreateEventRequest("CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "VEN-01");

        Venue venue = new Venue();
        venue.setActive(true);

        Event event = new Event();
        EventResponse response = new EventResponse(1L, "CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, EventStatus.DRAFT, request.eventDate(),
                18, "VEN-01", "Arena", Collections.emptyList());

        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-01")).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result = eventService.create(request);

        assertThat(result).isNotNull();
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void create_WhenVenueNotFound_ShouldThrowExceptionAndNeverSave() {
        CreateEventRequest request = new CreateEventRequest("CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "INVALID");

        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void create_WhenVenueInactive_ShouldThrowBusinessRuleException() {
        CreateEventRequest request = new CreateEventRequest("CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "VEN-01");

        Venue venue = new Venue();
        venue.setActive(false);

        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-01")).thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void create_WhenPastDate_ShouldThrowBusinessRuleException() {
        CreateEventRequest request = new CreateEventRequest("CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, LocalDateTime.now().minusDays(1), 18, "VEN-01");

        Venue venue = new Venue();
        venue.setActive(true);

        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-01")).thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void publish_WhenDraftAndValid_ShouldPublish() {
        Venue venue = new Venue();
        venue.setActive(true);

        Event event = new Event();
        event.setStatus(EventStatus.DRAFT);
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setVenue(venue);

        EventResponse response = new EventResponse(1L, "CMF-2026", "Music Fest", "Desc",
                EventCategory.MUSIC, EventStatus.PUBLISHED, event.getEventDate(),
                18, "VEN-01", "Arena", Collections.emptyList());

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result = eventService.publish("CMF-2026");

        assertThat(result.status()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(event);
    }

    @Test
    void publish_WhenCancelled_ShouldThrowExceptionAndNeverSave() {
        Event event = new Event();
        event.setStatus(EventStatus.CANCELLED);

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.publish("CMF-2026"))
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never()).save(any());
    }
}