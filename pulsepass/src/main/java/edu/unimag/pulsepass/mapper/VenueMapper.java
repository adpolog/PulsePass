package edu.unimag.pulsepass.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import edu.unimag.pulsepass.domain.Venue;
import edu.unimag.pulsepass.dto.response.VenueResponse;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface VenueMapper {
    VenueResponse toResponse(Venue venue);
}