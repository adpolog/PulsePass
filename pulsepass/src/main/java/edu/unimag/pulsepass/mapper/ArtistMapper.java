package edu.unimag.pulsepass.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import edu.unimag.pulsepass.domain.Artist;
import edu.unimag.pulsepass.dto.response.ArtistResponse;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface ArtistMapper {
    ArtistResponse toResponse(Artist artist);
}