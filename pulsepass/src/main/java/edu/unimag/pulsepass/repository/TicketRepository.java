package edu.unimag.pulsepass.repository;

import edu.unimag.pulsepass.domain.Ticket;
import edu.unimag.pulsepass.domain.TicketStatus;
import edu.unimag.pulsepass.domain.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketCode(String ticketCode);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = :status")
    long countTicketsByEventCodeAndStatus(@Param("eventCode") String eventCode, @Param("status") TicketStatus status);
    Optional<Ticket> findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(String email);
}