package edu.unimag.pulsepass.security;

import edu.unimag.pulsepass.domain.Role;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserCredential;
import edu.unimag.pulsepass.repository.UserCredentialRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.repository.UserRoleRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    UserCredentialRepository credentialRepository,
                                    UserRoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SecurityPrincipal loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        UserCredential credential = credentialRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario sin credenciales"));

        return toPrincipal(user, credential.getPasswordHash());
    }

    @Transactional(readOnly = true)
    public SecurityPrincipal loadPrincipalById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return toPrincipal(user, null);
    }

    private SecurityPrincipal toPrincipal(User user, String passwordHash) {
        List<Role> roles = roleRepository.findRolesByUserId(user.getId());
        return new SecurityPrincipal(
                user.getId(), user.getUsername(), user.getEmail(), passwordHash,
                roles, Boolean.TRUE.equals(user.getActive()));
    }
}
