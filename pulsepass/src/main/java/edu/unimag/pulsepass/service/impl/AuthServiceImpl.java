package edu.unimag.pulsepass.service.impl;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserCredential;
import edu.unimag.pulsepass.domain.UserRole;
import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.repository.UserCredentialRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.repository.UserRoleRepository;
import edu.unimag.pulsepass.service.AuthService;
import edu.unimag.pulsepass.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserService userService,
                           UserRepository userRepository,
                           UserCredentialRepository credentialRepository,
                           UserRoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        UserResponse created = userService.register(request); // unicidad y reglas de negocio

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
