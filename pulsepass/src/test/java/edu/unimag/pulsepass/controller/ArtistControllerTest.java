package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.response.ArtistResponse;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.service.ArtistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ArtistController.class)
@Import(GlobalExceptionHandler.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArtistService artistService;

    @Test
    @DisplayName("TEST-CTRL-ART-001: Buscar artista por ID existente retorna 200 OK")
    void getById_ExistingId_Returns200() throws Exception {
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Pop", true);
        when(artistService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/artists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));

        verify(artistService).findById(1L);
    }

    @Test
    @DisplayName("TEST-CTRL-ART-002: Buscar artista por ID inexistente retorna 404 Not Found")
    void getById_NonExistingId_Returns404() throws Exception {
        when(artistService.findById(99L)).thenThrow(new ResourceNotFoundException("Artista no encontrado"));

        mockMvc.perform(get("/api/artists/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(artistService).findById(99L);
    }

    @Test
    @DisplayName("TEST-CTRL-ART-003: Buscar artista por stageName retorna 200 OK")
    void getByStageName_Returns200() throws Exception {
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Pop", true);
        when(artistService.findByStageName("Solar Beat")).thenReturn(response);

        mockMvc.perform(get("/api/artists/by-stage-name").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));

        verify(artistService).findByStageName("Solar Beat");
    }

    @Test
    @DisplayName("TEST-CTRL-ART-004: Listar artistas activos retorna 200 OK")
    void getActiveArtists_Returns200() throws Exception {
        List<ArtistResponse> artists = List.of(
                new ArtistResponse(1L, "Solar Beat", "Colombia", "Pop", true)
        );
        when(artistService.findActiveArtists()).thenReturn(artists);

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(artistService).findActiveArtists();
    }
}