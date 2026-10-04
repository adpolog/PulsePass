package edu.unimag.pulsepass.dto.request;

import edu.unimag.pulsepass.domain.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {}