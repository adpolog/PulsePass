
package edu.unimag.pulsepass.security;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.Ticket;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.repository.TicketRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import edu.unimag.pulsepass.security.AuthorizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    private SecurityPrincipal mockPrincipal(Long id, String email, Role role) {
        SecurityPrincipal principal = mock(SecurityPrincipal.class);
        lenient().when(principal.getUserId()).thenReturn(id);
        lenient().when(principal.getEmail()).thenReturn(email);

        GrantedAuthority auth = mock(GrantedAuthority.class);
        lenient().when(auth.getAuthority()).thenReturn(role.getAuthority());


        lenient().doReturn(List.of(auth)).when(principal).getAuthorities();

        return principal;
    }

    @Test
    void canAccessUser_WhenSameUser_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);
        assertTrue(authorizationService.canAccessUser(1L, principal));
    }

    @Test
    void canAccessUser_WhenAdmin_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(2L, "admin@email.com", Role.ADMIN);
        assertTrue(authorizationService.canAccessUser(1L, principal));
    }

    @Test
    void canAccessUser_WhenDifferentUser_ShouldReturnFalse() {
        SecurityPrincipal principal = mockPrincipal(3L, "carlos@email.com", Role.USER);
        assertFalse(authorizationService.canAccessUser(1L, principal));
    }

    @Test
    void canAccessUserByEmail_WhenSameUser_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);
        assertTrue(authorizationService.canAccessUserByEmail("andrea@email.com", principal));
    }

    @Test
    void canAccessUserByUsername_WhenAdmin_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(2L, "admin@email.com", Role.ADMIN);
        assertTrue(authorizationService.canAccessUserByUsername("andrea", principal));
    }

    @Test
    void canAccessUserByUsername_WhenSameUser_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);
        User user = new User();
        user.setId(1L);

        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user));

        assertTrue(authorizationService.canAccessUserByUsername("andrea", principal));
    }

    @Test
    void canAccessUserByUsername_WhenDifferentUser_ShouldReturnFalse() {
        SecurityPrincipal principal = mockPrincipal(3L, "carlos@email.com", Role.USER);
        User user = new User();
        user.setId(1L);

        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user));

        assertFalse(authorizationService.canAccessUserByUsername("andrea", principal));
    }

    @Test
    void canAccessTicket_WhenAdmin_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(2L, "admin@email.com", Role.ADMIN);
        assertTrue(authorizationService.canAccessTicket("TCK-123", principal));
    }

    @Test
    void canAccessTicket_WhenStaff_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(4L, "staff@email.com", Role.STAFF);
        assertTrue(authorizationService.canAccessTicket("TCK-123", principal));
    }

    @Test
    void canAccessTicket_WhenOwner_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);

        User owner = new User();
        owner.setId(1L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);

        when(ticketRepository.findByTicketCode("TCK-123")).thenReturn(Optional.of(ticket));

        assertTrue(authorizationService.canAccessTicket("TCK-123", principal));
    }

    @Test
    void canAccessTicket_WhenDifferentUser_ShouldReturnFalse() {
        SecurityPrincipal principal = mockPrincipal(3L, "carlos@email.com", Role.USER);

        User owner = new User();
        owner.setId(1L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);

        when(ticketRepository.findByTicketCode("TCK-123")).thenReturn(Optional.of(ticket));

        assertFalse(authorizationService.canAccessTicket("TCK-123", principal));
    }

    @Test
    void canAccessTicket_WhenTicketNotFound_ShouldThrowException() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);
        when(ticketRepository.findByTicketCode("TCK-123")).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> authorizationService.canAccessTicket("TCK-123", principal));
    }

    @Test
    void canCancelTicket_WhenOwner_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);

        User owner = new User();
        owner.setId(1L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);

        when(ticketRepository.findByTicketCode("TCK-123")).thenReturn(Optional.of(ticket));

        assertTrue(authorizationService.canCancelTicket("TCK-123", principal));
    }

    @Test
    void canCancelTicket_WhenStaff_ShouldReturnFalse() {
        SecurityPrincipal principal = mockPrincipal(4L, "staff@email.com", Role.STAFF);

        User owner = new User();
        owner.setId(1L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);

        when(ticketRepository.findByTicketCode("TCK-123")).thenReturn(Optional.of(ticket));

        // El staff puede acceder a un ticket para leerlo/usarlo, pero no necesariamente cancelarlo
        assertFalse(authorizationService.canCancelTicket("TCK-123", principal));
    }

    @Test
    void canPurchaseTicket_WhenSameUser_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(1L, "andrea@email.com", Role.USER);
        assertTrue(authorizationService.canPurchaseTicket("andrea@email.com", principal));
    }

    @Test
    void canPurchaseTicket_WhenAdmin_ShouldReturnTrue() {
        SecurityPrincipal principal = mockPrincipal(2L, "admin@email.com", Role.ADMIN);
        assertTrue(authorizationService.canPurchaseTicket("andrea@email.com", principal));
    }

    @Test
    void canPurchaseTicket_WhenDifferentUser_ShouldReturnFalse() {
        SecurityPrincipal principal = mockPrincipal(3L, "carlos@email.com", Role.USER);
        assertFalse(authorizationService.canPurchaseTicket("andrea@email.com", principal));
    }
}