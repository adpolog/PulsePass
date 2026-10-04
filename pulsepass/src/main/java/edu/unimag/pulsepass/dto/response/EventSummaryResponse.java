package edu.unimag.pulsepass.dto.response;

import edu.unimag.pulsepass.domain.EventStatus;
import java.time.LocalDateTime;

public record EventSummaryResponse(
        String eventCode,
        String name,
        EventStatus status,
        LocalDateTime eventDate,
        String venueName
) {}