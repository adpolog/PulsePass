package edu.unimag.pulsepass.controller;


import edu.unimag.pulsepass.domain.TicketStatus;
import edu.unimag.pulsepass.domain.TicketType;
import edu.unimag.pulsepass.dto.request.PurchaseTicketRequest;
import edu.unimag.pulsepass.dto.response.TicketResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import tools.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import(GlobalExceptionHandler.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TicketService ticketService;

    @Test
    @DisplayName("TEST-CTRL-TKT-001: Compra valida retorna 201 Created")
    void purchase_Valid_Returns201() throws Exception {
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@test.com", "CMF-2026", TicketType.VIP);
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                LocalDateTime.now(),
                "andrea@test.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.purchase(any(PurchaseTicketRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.eventName").value("Caribbean Music Fest 2026"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-002: Request invalido retorna 400 Bad Request")
    void purchase_Invalid_Returns400() throws Exception {
        PurchaseTicketRequest request = new PurchaseTicketRequest("invalid-email", "", null);

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.userEmail").exists());

        verify(ticketService, never()).purchase(any());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-003: Usuario o evento inexistente en compra retorna 404 Not Found")
    void purchase_UserNotFound_Returns404() throws Exception {
        PurchaseTicketRequest request = new PurchaseTicketRequest("unknown@test.com", "CMF-2026", TicketType.VIP);

        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado"));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-004: Regla de negocio incumplida en compra retorna 409 Conflict")
    void purchase_BusinessRuleViolation_Returns409() throws Exception {
        PurchaseTicketRequest request = new PurchaseTicketRequest("laura@test.com", "CMF-2026", TicketType.GENERAL);

        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException("El usuario no cumple con la edad minima"));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El usuario no cumple con la edad minima"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-005: Consultar ticket por codigo retorna 200 OK")
    void getByCode_Returns200() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                LocalDateTime.now(),
                "andrea@test.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );
        when(ticketService.findByCode("TKT-001")).thenReturn(response);

        mockMvc.perform(get("/api/tickets/TKT-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.eventName").value("Caribbean Music Fest 2026"));

        verify(ticketService).findByCode("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-006: Consultar tickets por usuario retorna 200 OK")
    void getByUserEmail_Returns200() throws Exception {
        when(ticketService.findByUserEmail("andrea@test.com")).thenReturn(List.of());

        mockMvc.perform(get("/api/tickets/by-user").param("email", "andrea@test.com"))
                .andExpect(status().isOk());

        verify(ticketService).findByUserEmail("andrea@test.com");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-007: Consultar tickets PAID por evento retorna 200 OK")
    void getPaidTicketsByEvent_Returns200() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026")).thenReturn(List.of());

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isOk());

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-008: Cancelar ticket valido retorna 200 OK")
    void cancel_Valid_Returns200() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.CANCELLED,
                LocalDateTime.now(),
                "andrea@test.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );
        when(ticketService.cancel("TKT-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-009: Cancelar ticket invalido retorna 409 Conflict")
    void cancel_Invalid_Returns409() throws Exception {
        when(ticketService.cancel("TKT-001")).thenThrow(new BusinessRuleException("Solo se pueden cancelar boletas PAID"));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isConflict());

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-010: Marcar ticket como usado valido retorna 200 OK")
    void markAsUsed_Valid_Returns200() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.USED,
                LocalDateTime.now(),
                "andrea@test.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );
        when(ticketService.markAsUsed("TKT-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-011: Marcar ticket CANCELLED como usado retorna 409 Conflict")
    void markAsUsed_Invalid_Returns409() throws Exception {
        when(ticketService.markAsUsed("TKT-001")).thenThrow(new BusinessRuleException("No se puede marcar como usada una boleta CANCELLED"));

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isConflict());

        verify(ticketService).markAsUsed("TKT-001");
    }
}