package edu.unimag.pulsepass.service;
import edu.unimag.pulsepass.dto.response.VenueResponse;
import java.util.List;

public interface VenueService {
    VenueResponse findByCode(String code);
    List<VenueResponse> findActiveVenues();
}