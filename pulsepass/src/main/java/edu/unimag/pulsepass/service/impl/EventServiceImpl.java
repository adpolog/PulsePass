package edu.unimag.pulsepass.service.impl;
import edu.unimag.pulsepass.domain.Artist;
import edu.unimag.pulsepass.domain.Event;
import edu.unimag.pulsepass.domain.EventStatus;
import edu.unimag.pulsepass.domain.Venue;
import edu.unimag.pulsepass.dto.request.CreateEventRequest;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.dto.response.EventSummaryResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.DuplicateResourceException;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.mapper.EventMapper;
import edu.unimag.pulsepass.repository.ArtistRepository;
import edu.unimag.pulsepass.repository.EventRepository;
import edu.unimag.pulsepass.repository.VenueRepository;
import edu.unimag.pulsepass.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository,
                            ArtistRepository artistRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("El código de evento ya existe."); // BR-EVENT-001
        }

        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue no encontrado.")); // BR-EVENT-002

        if (!venue.getActive()) {
            throw new BusinessRuleException("El venue no está activo."); // BR-EVENT-003
        }

        if (request.eventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("La fecha del evento debe ser futura."); // BR-EVENT-004
        }

        if (request.minimumAge() < 0) {
            throw new BusinessRuleException("La edad mínima debe ser mayor o igual a 0."); // BR-EVENT-006
        }

        Event event = new Event();
        event.setEventCode(request.eventCode());
        event.setName(request.name());
        event.setDescription(request.description());
        event.setCategory(request.category());
        event.setEventDate(request.eventDate());
        event.setMinimumAge(request.minimumAge());
        event.setVenue(venue);
        event.setStatus(EventStatus.DRAFT); // BR-EVENT-005

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado."));

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Solo se puede publicar un evento en estado DRAFT."); // BR-EVENT-007
        }
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("El evento debe tener fecha futura para publicarse."); // BR-EVENT-008
        }
        if (!event.getVenue().getActive()) {
            throw new BusinessRuleException("El venue asociado debe estar activo."); // BR-EVENT-009
        }

        event.setStatus(EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado."));

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado."));

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("No se pueden agregar artistas a eventos cancelados o finalizados."); // BR-EVENT-011
        }

        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException("El artista ya está asociado al evento."); // BR-EVENT-010
        }

        event.getArtists().add(artist);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        throw new UnsupportedOperationException("Requiere implementación de query en EventRepository");
    }
}