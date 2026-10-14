package com.imran.bike_rental_api.service;

import com.imran.bike_rental_api.exception.BookingConflictException;
import com.imran.bike_rental_api.exception.ResourceNotFoundException;
import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.repository.BikeRepository;
import com.imran.bike_rental_api.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BikeService {
    private final BikeRepository repository;
    private final BookingRepository bookingRepository;

    public List<Bike> getAll() {
        return repository.findAll();
    }

    public List<Bike> getAvailable() {
        return repository.findByAvailableTrue();
    }

    public Bike getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found: " + id));
    }

    public Bike create(Bike bike) {
        bike.setId(null);
        return repository.save(bike);
    }

    public Bike update(Long id, Bike updated) {
        Bike bike = getById(id);
        bike.setName(updated.getName());
        bike.setBrand(updated.getBrand());
        bike.setType(updated.getType());
        bike.setPricePerDay(updated.getPricePerDay());
        bike.setAvailable(updated.isAvailable());
        bike.setImageUrl(updated.getImageUrl());
        return repository.save(bike);
    }

    public void delete(Long id) {
        Bike bike = getById(id);
        if (bookingRepository.existsByBikeId(id)) {
            throw new BookingConflictException(
                    "This bike has bookings and cannot be deleted. Mark it as unavailable instead.");
        }
        repository.delete(bike);
    }
}