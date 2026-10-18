package edu.unimag.pulsepass.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private JwtProperties jwtProperties;

    private JwtService jwtService;

    private final String validSecretBase64 = "cHVsc2VwYXNzLXN1cGVyLXNlY3VyZS1rZXktbWluaW11bS0zMmJ5dGVzLXZhbGlk";


    private final String shortSecretBase64 = "c2hvcnQta2V5";

    @BeforeEach
    void setUp() {

        lenient().when(jwtProperties.getSecretBase64()).thenReturn(validSecretBase64);
        lenient().when(jwtProperties.getIssuer()).thenReturn("pulsepass-api");
        lenient().when(jwtProperties.getAccessTokenTtl()).thenReturn(Duration.ofMinutes(15));

        jwtService = new JwtService(jwtProperties);
        jwtService.init();
    }

    @Test
    void init_WhenSecretIsNull_ShouldThrowIllegalStateException() {
        when(jwtProperties.getSecretBase64()).thenReturn(null);
        JwtService invalidService = new JwtService(jwtProperties);

        assertThrows(IllegalStateException.class, invalidService::init);
    }

    @Test
    void init_WhenSecretIsBlank_ShouldThrowIllegalStateException() {
        when(jwtProperties.getSecretBase64()).thenReturn("   ");
        JwtService invalidService = new JwtService(jwtProperties);

        assertThrows(IllegalStateException.class, invalidService::init);
    }

    @Test
    void init_WhenSecretIsTooShort_ShouldThrowIllegalArgumentException() {
        when(jwtProperties.getSecretBase64()).thenReturn(shortSecretBase64);
        JwtService invalidService = new JwtService(jwtProperties);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, invalidService::init);
        assertTrue(exception.getMessage().contains("must be at least 256 bits"));
    }

    @Test
    void generateToken_ShouldReturnValidTokenString() {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        when(principal.getUserId()).thenReturn(10L);
        when(principal.getUsername()).thenReturn("andrea");

        String token = jwtService.generateToken(principal);

        assertNotNull(token);
        assertFalse(token.isBlank());

        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void getUserIdFromToken_WhenTokenIsValid_ShouldReturnCorrectId() {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        when(principal.getUserId()).thenReturn(10L);
        when(principal.getUsername()).thenReturn("andrea");

        String token = jwtService.generateToken(principal);
        String userIdStr = jwtService.getUserIdFromToken(token);

        assertEquals("10", userIdStr);
    }

    @Test
    void validateToken_WhenTokenIsRandomString_ShouldReturnFalse() {
        assertFalse(jwtService.validateToken("esto.no.es-un-token-valido"));
    }

    @Test
    void validateToken_WhenTokenIsManipulated_ShouldReturnFalse() {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        when(principal.getUserId()).thenReturn(10L);
        when(principal.getUsername()).thenReturn("andrea");

        String token = jwtService.generateToken(principal);


        String manipulatedToken = token.substring(0, token.length() - 2) + "xx";

        assertFalse(jwtService.validateToken(manipulatedToken));
    }
}