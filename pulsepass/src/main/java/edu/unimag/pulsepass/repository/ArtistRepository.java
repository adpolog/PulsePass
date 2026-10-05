package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Artist;
import edu.unimag.pulsepass.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

    Optional<Artist> findByStageName(String stageName);
    List<Artist> findByActiveTrueOrderByStageNameAsc();
}