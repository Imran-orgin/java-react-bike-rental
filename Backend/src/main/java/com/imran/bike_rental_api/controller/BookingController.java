package com.imran.bike_rental_api.controller;

import com.imran.bike_rental_api.dto.BookingRequest;
import com.imran.bike_rental_api.dto.BookingResponse;
import com.imran.bike_rental_api.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;

    @PostMapping
    public BookingResponse create(@Valid @RequestBody BookingRequest req, Authentication authentication) {
        return service.create(req, authentication.getName());
    }

    @GetMapping
    public List<BookingResponse> getBookings(Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return service.getBookings(authentication.getName(), admin);
    }
}