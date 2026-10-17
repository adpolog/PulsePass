package edu.unimag.pulsepass.service.impl;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserCredential;
import edu.unimag.pulsepass.domain.UserRole;
import edu.unimag.pulsepass.dto.request.LoginRequest;
import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.AuthResponse;
import edu.unimag.pulsepass.dto.response.AuthenticatedUserResponse;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.repository.UserCredentialRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.repository.UserRoleRepository;
import edu.unimag.pulsepass.security.JwtProperties;
import edu.unimag.pulsepass.security.JwtService;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.service.AuthService;
import edu.unimag.pulsepass.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.identifier(), request.password())
        );

        SecurityPrincipal principal = (SecurityPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, jwtProperties.getAccessTokenTtl().toSeconds());
    }

    @Override
    public AuthenticatedUserResponse getCurrentUser(SecurityPrincipal principal) {
        Set<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new AuthenticatedUserResponse(
                principal.getUserId(),
                principal.getUsername(),
                principal.getEmail(),
                roles
        );
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        UserResponse created = userService.register(request);

        User userRef = userRepository.getReferenceById(created.id());
        credentialRepository.save(UserCredential.builder()
                .user(userRef)
                .passwordHash(passwordEncoder.encode(request.password()))
                .passwordChangedAt(LocalDateTime.now())
                .build());
        roleRepository.save(UserRole.of(created.id(), Role.USER));

        return created;
    }
}