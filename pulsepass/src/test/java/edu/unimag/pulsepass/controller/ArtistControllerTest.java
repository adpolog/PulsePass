package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.response.ArtistResponse;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.security.*;
import edu.unimag.pulsepass.service.ArtistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ArtistController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private ArtistService artistService;

    private ArtistResponse solarBeat() {
        return new ArtistResponse(1L, "Solar Beat", "Colombia", "Pop", true);
    }



    @Test
    @DisplayName("TEST-CTRL-ART-001: Anonimo consulta artista por ID existente retorna 200")
    void getById_Anonymous_ExistingId_Returns200() throws Exception {
        when(artistService.findById(1L)).thenReturn(solarBeat());

        mockMvc.perform(get("/api/artists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));

        verify(artistService).findById(1L);
    }

    @Test
    @DisplayName("TEST-CTRL-ART-002: Artista inexistente retorna 404 con ErrorResponse")
    void getById_NonExistingId_Returns404() throws Exception {
        when(artistService.findById(99L)).thenThrow(new ResourceNotFoundException("Artista no encontrado"));

        mockMvc.perform(get("/api/artists/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(artistService).findById(99L);
    }

    @Test
    @DisplayName("TEST-CTRL-ART-003: USER autenticado tambien puede consultar un artista")
    @WithMockUser(roles = "USER")
    void getById_AsUser_Returns200() throws Exception {
        when(artistService.findById(1L)).thenReturn(solarBeat());

        mockMvc.perform(get("/api/artists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));
    }



    @Test
    @DisplayName("TEST-CTRL-ART-004: Anonimo busca artista por stageName retorna 200 (lista)")
    void getByStageName_Anonymous_Returns200() throws Exception {
        when(artistService.findByStageName("Solar Beat")).thenReturn(solarBeat());

        mockMvc.perform(get("/api/artists/by-stage-name").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stageName").value("Solar Beat"));

        verify(artistService).findByStageName("Solar Beat");
    }



    @Test
    @DisplayName("TEST-CTRL-ART-005: Anonimo lista artistas activos retorna 200")
    void getActiveArtists_Anonymous_Returns200() throws Exception {
        when(artistService.findActiveArtists()).thenReturn(List.of(solarBeat()));

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(artistService).findActiveArtists();
    }

    @Test
    @DisplayName("TEST-CTRL-ART-006: ADMIN tambien puede listar artistas activos")
    @WithMockUser(roles = "ADMIN")
    void getActiveArtists_AsAdmin_Returns200() throws Exception {
        when(artistService.findActiveArtists()).thenReturn(List.of(solarBeat()));

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }



    @Test
    @DisplayName("TEST-CTRL-ART-007: Un POST anonimo sobre /api/artists no es publico (401)")
    void postArtists_Anonymous_Returns401() throws Exception {
        mockMvc.perform(post("/api/artists"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(artistService);
    }
}