package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.response.VenueResponse;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.security.*;
import edu.unimag.pulsepass.service.VenueService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;


import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VenueController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private VenueService venueService;

    private VenueResponse marina() {
        return new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center",
                "Santa Marta", "Address", 3000, true);
    }


    @Test
    @DisplayName("TEST-CTRL-VEN-001: Anonimo consulta venue existente retorna 200")
    void findByCode_Anonymous_WhenExists_ShouldReturn200() throws Exception {
        when(venueService.findByCode("VEN-SMR-01")).thenReturn(marina());

        mockMvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$.name").value("Marina Convention Center"));
    }

    @Test
    @DisplayName("TEST-CTRL-VEN-002: Venue inexistente retorna 404 con ErrorResponse")
    void findByCode_Anonymous_WhenNotFound_ShouldReturn404() throws Exception {
        when(venueService.findByCode("INVALID"))
                .thenThrow(new ResourceNotFoundException("Venue no encontrado"));

        mockMvc.perform(get("/api/venues/INVALID"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("TEST-CTRL-VEN-003: USER autenticado tambien puede consultar un venue")
    @WithMockUser(roles = "USER")
    void findByCode_AsUser_ShouldReturn200() throws Exception {
        when(venueService.findByCode("VEN-SMR-01")).thenReturn(marina());

        mockMvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"));
    }



    @Test
    @DisplayName("TEST-CTRL-VEN-004: Anonimo consulta venues activos retorna 200 y lista")
    void findActiveVenues_Anonymous_ShouldReturn200AndList() throws Exception {
        when(venueService.findActiveVenues()).thenReturn(List.of(marina()));

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].code").value("VEN-SMR-01"));
    }

    @Test
    @DisplayName("TEST-CTRL-VEN-005: ADMIN tambien puede consultar venues activos")
    @WithMockUser(roles = "ADMIN")
    void findActiveVenues_AsAdmin_ShouldReturn200() throws Exception {
        when(venueService.findActiveVenues()).thenReturn(List.of(marina()));

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}