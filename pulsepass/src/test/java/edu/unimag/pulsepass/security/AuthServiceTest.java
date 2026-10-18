package edu.unimag.pulsepass.security;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserCredential;
import edu.unimag.pulsepass.domain.UserRole;
import edu.unimag.pulsepass.dto.request.LoginRequest;
import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.AuthResponse;
import edu.unimag.pulsepass.dto.response.AuthenticatedUserResponse;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.exception.DuplicateResourceException;
import edu.unimag.pulsepass.repository.UserCredentialRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.repository.UserRoleRepository;
import edu.unimag.pulsepass.service.AuthService;
import edu.unimag.pulsepass.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private JwtProperties jwtProperties;
    @Mock private UserService userService;
    @Mock private UserRepository userRepository;
    @Mock private UserCredentialRepository credentialRepository;
    @Mock private UserRoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private static final String PASSWORD = "Password123!";

    private RegisterUserRequest registerRequest() {
        return new RegisterUserRequest("andrea", "andrea@test.com", "Andrea", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 1, 1), PASSWORD);
    }



    @Test
    @DisplayName("AUTH-SVC-001: Credenciales correctas emiten JWT con la duracion configurada")
    void login_ValidCredentials_ReturnsToken() {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        Authentication authenticated = new UsernamePasswordAuthenticationToken(principal, null, List.of());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authenticated);
        when(jwtService.generateToken(principal)).thenReturn("jwt-de-prueba");
        when(jwtProperties.getAccessTokenTtl()).thenReturn(Duration.ofMinutes(15));

        AuthResponse response = authService.login(new LoginRequest("andrea", PASSWORD));

        assertThat(response.accessToken()).isEqualTo("jwt-de-prueba");
        assertThat(response.expiresIn()).isEqualTo(900);


        ArgumentCaptor<Authentication> captor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertThat(captor.getValue().getPrincipal()).isEqualTo("andrea");
        assertThat(captor.getValue().getCredentials()).isEqualTo(PASSWORD);
    }

    @Test
    @DisplayName("AUTH-SVC-002: Contraseña incorrecta propaga BadCredentials y NO emite token")
    void login_BadCredentials_DoesNotIssueToken() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", "incorrecta")))
                .isInstanceOf(BadCredentialsException.class);

        verifyNoInteractions(jwtService);
    }

    @Test
    @DisplayName("AUTH-SVC-003: Usuario inactivo no obtiene token")
    void login_DisabledUser_DoesNotIssueToken() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new DisabledException("User is disabled"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", PASSWORD)))
                .isInstanceOf(DisabledException.class);

        verifyNoInteractions(jwtService);
    }



    @Test
    @DisplayName("AUTH-SVC-004: /me devuelve solo datos minimos del principal")
    void getCurrentUser_ReturnsPrincipalData() {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        when(principal.getUserId()).thenReturn(7L);
        when(principal.getUsername()).thenReturn("andrea");
        when(principal.getEmail()).thenReturn("andrea@test.com");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_STAFF")))
                .when(principal).getAuthorities();

        AuthenticatedUserResponse response = authService.getCurrentUser(principal);

        assertThat(response).isEqualTo(new AuthenticatedUserResponse(
                7L, "andrea", "andrea@test.com", Set.of("ROLE_USER", "ROLE_STAFF")));
    }



    @Test
    @DisplayName("AUTH-SVC-005: Registro guarda hash BCrypt (nunca el texto plano) y rol USER")
    void register_Valid_SavesHashedCredentialAndUserRole() {
        RegisterUserRequest request = registerRequest();
        UserResponse created = new UserResponse(1L, "andrea", "andrea@test.com", "Andrea", "Perez", true);
        User userRef = new User();
        userRef.setId(1L);

        when(userService.register(request)).thenReturn(created);
        when(userRepository.getReferenceById(1L)).thenReturn(userRef);
        when(passwordEncoder.encode(PASSWORD)).thenReturn("$2a$10$hash-ficticio");

        UserResponse result = authService.register(request);

        assertThat(result).isEqualTo(created);

        ArgumentCaptor<UserCredential> credentialCaptor = ArgumentCaptor.forClass(UserCredential.class);
        verify(credentialRepository).save(credentialCaptor.capture());
        UserCredential saved = credentialCaptor.getValue();
        assertThat(saved.getPasswordHash()).isEqualTo("$2a$10$hash-ficticio").isNotEqualTo(PASSWORD);
        assertThat(saved.getUser()).isSameAs(userRef);


        ArgumentCaptor<UserRole> roleCaptor = ArgumentCaptor.forClass(UserRole.class);
        verify(roleRepository).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue()).usingRecursiveComparison().isEqualTo(UserRole.of(1L, Role.USER));
    }

    @Test
    @DisplayName("AUTH-SVC-006: Username o email duplicado no guarda credencial ni rol")
    void register_Duplicate_SavesNothing() {
        RegisterUserRequest request = registerRequest();
        when(userService.register(request))
                .thenThrow(new DuplicateResourceException("Username is already in use."));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);

        verifyNoInteractions(passwordEncoder, credentialRepository, roleRepository, userRepository);
    }
}