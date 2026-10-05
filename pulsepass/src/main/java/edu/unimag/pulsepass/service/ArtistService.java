package edu.unimag.pulsepass.service;
import edu.unimag.pulsepass.dto.response.ArtistResponse;
import java.util.List;

public interface ArtistService {
    ArtistResponse findById(Long id);
    ArtistResponse findByStageName(String stageName);
    List<ArtistResponse> findActiveArtists();
}