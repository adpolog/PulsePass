package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getByEmail(@RequestParam String email) {
        UserResponse response = userService.findByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-username")
    public ResponseEntity<UserResponse> getByUsername(@RequestParam String username) {
        UserResponse response = userService.findByUsername(username);
        return ResponseEntity.ok(response);
    }
}