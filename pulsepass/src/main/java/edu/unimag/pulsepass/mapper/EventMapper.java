package edu.unimag.pulsepass.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import edu.unimag.pulsepass.domain.Event;
import edu.unimag.pulsepass.dto.response.EventResponse;
import edu.unimag.pulsepass.dto.response.EventSummaryResponse;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR,
        uses = {ArtistMapper.class}
)
public interface EventMapper {

    @Mapping(target = "venueCode", source = "venue.code")
    @Mapping(target = "venueName", source = "venue.name")
    EventResponse toResponse(Event event);

    @Mapping(target = "venueName", source = "venue.name")
    EventSummaryResponse toSummary(Event event);
}