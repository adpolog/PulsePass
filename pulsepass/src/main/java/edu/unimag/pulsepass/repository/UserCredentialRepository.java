package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {
    Optional<UserCredential> findByUserId(Long userId);
}
