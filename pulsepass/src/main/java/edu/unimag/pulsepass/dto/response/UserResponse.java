package edu.unimag.pulsepass.dto.response;

import java.time.LocalDate;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        boolean active,
        LocalDate birthDate
) {}