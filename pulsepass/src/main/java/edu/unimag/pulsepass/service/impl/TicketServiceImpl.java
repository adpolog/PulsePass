package edu.unimag.pulsepass.service.impl;
import edu.unimag.pulsepass.domain.*;
import edu.unimag.pulsepass.dto.request.PurchaseTicketRequest;
import edu.unimag.pulsepass.dto.response.TicketResponse;
import edu.unimag.pulsepass.exception.BusinessRuleException;
import edu.unimag.pulsepass.exception.ResourceNotFoundException;
import edu.unimag.pulsepass.mapper.TicketMapper;
import edu.unimag.pulsepass.repository.EventRepository;
import edu.unimag.pulsepass.repository.TicketRepository;
import edu.unimag.pulsepass.repository.UserRepository;
import edu.unimag.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository,
                             EventRepository eventRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        // BR-TICKET-001 y 002
        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userEmail()));
        if (!user.getActive()) {
            throw new BusinessRuleException("Inactive user can't buy tickets");
        }

        // 2. BR-TICKET-003, 004 y 005
        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.eventCode()));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Tickets can only be purchased for published events.");
        }
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Cannot purchase tickets for a past event.");
        }

        // 3. (BR-TICKET-006
        if (event.getMinimumAge() > 0) {
            int ageAtEvent = Period.between(user.getUserProfile().getBirthDate(), event.getEventDate().toLocalDate()).getYears();
            if (ageAtEvent < event.getMinimumAge()) {
                throw new BusinessRuleException("User does not meet the minimum required age.");
            }
        }

        // 4. BR-TICKET-007
        long paidTickets = ticketRepository.countTicketsByEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        if (paidTickets >= event.getVenue().getCapacity()) {
            throw new BusinessRuleException("The event has no available capacity.");
        }

        // 5. BR-TICKET-009
        Ticket ticket = new Ticket();
        ticket.setTicketCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase()); // Código aleatorio
        ticket.setType(request.type());
        ticket.setStatus(TicketStatus.PAID);
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setUser(user);
        ticket.setEvent(event);
        ticket.setPrice(calculatePrice(request.type())); // encapsulado

        // 6. BR-TICKET-008
        if (paidTickets + 1 == event.getVenue().getCapacity()) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        // BR-TICKET-010 y 011
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only tickets in PAID status can be cancelled.");
        }
        // BR-TICKET-012
        if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Cannot cancel a ticket after the event date.");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        // BR-TICKET-013 y 014
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only tickets in PAID status can be used.");
        }

        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        throw new UnsupportedOperationException("Requires findByEventEventCodeAndStatus method in TicketRepository");
    }

    // Estrategia de precio básica BR-TICKET-009
    private BigDecimal calculatePrice(TicketType type) {
        return switch (type) {
            case VIP -> new BigDecimal("200.00");
            case BACKSTAGE -> new BigDecimal("500.00");
            default -> new BigDecimal("100.00"); // GENERAL u otros
        };
    }
}