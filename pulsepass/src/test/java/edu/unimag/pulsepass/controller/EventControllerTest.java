package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.domain.EventCategory;
import edu.unimag.pulsepass.domain.EventStatus;
import edu.unimag.pulsepass.dto.request.CreateEventRequest;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.dto.response.EventSummaryResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.security.JwtService;
import edu.unimag.pulsepass.security.RestAccessDeniedHandler;
import edu.unimag.pulsepass.security.RestAuthenticationEntryPoint;
import edu.unimag.pulsepass.security.SecurityConfig;
import edu.unimag.pulsepass.security.AuthorizationService;
import edu.unimag.pulsepass.service.EventService;
import edu.unimag.pulsepass.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean(name = "authz")
    private AuthorizationService authz;



    private EventResponse event(EventStatus status) {
        return new EventResponse(1L, "CMF-2026", "Caribbean Music Fest", "Festival de musica",
                EventCategory.MUSIC, status, LocalDateTime.now().plusDays(10), 18,
                "VEN-SMR-01", "Marina Convention Center", List.of());
    }

    private EventSummaryResponse summary(String code, EventStatus status) {
        return new EventSummaryResponse(code, "Evento " + code, status,
                LocalDateTime.now().plusDays(10), "Marina Convention Center");
    }

    private CreateEventRequest validCreateRequest() {
        return new CreateEventRequest("CMF-2026", "Caribbean Music Fest", "Festival de musica",
                EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "VEN-SMR-01");
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-001 (T-SEC-004): ADMIN crea evento valido retorna 201")
    @WithMockUser(roles = "ADMIN")
    void create_AsAdmin_Returns201() throws Exception {
        when(eventService.create(any(CreateEventRequest.class))).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.venueName").value("Marina Convention Center"));

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-002 (T-SEC-018): ADMIN con request invalido retorna 400 y no llama al servicio")
    @WithMockUser(roles = "ADMIN")
    void create_AsAdmin_InvalidRequest_Returns400() throws Exception {
        CreateEventRequest request = new CreateEventRequest("", "", "", null, null, -1, "");

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.eventCode").exists());

        verify(eventService, never()).create(any());
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-003 (T-SEC-002): Anonimo crea evento retorna 401 y no llama al servicio")
    void create_Anonymous_Returns401() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(eventService);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-004 (T-SEC-003): USER crea evento retorna 403 y no llama al servicio")
    @WithMockUser(roles = "USER")
    void create_AsUser_Returns403() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(eventService);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-005: STAFF crea evento retorna 403 (solo ADMIN)")
    @WithMockUser(roles = "STAFF")
    void create_AsStaff_Returns403() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isForbidden());

        verifyNoInteractions(eventService);
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-006 (T-SEC-001): Anonimo lista eventos publicados retorna 200")
    void getPublishedEvents_Anonymous_Returns200() throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of(summary("CMF-2026", EventStatus.PUBLISHED)));

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(eventService).findPublishedEvents();
    }


    @Test
    @DisplayName("TEST-CTRL-EVT-007: Anonimo consulta evento PUBLICADO retorna 200")
    void getByCode_Anonymous_Published_Returns200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.PUBLISHED));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.venueName").value("Marina Convention Center"));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-008 (T-SEC-017): Anonimo consulta BORRADOR retorna 404 sin exponer datos")
    void getByCode_Anonymous_Draft_Returns404() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.eventCode").doesNotExist())
                .andExpect(jsonPath("$.venueName").doesNotExist());
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-009: USER consulta BORRADOR retorna 404")
    @WithMockUser(roles = "USER")
    void getByCode_AsUser_Draft_Returns404() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-010: STAFF consulta BORRADOR retorna 200")
    @WithMockUser(roles = "STAFF")
    void getByCode_AsStaff_Draft_Returns200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-011: ADMIN consulta BORRADOR retorna 200")
    @WithMockUser(roles = "ADMIN")
    void getByCode_AsAdmin_Draft_Returns200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-012: Evento inexistente retorna 404")
    void getByCode_NotFound_Returns404() throws Exception {
        when(eventService.findByCode("INVALID"))
                .thenThrow(new ResourceNotFoundException("Evento no encontrado"));

        mockMvc.perform(get("/api/events/INVALID"))
                .andExpect(status().isNotFound());
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-013 (T-SEC-014): ADMIN publica evento retorna 200")
    @WithMockUser(roles = "ADMIN")
    void publish_AsAdmin_Returns200() throws Exception {
        when(eventService.publish("CMF-2026")).thenReturn(event(EventStatus.PUBLISHED));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-014: ADMIN publica evento no publicable retorna 409")
    @WithMockUser(roles = "ADMIN")
    void publish_AsAdmin_Invalid_Returns409() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException("El evento ya esta publicado o cancelado"));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-015 (UC-SEC-08): USER publica evento retorna 403 y no se ejecuta publish")
    @WithMockUser(roles = "USER")
    void publish_AsUser_Returns403() throws Exception {
        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(eventService);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-016: Anonimo publica evento retorna 401")
    void publish_Anonymous_Returns401() throws Exception {
        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(eventService);
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-017: ADMIN asocia artista retorna 200")
    @WithMockUser(roles = "ADMIN")
    void addArtist_AsAdmin_Returns200() throws Exception {
        when(eventService.addArtist("CMF-2026", 1L)).thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isOk());

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-018: USER asocia artista retorna 403 y no llama al servicio")
    @WithMockUser(roles = "USER")
    void addArtist_AsUser_Returns403() throws Exception {
        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(eventService);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-019: Anonimo asocia artista retorna 401")
    void addArtist_Anonymous_Returns401() throws Exception {
        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(eventService);
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-020: Anonimo busca por artista y solo recibe eventos publicados")
    void getByArtist_Anonymous_OnlyPublished() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(
                summary("CMF-2026", EventStatus.PUBLISHED),
                summary("SECRETO-01", EventStatus.DRAFT)));

        mockMvc.perform(get("/api/events/by-artist").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-021: STAFF busca por artista y recibe todos los estados")
    @WithMockUser(roles = "STAFF")
    void getByArtist_AsStaff_ReturnsAll() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(
                summary("CMF-2026", EventStatus.PUBLISHED),
                summary("SECRETO-01", EventStatus.DRAFT)));

        mockMvc.perform(get("/api/events/by-artist").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }



    @Test
    @DisplayName("TEST-CTRL-EVT-022: STAFF lista tickets pagados retorna 200")
    @WithMockUser(roles = "STAFF")
    void paidTickets_AsStaff_Returns200() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026")).thenReturn(List.of());

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isOk());

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-023: USER lista tickets pagados retorna 403 y no llama al servicio")
    @WithMockUser(roles = "USER")
    void paidTickets_AsUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-024: Anonimo lista tickets pagados retorna 401")
    void paidTickets_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketService);
    }
}