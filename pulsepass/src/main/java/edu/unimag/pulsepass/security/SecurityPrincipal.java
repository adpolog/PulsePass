package edu.unimag.pulsepass.security;

import edu.unimag.pulsepass.domain.Role;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class SecurityPrincipal implements UserDetails, CredentialsContainer {

    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String username;
    private final String email;
    private String passwordHash;
    private final Set<Role> roles;
    private final boolean enabled;

    public SecurityPrincipal(Long userId, String username, String email, String passwordHash,
                             Collection<Role> roles, boolean enabled) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles.isEmpty() ? EnumSet.noneOf(Role.class) : EnumSet.copyOf(roles);
        this.enabled = enabled;
    }

    public Long getUserId() { return userId; }

    public String getEmail() { return email; }

    public Set<Role> getRoles() { return Collections.unmodifiableSet(roles); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .collect(Collectors.toList());
    }

    @Override public String getPassword() { return passwordHash; }

    @Override public String getUsername() { return username; }

    @Override public boolean isEnabled() { return enabled; }

    @Override public boolean isAccountNonExpired() { return true; }

    @Override public boolean isAccountNonLocked() { return true; }

    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public void eraseCredentials() { this.passwordHash = null; }

    @Override
    public boolean equals(Object o) {
        return o instanceof SecurityPrincipal other && Objects.equals(userId, other.userId);
    }

    @Override
    public int hashCode() { return Objects.hashCode(userId); }

    @Override
    public String toString() {
        return "SecurityPrincipal[userId=" + userId + ", username=" + username + ", roles=" + roles + "]";
    }
}
