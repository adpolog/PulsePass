package edu.unimag.pulsepass.security;

import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserCredential;
import edu.unimag.pulsepass.repository.UserCredentialRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_WhenUsernameExists_ShouldReturnUserDetails() {
        User user = new User();
        user.setId(1L);
        user.setUsername("andrea");
        UserCredential credential = new UserCredential();

        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(1L)).thenReturn(Optional.of(credential));

        UserDetails result = userDetailsService.loadUserByUsername("andrea");

        assertNotNull(result);
        assertEquals("andrea", result.getUsername());
        assertEquals("hashed-pass", result.getPassword());
    }

    @Test
    void loadUserById_WhenIdExists_ShouldReturnUserDetails() {
        User user = new User();
        user.setId(1L);
        user.setUsername("andrea");
        UserCredential credential = new UserCredential();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(1L)).thenReturn(Optional.of(credential));

        UserDetails result = userDetailsService.loadUserByUsername(String.valueOf(1L));

        assertNotNull(result);
        assertEquals("andrea", result.getUsername());
    }

    @Test
    void loadUserByUsername_WhenUserDoesNotExist_ShouldThrowException() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("unknown")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername("unknown"));
    }
}