package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.service.AuthService;
import edu.unimag.pulsepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }


    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/by-email")
    @PreAuthorize("@authz.canAccessUserByEmail(#email, authentication.principal)")
    public ResponseEntity<UserResponse> getByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping("/by-username")
    @PreAuthorize("@authz.canAccessUserByUsername(#username, authentication.principal)")
    public ResponseEntity<UserResponse> getByUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }
}