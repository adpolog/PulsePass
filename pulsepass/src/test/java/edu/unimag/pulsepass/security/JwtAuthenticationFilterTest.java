package edu.unimag.pulsepass.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {

        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WhenNoAuthHeader_ShouldContinueChainWithoutAuthentication() throws ServletException, IOException {
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);


        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verify(filterChain).doFilter(request, response);

        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void doFilterInternal_WhenTokenIsInvalid_ShouldContinueChainWithoutAuthentication() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer token-invalido");
        when(jwtService.validateToken("token-invalido")).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(jwtService, never()).getUserIdFromToken(anyString());
    }

    @Test
    void doFilterInternal_WhenTokenIsValid_ShouldSetAuthenticationInContext() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer token-valido");
        when(jwtService.validateToken("token-valido")).thenReturn(true);
        when(jwtService.getUserIdFromToken("token-valido")).thenReturn("10");

        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        when(principal.isEnabled()).thenReturn(true);


        when(userDetailsService.loadUserByUsername("10")).thenReturn(principal);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);


        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(principal, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WhenUserDetailsServiceThrowsException_ShouldClearContext() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer token-valido");
        when(jwtService.validateToken("token-valido")).thenReturn(true);
        when(jwtService.getUserIdFromToken("token-valido")).thenReturn("10");


        when(userDetailsService.loadUserByUsername("10")).thenThrow(new UsernameNotFoundException("User not found"));

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);


        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}