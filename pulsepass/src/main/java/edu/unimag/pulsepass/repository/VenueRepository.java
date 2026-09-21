package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByCode(String code);

}