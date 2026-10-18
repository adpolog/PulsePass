package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.domain.TicketStatus;
import edu.unimag.pulsepass.domain.TicketType;
import edu.unimag.pulsepass.dto.request.PurchaseTicketRequest;
import edu.unimag.pulsepass.dto.response.TicketResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.security.CustomUserDetailsService;
import edu.unimag.pulsepass.security.JwtService;
import edu.unimag.pulsepass.security.RestAccessDeniedHandler;
import edu.unimag.pulsepass.security.RestAuthenticationEntryPoint;
import edu.unimag.pulsepass.security.SecurityConfig;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.security.AuthorizationService;
import edu.unimag.pulsepass.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean(name = "authz")
    private AuthorizationService authz;



    /** Autenticación con un SecurityPrincipal (lo que espera @authz) y el rol indicado. */
    private RequestPostProcessor asRole(String role) {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, AuthorityUtils.createAuthorityList("ROLE_" + role)));
    }

    private TicketResponse ticket(TicketStatus status) {
        return new TicketResponse(1L, "TKT-001", TicketType.VIP, new BigDecimal("150.00"),
                status, LocalDateTime.now(), "andrea@test.com", "CMF-2026",
                "Caribbean Music Fest 2026");
    }

    private PurchaseTicketRequest purchaseRequest(String email) {
        return new PurchaseTicketRequest(email, "CMF-2026", TicketType.VIP);
    }



    @Test
    @DisplayName("TEST-CTRL-TKT-001: USER compra con su propio email retorna 201")
    void purchase_Owner_Returns201() throws Exception {
        when(authz.canPurchaseTicket(eq("andrea@test.com"), any())).thenReturn(true);
        when(ticketService.purchase(any(PurchaseTicketRequest.class))).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(post("/api/tickets")
                        .with(asRole("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchaseRequest("andrea@test.com"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.eventName").value("Caribbean Music Fest 2026"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-002 (T-SEC-010): USER compra con email ajeno retorna 403 y no crea ticket")
    void purchase_OtherEmail_Returns403() throws Exception {
        when(authz.canPurchaseTicket(eq("carlos@test.com"), any())).thenReturn(false);

        mockMvc.perform(post("/api/tickets")
                        .with(asRole("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchaseRequest("carlos@test.com"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-003: Anonimo compra retorna 401 y no llama al servicio")
    void purchase_Anonymous_Returns401() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchaseRequest("andrea@test.com"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-004 (T-SEC-018): Request invalido retorna 400 y no llama al servicio")
    void purchase_Invalid_Returns400() throws Exception {
        PurchaseTicketRequest request = new PurchaseTicketRequest("invalid-email", "", null);

        mockMvc.perform(post("/api/tickets")
                        .with(asRole("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.userEmail").exists());

        verify(ticketService, never()).purchase(any());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-005: Evento inexistente en compra autorizada retorna 404")
    void purchase_NotFound_Returns404() throws Exception {
        when(authz.canPurchaseTicket(eq("andrea@test.com"), any())).thenReturn(true);
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException("Evento no encontrado"));

        mockMvc.perform(post("/api/tickets")
                        .with(asRole("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchaseRequest("andrea@test.com"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-006: Regla de negocio incumplida en compra retorna 409")
    void purchase_BusinessRuleViolation_Returns409() throws Exception {
        when(authz.canPurchaseTicket(eq("andrea@test.com"), any())).thenReturn(true);
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException("El usuario no cumple con la edad minima"));

        mockMvc.perform(post("/api/tickets")
                        .with(asRole("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchaseRequest("andrea@test.com"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El usuario no cumple con la edad minima"));
    }



    @Test
    @DisplayName("TEST-CTRL-TKT-007: Dueño consulta su ticket retorna 200")
    void getByCode_Owner_Returns200() throws Exception {
        when(authz.canAccessTicket(eq("TKT-001"), any())).thenReturn(true);
        when(ticketService.findByCode("TKT-001")).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/TKT-001").with(asRole("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.eventName").value("Caribbean Music Fest 2026"));

        verify(ticketService).findByCode("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-008 (T-SEC-009): USER consulta ticket ajeno retorna 403 y no obtiene datos")
    void getByCode_OtherUser_Returns403() throws Exception {
        when(authz.canAccessTicket(eq("TKT-999"), any())).thenReturn(false);

        mockMvc.perform(get("/api/tickets/TKT-999").with(asRole("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.ticketCode").doesNotExist());

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-009: Anonimo consulta ticket retorna 401")
    void getByCode_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/tickets/TKT-001"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketService);
    }



    @Test
    @DisplayName("TEST-CTRL-TKT-010: Dueño consulta sus tickets por email retorna 200")
    void getByUserEmail_Owner_Returns200() throws Exception {
        when(authz.canAccessUserByEmail(eq("andrea@test.com"), any())).thenReturn(true);
        when(ticketService.findByUserEmail("andrea@test.com")).thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/tickets/by-user").param("email", "andrea@test.com")
                        .with(asRole("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(ticketService).findByUserEmail("andrea@test.com");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-011: USER consulta tickets de otro email retorna 403")
    void getByUserEmail_OtherUser_Returns403() throws Exception {
        when(authz.canAccessUserByEmail(eq("carlos@test.com"), any())).thenReturn(false);

        mockMvc.perform(get("/api/tickets/by-user").param("email", "carlos@test.com")
                        .with(asRole("USER")))
                .andExpect(status().isForbidden());

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-012: Anonimo consulta tickets por email retorna 401")
    void getByUserEmail_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/tickets/by-user").param("email", "andrea@test.com"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketService);
    }



    @Test
    @DisplayName("TEST-CTRL-TKT-013 (T-SEC-011): Dueño cancela su ticket retorna 200")
    void cancel_Owner_Returns200() throws Exception {
        when(authz.canCancelTicket(eq("TKT-001"), any())).thenReturn(true);
        when(ticketService.cancel("TKT-001")).thenReturn(ticket(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel").with(asRole("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-014: Dueño cancela ticket no cancelable retorna 409")
    void cancel_Owner_Invalid_Returns409() throws Exception {
        when(authz.canCancelTicket(eq("TKT-001"), any())).thenReturn(true);
        when(ticketService.cancel("TKT-001"))
                .thenThrow(new BusinessRuleException("Solo se pueden cancelar boletas PAID"));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel").with(asRole("USER")))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-015: USER cancela ticket ajeno retorna 403 y no se muta el estado")
    void cancel_OtherUser_Returns403() throws Exception {
        when(authz.canCancelTicket(eq("TKT-999"), any())).thenReturn(false);

        mockMvc.perform(patch("/api/tickets/TKT-999/cancel").with(asRole("USER")))
                .andExpect(status().isForbidden());

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-016: Anonimo cancela ticket retorna 401")
    void cancel_Anonymous_Returns401() throws Exception {
        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketService);
    }



    @Test
    @DisplayName("TEST-CTRL-TKT-017 (T-SEC-013): STAFF marca ticket valido como usado retorna 200")
    void markAsUsed_Staff_Returns200() throws Exception {
        when(ticketService.markAsUsed("TKT-001")).thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-001/use").with(asRole("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-018: ADMIN marca ticket como usado retorna 200")
    void markAsUsed_Admin_Returns200() throws Exception {
        when(ticketService.markAsUsed("TKT-001")).thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-001/use").with(asRole("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-019 (T-SEC-012): USER intenta usar ticket retorna 403 y no llama al servicio")
    void markAsUsed_User_Returns403() throws Exception {
        mockMvc.perform(patch("/api/tickets/TKT-001/use").with(asRole("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-020: Anonimo intenta usar ticket retorna 401")
    void markAsUsed_Anonymous_Returns401() throws Exception {
        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketService);
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-021: STAFF usa ticket CANCELLED retorna 409 (regla del Service)")
    void markAsUsed_Staff_Invalid_Returns409() throws Exception {
        when(ticketService.markAsUsed("TKT-001"))
                .thenThrow(new BusinessRuleException("No se puede marcar como usada una boleta CANCELLED"));

        mockMvc.perform(patch("/api/tickets/TKT-001/use").with(asRole("STAFF")))
                .andExpect(status().isConflict());
    }
}