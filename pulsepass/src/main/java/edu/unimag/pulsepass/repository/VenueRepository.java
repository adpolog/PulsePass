package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByCode(String code);
    List<Venue> findByActiveTrueOrderByNameAsc();
}