package edu.unimag.pulsepass.dto.response;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        boolean active
) {}