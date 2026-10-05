package com.imran.bike_rental_api.controller;

import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.service.BikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BikeController {
    private final BikeService service;

    @GetMapping
    public List<Bike> getAll() {
        return service.getAll();
    }

    @GetMapping("/available")
    public List<Bike> getAvailable() {
        return service.getAvailable();
    }

    @GetMapping("/{id}")
    public Bike getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Bike create(@Valid @RequestBody Bike bike) {
        return service.create(bike);
    }

    @PutMapping("/{id}")
    public Bike update(@PathVariable Long id, @Valid @RequestBody Bike bike) {
        return service.update(id, bike);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}