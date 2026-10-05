package com.imran.bike_rental_api.controller;

import com.imran.bike_rental_api.dto.BookingRequest;
import com.imran.bike_rental_api.model.Booking;
import com.imran.bike_rental_api.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;

    @PostMapping
    public Booking create(@Valid @RequestBody BookingRequest req) {
        return service.create(req);
    }

    @GetMapping
    public List<Booking> getAll() {
        return service.getAll();
    }
}