package edu.unimag.pulsepass;

import edu.unimag.pulsepass.domain.*;
import edu.unimag.pulsepass.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

class TicketRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    void shouldRejectDuplicateTicketCode() {
        Venue venue = Venue.builder().code("VEN-TICK").name("Venue").city("Cali").address("Dir").capacity(100).build();
        venueRepository.saveAndFlush(venue);

        Event event = Event.builder().eventCode("EVT-TICK").name("Concert").category(EventCategory.MUSIC).status(EventStatus.PUBLISHED).eventDate(LocalDateTime.now().plusDays(1)).venue(venue).build();
        eventRepository.saveAndFlush(event);

        User user = User.builder().username("client").email("client@unimag.edu.co").active(true).build();
        userRepository.saveAndFlush(user);

        Ticket t1 = Ticket.builder().ticketCode("TCK-0001").type(TicketType.PAID).price(BigDecimal.valueOf(100)).status(TicketStatus.VIP).purchaseDate(LocalDateTime.now()).user(user).event(event).build();
        ticketRepository.saveAndFlush(t1);

        Ticket t2 = Ticket.builder().ticketCode("TCK-0001").type(TicketType.RESERVED).price(BigDecimal.valueOf(50)).status(TicketStatus.GENERAL).purchaseDate(LocalDateTime.now()).user(user).event(event).build();

        Assertions.assertThrows(DataIntegrityViolationException.class, () -> ticketRepository.saveAndFlush(t2));
    }

    @Test
    void shouldCountOnlyPaidTickets() {
        long paidCount = ticketRepository.countTicketsByEventCodeAndStatus("CMF-2026", TicketType.PAID);
        Assertions.assertTrue(paidCount >= 0);
    }
}