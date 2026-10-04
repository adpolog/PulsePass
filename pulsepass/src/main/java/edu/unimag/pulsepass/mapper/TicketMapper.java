package edu.unimag.pulsepass.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import edu.unimag.pulsepass.domain.Ticket;
import edu.unimag.pulsepass.dto.response.TicketResponse;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface TicketMapper {

    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "eventCode", source = "event.eventCode")
    @Mapping(target = "eventName", source = "event.name")
    TicketResponse toResponse(Ticket ticket);
}