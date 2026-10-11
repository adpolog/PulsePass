package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.domain.EventCategory;
import edu.unimag.pulsepass.domain.EventStatus;
import edu.unimag.pulsepass.dto.request.CreateEventRequest;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.dto.response.EventSummaryResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.service.EventService;
import edu.unimag.pulsepass.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
@Import(GlobalExceptionHandler.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    @Test
    @DisplayName("TEST-CTRL-EVT-001: Crear evento valido retorna 201 Created")
    void create_ValidRequest_Returns201() throws Exception {
        CreateEventRequest request = new CreateEventRequest("CMF-2026", "Caribbean Music Fest", "Festival de musica", EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "VEN-SMR-01");
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest",
                "Festival de musica",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );

        when(eventService.create(any(CreateEventRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.venueName").value("Marina Convention Center"));

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-002: Request invalido retorna 400 Bad Request y no llama al servicio")
    void create_InvalidRequest_Returns400() throws Exception {
        CreateEventRequest request = new CreateEventRequest("", "", "", null, null, -1, "");

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.eventCode").exists());

        verify(eventService, never()).create(any());
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-003: Consultar evento existente retorna 200 OK")
    void getByCode_Existing_Returns200() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest",
                "Festival de musica",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );
        when(eventService.findByCode("CMF-2026")).thenReturn(response);

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.venueName").value("Marina Convention Center"));

        verify(eventService).findByCode("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-004: Consultar evento inexistente retorna 404 Not Found")
    void getByCode_NotFound_Returns404() throws Exception {
        when(eventService.findByCode("INVALID")).thenThrow(new ResourceNotFoundException("Evento no encontrado"));

        mockMvc.perform(get("/api/events/INVALID"))
                .andExpect(status().isNotFound());

        verify(eventService).findByCode("INVALID");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-005: Listar eventos publicados retorna 200 OK")
    void getPublishedEvents_Returns200() throws Exception {
        List<EventSummaryResponse> events = List.of(
                new EventSummaryResponse("CMF-2026", "Caribbean Music Fest", EventStatus.PUBLISHED, LocalDateTime.now().plusDays(10), "Marina Convention Center")
        );
        when(eventService.findPublishedEvents()).thenReturn(events);

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(eventService).findPublishedEvents();
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-006: Publicar evento valido retorna 200 OK")
    void publish_Valid_Returns200() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest",
                "Festival de musica",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );
        when(eventService.publish("CMF-2026")).thenReturn(response);

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-007: Publicar evento invalido retorna 409 Conflict")
    void publish_Invalid_Returns409() throws Exception {
        when(eventService.publish("CMF-2026")).thenThrow(new BusinessRuleException("El evento ya esta publicado o cancelado"));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-008: Asociar artista retorna 200 OK")
    void addArtist_Returns200() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest",
                "Festival de musica",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );
        when(eventService.addArtist("CMF-2026", 1L)).thenReturn(response);

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isOk());

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-009: Buscar por artista retorna 200 OK")
    void getByArtist_Returns200() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of());

        mockMvc.perform(get("/api/events/by-artist").param("stageName", "Solar Beat"))
                .andExpect(status().isOk());

        verify(eventService).findByArtist("Solar Beat");
    }
}