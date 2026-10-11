package edu.unimag.pulsepass.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.dto.response.UserResponse;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface UserMapper {

    @Mapping(source = "userProfile.firstName", target = "firstName")
    @Mapping(source = "userProfile.lastName", target = "lastName")
    UserResponse toResponse(User user);
}