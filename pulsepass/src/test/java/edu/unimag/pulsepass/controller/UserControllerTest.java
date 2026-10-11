package edu.unimag.pulsepass.controller;


import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.exception.DuplicateResourceException;
import edu.unimag.pulsepass.exception.GlobalExceptionHandler;
import edu.unimag.pulsepass.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("TEST-CTRL-USR-001: Registrar usuario valido retorna 201 Created")
    void register_ValidRequest_Returns201() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@test.com", "Andrea", "Perez", "3001234567", "Santa Marta", LocalDate.of(2000, 1, 1)
        );
        UserResponse response = new UserResponse(
                1L, "andrea", "andrea@test.com", "Andrea", "Perez", true
        );

        when(userService.register(any(RegisterUserRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.email").value("andrea@test.com"));

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-002: Email invalido retorna 400 Bad Request y no invoca el servicio")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "invalid-email", "Andrea", "Perez", "3001234567", "Santa Marta", LocalDate.of(2000, 1, 1)
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details.email").exists());

        verify(userService, never()).register(any());
    }

    @Test
    @DisplayName("TEST-CTRL-USR-003: Username o email duplicado retorna 409 Conflict")
    void register_DuplicateUsername_Returns409() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@test.com", "Andrea", "Perez", "3001234567", "Santa Marta", LocalDate.of(2000, 1, 1)
        );

        when(userService.register(any(RegisterUserRequest.class)))
                .thenThrow(new DuplicateResourceException("El usuario ya existe"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-004: Consultar por email retorna 200 OK")
    void getByEmail_Returns200() throws Exception {
        UserResponse response = new UserResponse(
                1L, "andrea", "andrea@test.com", "Andrea", "Perez", true
        );
        when(userService.findByEmail("andrea@test.com")).thenReturn(response);

        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("andrea@test.com"));

        verify(userService).findByEmail("andrea@test.com");
    }

    @Test
    @DisplayName("TEST-CTRL-USR-005: Consultar por username retorna 200 OK")
    void getByUsername_Returns200() throws Exception {
        UserResponse response = new UserResponse(
                1L, "andrea", "andrea@test.com", "Andrea", "Perez", true
        );
        when(userService.findByUsername("andrea")).thenReturn(response);

        mockMvc.perform(get("/api/users/by-username").param("username", "andrea"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("andrea"));

        verify(userService).findByUsername("andrea");
    }
}