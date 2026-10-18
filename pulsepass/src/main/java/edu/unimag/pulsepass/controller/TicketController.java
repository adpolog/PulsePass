package edu.unimag.pulsepass.controller;

import edu.unimag.pulsepass.dto.request.PurchaseTicketRequest;
import edu.unimag.pulsepass.dto.response.TicketResponse;
import edu.unimag.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }


    @PostMapping
    @PreAuthorize("@authz.canPurchaseTicket(#request.userEmail(), authentication.principal)")
    public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.purchase(request));
    }

    // STAFF/ADMIN.
    @GetMapping("/{ticketCode}")
    @PreAuthorize("@authz.canAccessTicket(#ticketCode, authentication.principal)")
    public ResponseEntity<TicketResponse> findByCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.findByCode(ticketCode));
    }


    @GetMapping("/by-user")
    @PreAuthorize("@authz.canAccessUserByEmail(#email, authentication.principal)")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@RequestParam String email) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }


    @PatchMapping("/{ticketCode}/cancel")
    @PreAuthorize("@authz.canCancelTicket(#ticketCode, authentication.principal)")
    public ResponseEntity<TicketResponse> cancel(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    // STAFF/ADMIN
    @PatchMapping("/{ticketCode}/use")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }
}