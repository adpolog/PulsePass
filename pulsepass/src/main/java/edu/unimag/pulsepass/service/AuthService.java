package edu.unimag.pulsepass.service;

import edu.unimag.pulsepass.dto.request.LoginRequest;
import edu.unimag.pulsepass.dto.response.AuthResponse;
import edu.unimag.pulsepass.dto.response.AuthenticatedUserResponse;
import edu.unimag.pulsepass.security.SecurityPrincipal;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthenticatedUserResponse getCurrentUser(SecurityPrincipal principal);
}