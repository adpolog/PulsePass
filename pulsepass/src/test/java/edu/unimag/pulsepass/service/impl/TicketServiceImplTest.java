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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private User createValidUser(boolean active, int age) {
        User user = new User();
        user.setActive(active);
        user.setEmail("user@email.com");

        UserProfile profile = new UserProfile();
        profile.setBirthDate(LocalDate.now().minusYears(age));
        user.setUserProfile(profile);

        return user;
    }

    private Event createValidEvent(EventStatus status, int capacity) {
        Venue venue = new Venue();
        venue.setCapacity(capacity);

        Event event = new Event();
        event.setEventCode("CMF-2026");
        event.setStatus(status);
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setMinimumAge(18);
        event.setVenue(venue);

        return event;
    }

    @Test
    void purchase_WhenValid_ShouldCreatePaidTicket() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(true, 25);
        Event event = createValidEvent(EventStatus.PUBLISHED, 100);
        Ticket ticket = new Ticket();
        TicketResponse response = new TicketResponse(1L, "TCK-01", TicketType.GENERAL,
                new BigDecimal("100.00"), TicketStatus.PAID, LocalDateTime.now(),
                "user@email.com", "CMF-2026", "Music Fest");

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countTicketsByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(10L);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        TicketResponse result = ticketService.purchase(request);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(TicketStatus.PAID);
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    void purchase_WhenUserNotFound_ShouldThrowException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("unknown@email.com", "CMF-2026", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase("unknown@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_WhenUserInactive_ShouldThrowBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(false, 25);

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_WhenEventDraft_ShouldThrowBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(true, 25);
        Event event = createValidEvent(EventStatus.DRAFT, 100);

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_WhenUnderageUser_ShouldThrowBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(true, 17);
        Event event = createValidEvent(EventStatus.PUBLISHED, 100);

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_WhenNoCapacity_ShouldThrowBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(true, 25);
        Event event = createValidEvent(EventStatus.PUBLISHED, 10);

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countTicketsByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(10L);

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_WhenLastTicketAvailable_ShouldSaveTicketAndSetEventSoldOut() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("user@email.com", "CMF-2026", TicketType.GENERAL);
        User user = createValidUser(true, 25);
        Event event = createValidEvent(EventStatus.PUBLISHED, 10);
        Ticket ticket = new Ticket();
        TicketResponse response = new TicketResponse(1L, "TCK-01", TicketType.GENERAL,
                new BigDecimal("100.00"), TicketStatus.PAID, LocalDateTime.now(),
                "user@email.com", "CMF-2026", "Music Fest");

        when(userRepository.findByEmailIgnoreCase("user@email.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countTicketsByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(9L);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        ticketService.purchase(request);

        assertThat(event.getStatus()).isEqualTo(EventStatus.SOLD_OUT);
        verify(eventRepository).save(event);
    }

    @Test
    void cancel_WhenPaid_ShouldSetStatusCancelled() {
        Event event = createValidEvent(EventStatus.PUBLISHED, 100);
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.PAID);
        ticket.setEvent(event);

        TicketResponse response = new TicketResponse(1L, "TCK-01", TicketType.GENERAL,
                new BigDecimal("100.00"), TicketStatus.CANCELLED, LocalDateTime.now(),
                "user@email.com", "CMF-2026", "Music Fest");

        when(ticketRepository.findByTicketCode("TCK-01")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        TicketResponse result = ticketService.cancel("TCK-01");

        assertThat(result.status()).isEqualTo(TicketStatus.CANCELLED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void cancel_WhenUsed_ShouldThrowBusinessRuleException() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.USED);

        when(ticketRepository.findByTicketCode("TCK-01")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.cancel("TCK-01"))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void markAsUsed_WhenPaid_ShouldSetStatusUsed() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.PAID);

        TicketResponse response = new TicketResponse(1L, "TCK-01", TicketType.GENERAL,
                new BigDecimal("100.00"), TicketStatus.USED, LocalDateTime.now(),
                "user@email.com", "CMF-2026", "Music Fest");

        when(ticketRepository.findByTicketCode("TCK-01")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        TicketResponse result = ticketService.markAsUsed("TCK-01");

        assertThat(result.status()).isEqualTo(TicketStatus.USED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void markAsUsed_WhenCancelled_ShouldThrowBusinessRuleException() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.CANCELLED);

        when(ticketRepository.findByTicketCode("TCK-01")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.markAsUsed("TCK-01"))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }
}