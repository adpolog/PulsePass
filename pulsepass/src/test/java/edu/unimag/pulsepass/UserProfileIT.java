package edu.unimag.pulsepass;
import edu.unimag.pulsepass.domain.User;
import edu.unimag.pulsepass.domain.UserProfile;
import edu.unimag.pulsepass.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class UserProfileIT extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldEnforceOneToOneRelationship() {
        User user = User.builder().username("andry").email("andry@unimag.edu.co").active(true).build();
        userRepository.saveAndFlush(user);

        UserProfile profile = UserProfile.builder().firstName("Andry").lastName("Polo").user(user).build();
        user.setUserProfile(profile);

        Assertions.assertDoesNotThrow(() -> userRepository.saveAndFlush(user));
    }
}