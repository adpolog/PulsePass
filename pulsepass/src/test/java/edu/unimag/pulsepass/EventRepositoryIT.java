package edu.unimag.pulsepass;

import edu.unimag.pulsepass.domain.*;
import edu.unimag.pulsepass.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

class EventRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Test
    void shouldCreateAndRetrieveVenueAndEvent() {
        Venue venue = Venue.builder().code("VEN-SMR-01").name("Marina").city("Santa Marta").address("Calle").capacity(5000).build();
        venueRepository.saveAndFlush(venue);

        Event event = Event.builder()
                .eventCode("CMF-2026")
                .name("Festival")
                .category(EventCategory.MUSIC)
                .status(EventStatus.PUBLISHED)
                .eventDate(LocalDateTime.now().plusDays(10))
                .venue(venue)
                .build();
        eventRepository.saveAndFlush(event);

        Event found = eventRepository.findByEventCode("CMF-2026").orElseThrow();
        Assertions.assertEquals("VEN-SMR-01", found.getVenue().getCode());
    }

    @Test
    void shouldFindEventsByArtistWithoutDuplicates() {
        Venue venue = Venue.builder().code("VEN-ART").name("Arena").city("Cartagena").address("Av").capacity(1000).build();
        venueRepository.saveAndFlush(venue);

        Artist artist = artistRepository.findByStageName("Solar Beat").orElseThrow();

        Event event = Event.builder()
                .eventCode("EVT-ART")
                .name("Solar Show")
                .category(EventCategory.MUSIC)
                .status(EventStatus.PUBLISHED)
                .eventDate(LocalDateTime.now().plusDays(5))
                .venue(venue)
                .artists(Set.of(artist))
                .build();
        eventRepository.saveAndFlush(event);

        List<Event> events = eventRepository.findEventsByArtist("Solar Beat");
        Assertions.assertFalse(events.isEmpty());
    }
}