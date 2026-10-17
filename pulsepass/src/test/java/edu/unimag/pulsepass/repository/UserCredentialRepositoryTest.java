package edu.unimag.pulsepass.repository;
import edu.unimag.pulsepass.AbstractIntegrationTest;
import edu.unimag.pulsepass.domain.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class UserCredentialRepositoryTest extends AbstractIntegrationTest {

    @Autowired private UserRepository userRepository;
    @Autowired private UserCredentialRepository credentialRepository;
    @Autowired private UserRoleRepository roleRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User newUser() {
        User user = new User();
        user.setUsername("andrea");
        user.setEmail("andrea@test.com");
        user.setActive(true);
        UserProfile profile = new UserProfile();
        profile.setFirstName("Andrea");
        profile.setLastName("Perez");
        profile.setBirthDate(LocalDate.of(2000, 1, 1));
        user.setUserProfile(profile);
        profile.setUser(user);
        return userRepository.saveAndFlush(user);
    }

    @Test
    void persistsCredentialAndRoles() {
        User user = newUser();

        credentialRepository.saveAndFlush(UserCredential.builder()
                .user(user)
                .passwordHash("$2a$10$hash")
                .passwordChangedAt(LocalDateTime.now())
                .build());
        roleRepository.saveAndFlush(UserRole.of(user.getId(), Role.USER));

        assertThat(credentialRepository.findById(user.getId())).isPresent();
        assertThat(roleRepository.findRolesByUserId(user.getId())).containsExactly(Role.USER);
    }

    @Test
    void databaseRejectsUnknownRole() {
        User user = newUser();

        assertThatThrownBy(() ->
                jdbcTemplate.update("INSERT INTO user_roles (user_id, role) VALUES (?, 'ROOT')", user.getId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
