package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.LoginRequest;
import edu.unimag.pulsepass.dto.response.AuthResponse;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.security.CustomUserDetailsService;
import edu.unimag.pulsepass.security.JwtService;
import edu.unimag.pulsepass.security.RestAccessDeniedHandler;
import edu.unimag.pulsepass.security.RestAuthenticationEntryPoint;
import edu.unimag.pulsepass.security.SecurityConfig;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthService authService;



    private RequestPostProcessor asRole(String role) {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, AuthorityUtils.createAuthorityList("ROLE_" + role)));
    }

    private LoginRequest validLogin() {
        return new LoginRequest("andrea", "UnaFraseSeguraLarga2026!");
    }



    @Test
    @DisplayName("TEST-CTRL-AUTH-001 (T-SEC-005): Anonimo con credenciales correctas recibe 200 y Bearer")
    void login_Valid_Returns200WithBearer() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new AuthResponse("jwt-de-prueba", "Bearer", 900));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-de-prueba"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-AUTH-002 (T-SEC-006): Contraseña incorrecta retorna 401 generico")
    void login_BadCredentials_Returns401() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    @DisplayName("TEST-CTRL-AUTH-003: Usuario inactivo no obtiene token (401)")
    void login_DisabledUser_Returns401() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new DisabledException("User is disabled"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    @DisplayName("TEST-CTRL-AUTH-004: Credenciales en blanco retornan 400 y no llaman al servicio")
    void login_BlankFields_Returns400() throws Exception {
        LoginRequest request = new LoginRequest("", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details").isNotEmpty());

        verifyNoInteractions(authService);
    }

    @Test
    @DisplayName("TEST-CTRL-AUTH-005: JSON malformado retorna 400 sin stacktrace")
    void login_MalformedJson_Returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ esto no es json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.trace").doesNotExist());

        verifyNoInteractions(authService);
    }



    @Test
    @DisplayName("TEST-CTRL-AUTH-006: Usuario autenticado consulta /me y retorna 200")
    void me_Authenticated_Returns200() throws Exception {
        mockMvc.perform(get("/api/auth/me").with(asRole("USER")))
                .andExpect(status().isOk());

        verify(authService).getCurrentUser(any());
    }

    @Test
    @DisplayName("TEST-CTRL-AUTH-007: Anonimo consulta /me retorna 401 y no llama al servicio")
    void me_Anonymous_Returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(authService);
    }
}