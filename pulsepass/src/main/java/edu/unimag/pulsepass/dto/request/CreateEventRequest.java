package edu.unimag.pulsepass.dto.request;

import edu.unimag.pulsepass.domain.EventCategory;
import java.time.LocalDateTime;

public record CreateEventRequest(
        String eventCode,
        String name,
        String description,
        EventCategory category,
        LocalDateTime eventDate,
        Integer minimumAge,
        String venueCode
) {}