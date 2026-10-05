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
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.userEmail()));
        if (!user.getActive()) {
            throw new BusinessRuleException("Un usuario inactivo no puede comprar tickets.");
        }

        // 2. BR-TICKET-003, 004 y 005
        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado: " + request.eventCode()));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Solo se pueden comprar tickets para eventos publicados.");
        }
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede comprar tickets para un evento pasado.");
        }

        // 3. (BR-TICKET-006
        if (event.getMinimumAge() > 0) {
            int ageAtEvent = Period.between(user.getUserProfile().getBirthDate(), event.getEventDate().toLocalDate()).getYears();
            if (ageAtEvent < event.getMinimumAge()) {
                throw new BusinessRuleException("El usuario no cumple con la edad mínima requerida.");
            }
        }

        // 4. BR-TICKET-007
        long paidTickets = ticketRepository.countTicketsByEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        if (paidTickets >= event.getVenue().getCapacity()) {
            throw new BusinessRuleException("El evento no tiene capacidad disponible.");
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
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado."));

        // BR-TICKET-010 y 011
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo se puede cancelar un ticket en estado PAID.");
        }
        // BR-TICKET-012
        if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede cancelar el ticket después de la fecha del evento.");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado."));

        // BR-TICKET-013 y 014
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo se puede usar un ticket en estado PAID.");
        }

        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado."));
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
        throw new UnsupportedOperationException("Requiere método findByEventEventCodeAndStatus en TicketRepository");
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