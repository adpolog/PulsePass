package edu.unimag.pulsepass.service.impl;

import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.dto.request.RegisterUserRequest;
import edu.unimag.pulsepass.dto.response.UserResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.DuplicateResourceException;
import edu.unimag.pulsepass.mapper.UserMapper;
import edu.unimag.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void register_WhenValid_ShouldSaveUserAndReturnResponse() {
        RegisterUserRequest request = new RegisterUserRequest("andrea", "andrea@email.com",
                "Andrea", "Perez", "12345", "Santa Marta", LocalDate.of(2000, 1, 1));

        User user = new User();
        UserResponse response = new UserResponse(1L, "andrea", "andrea@email.com", "Andrea", "Perez", true);

        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(response);

        UserResponse result = userService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo("andrea");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WhenUsernameExists_ShouldThrowDuplicateResourceException() {
        RegisterUserRequest request = new RegisterUserRequest("andrea", "andrea@email.com",
                "Andrea", "Perez", "12345", "Santa Marta", LocalDate.of(2000, 1, 1));

        when(userRepository.existsByUsername("andrea")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_WhenEmailExists_ShouldThrowDuplicateResourceException() {
        RegisterUserRequest request = new RegisterUserRequest("andrea", "andrea@email.com",
                "Andrea", "Perez", "12345", "Santa Marta", LocalDate.of(2000, 1, 1));

        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_WhenBirthDateInFuture_ShouldThrowBusinessRuleException() {
        RegisterUserRequest request = new RegisterUserRequest("andrea", "andrea@email.com",
                "Andrea", "Perez", "12345", "Santa Marta", LocalDate.now().plusDays(1));

        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(userRepository, never()).save(any());
    }
}