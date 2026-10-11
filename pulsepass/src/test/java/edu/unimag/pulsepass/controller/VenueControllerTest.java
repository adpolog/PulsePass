package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.response.VenueResponse;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VenueController.class)
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VenueService venueService;

    @Test
    void findByCode_WhenExists_ShouldReturn200() throws Exception {
        VenueResponse response = new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Address", 3000, true);

        when(venueService.findByCode("VEN-SMR-01")).thenReturn(response);

        mockMvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$.name").value("Marina Convention Center"));
    }

    @Test
    void findByCode_WhenNotFound_ShouldReturn404() throws Exception {
        when(venueService.findByCode("INVALID")).thenThrow(new ResourceNotFoundException("Venue no encontrado"));

        mockMvc.perform(get("/api/venues/INVALID"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void findActiveVenues_ShouldReturn200AndList() throws Exception {
        List<VenueResponse> activeVenues = List.of(
                new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Address", 3000, true)
        );

        when(venueService.findActiveVenues()).thenReturn(activeVenues);

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].code").value("VEN-SMR-01"));
    }
}