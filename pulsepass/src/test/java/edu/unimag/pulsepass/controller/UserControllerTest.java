package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.exception.DuplicateResourceException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.security.JwtService;
import edu.unimag.pulsepass.security.RestAccessDeniedHandler;
import edu.unimag.pulsepass.security.RestAuthenticationEntryPoint;
import edu.unimag.pulsepass.security.SecurityConfig;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.service.AuthService;
import edu.unimag.pulsepass.service.AuthorizationService;
import edu.unimag.pulsepass.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean(name = "authz")
    private AuthorizationService authz;



    private RequestPostProcessor asRole(String role) {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, AuthorityUtils.createAuthorityList("ROLE_" + role)));
    }

    private RegisterUserRequest validRequest() {
        return new RegisterUserRequest(
                "andrea", "andrea@test.com", "Andrea", "Perez", "3001234567",
                "Santa Marta", LocalDate.of(2000, 1, 1), "Password1234!"
        );
    }

    private UserResponse andreaResponse() {
        return new UserResponse(1L, "andrea", "andrea@test.com", "Andrea", "Perez", true);
    }


    @Test
    @DisplayName("TEST-CTRL-USR-001: Registro valido y anonimo retorna 201 y no expone secretos")
    void register_ValidRequest_Returns201() throws Exception {
        when(authService.register(any(RegisterUserRequest.class))).thenReturn(andreaResponse());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.email").value("andrea@test.com"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        verify(authService).register(any(RegisterUserRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-002: Email invalido retorna 400 y no invoca el servicio")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "invalid-email", "Andrea", "Perez", "3001234567",
                "Santa Marta", LocalDate.of(2000, 1, 1), "Password1234!"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details.email").exists());

        verify(authService, never()).register(any());
    }

    @Test
    @DisplayName("TEST-CTRL-USR-003: Username o email duplicado retorna 409 Conflict")
    void register_Duplicate_Returns409() throws Exception {
        when(authService.register(any(RegisterUserRequest.class)))
                .thenThrow(new DuplicateResourceException("User already exists"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-004: Password corta retorna 400 y no invoca el servicio")
    void register_ShortPassword_Returns400() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@test.com", "Andrea", "Perez", "3001234567",
                "Santa Marta", LocalDate.of(2000, 1, 1), "corta"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.password").exists());

        verify(authService, never()).register(any());
    }



    @Test
    @DisplayName("TEST-CTRL-USR-005: Dueño consulta su email retorna 200")
    void getByEmail_Owner_Returns200() throws Exception {
        when(authz.canAccessUserByEmail(eq("andrea@test.com"), any())).thenReturn(true);
        when(userService.findByEmail("andrea@test.com")).thenReturn(andreaResponse());

        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@test.com")
                        .with(asRole("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("andrea@test.com"));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-006: Usuario consulta el email de otro retorna 403 y no invoca el servicio")
    void getByEmail_OtherUser_Returns403() throws Exception {
        when(authz.canAccessUserByEmail(eq("carlos@test.com"), any())).thenReturn(false);

        mockMvc.perform(get("/api/users/by-email").param("email", "carlos@test.com")
                        .with(asRole("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(userService);
    }

    @Test
    @DisplayName("TEST-CTRL-USR-007: Anonimo consulta por email retorna 401 y no invoca el servicio")
    void getByEmail_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@test.com"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(userService);
    }


    @Test
    @DisplayName("TEST-CTRL-USR-008: Dueño consulta su username retorna 200")
    void getByUsername_Owner_Returns200() throws Exception {
        when(authz.canAccessUserByUsername(eq("andrea"), any())).thenReturn(true);
        when(userService.findByUsername("andrea")).thenReturn(andreaResponse());

        mockMvc.perform(get("/api/users/by-username").param("username", "andrea")
                        .with(asRole("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("andrea"));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-009: Usuario consulta el username de otro retorna 403 y no invoca el servicio")
    void getByUsername_OtherUser_Returns403() throws Exception {
        when(authz.canAccessUserByUsername(eq("carlos"), any())).thenReturn(false);

        mockMvc.perform(get("/api/users/by-username").param("username", "carlos")
                        .with(asRole("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(userService);
    }

    @Test
    @DisplayName("TEST-CTRL-USR-010: Anonimo consulta por username retorna 401 y no invoca el servicio")
    void getByUsername_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/by-username").param("username", "andrea"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(userService);
    }
}