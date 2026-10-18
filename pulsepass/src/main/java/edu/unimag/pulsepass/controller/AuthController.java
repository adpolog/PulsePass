package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.LoginRequest;
import edu.unimag.pulsepass.dto.response.AuthResponse;
import edu.unimag.pulsepass.dto.response.AuthenticatedUserResponse;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> getCurrentUser(
            @AuthenticationPrincipal SecurityPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal));
    }
}