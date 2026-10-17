package edu.unimag.pulsepass.service;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.Ticket;
import edu.unimag.pulsepass.repository.TicketRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.security.SecurityPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service("authz")
@RequiredArgsConstructor
public class AuthorizationService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public boolean canAccessUser(Long targetUserId, SecurityPrincipal principal) {
        if (principal == null) {
            return false;
        }
        boolean isSelf = principal.getUserId().equals(targetUserId);
        boolean isAdmin = hasRole(principal, Role.ADMIN);

        return isSelf || isAdmin;
    }

    public boolean canAccessUserByEmail(String targetEmail, SecurityPrincipal principal) {
        if (principal == null || targetEmail == null) {
            return false;
        }
        boolean isSelf = principal.getEmail().equalsIgnoreCase(targetEmail);
        boolean isAdmin = hasRole(principal, Role.ADMIN);

        return isSelf || isAdmin;
    }

    public boolean canAccessUserByUsername(String targetUsername, SecurityPrincipal principal) {
        if (principal == null || targetUsername == null) {
            return false;
        }
        if (hasRole(principal, Role.ADMIN)) {
            return true;
        }

        return userRepository.findByUsername(targetUsername)
                .map(user -> user.getId().equals(principal.getUserId()))
                .orElse(false);
    }

    public boolean canAccessTicket(String ticketCode, SecurityPrincipal principal) {
        if (principal == null) {
            return false;
        }

        if (hasRole(principal, Role.ADMIN) || hasRole(principal, Role.STAFF)) {
            return true;
        }

        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AccessDeniedException("You do not have permission to access this resource"));

        return ticket.getUser().getId().equals(principal.getUserId());
    }


    public boolean canCancelTicket(String ticketCode, SecurityPrincipal principal) {
        if (principal == null) {
            return false;
        }
        if (hasRole(principal, Role.ADMIN)) {
            return true;
        }

        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AccessDeniedException("You do not have permission to access this resource"));

        return ticket.getUser().getId().equals(principal.getUserId());
    }

    public boolean canPurchaseTicket(String userEmail, SecurityPrincipal principal) {
        if (principal == null || userEmail == null) {
            return false;
        }

        if (hasRole(principal, Role.ADMIN)) {
            return true;
        }

        return principal.getEmail().equalsIgnoreCase(userEmail);
    }

    private boolean hasRole(SecurityPrincipal principal, Role role) {
        return principal.getAuthorities().stream()
                .anyMatch(granted -> granted.getAuthority().equals(role.getAuthority()));
    }
}