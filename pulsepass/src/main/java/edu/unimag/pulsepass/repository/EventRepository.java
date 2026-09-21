package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Event;
import edu.unimag.pulsepass.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    @Query("SELECT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findEventsByArtist(@Param("stageName") String stageName);

    @Query("SELECT e FROM Event e JOIN e.artists a JOIN e.venue v WHERE v.city = :city AND a.stageName = :stageName")
    List<Event> findByCityAndArtist(@Param("city") String city, @Param("stageName") String stageName);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a JOIN e.venue v WHERE e.status = :status AND e.eventDate > :date AND v.city = :city AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistText, '%')) ORDER BY e.eventDate ASC")
    List<Event> findRecommendedEvents(@Param("status") EventStatus status, @Param("date") LocalDate date, @Param("city") String city, @Param("artistText") String artistText);
}