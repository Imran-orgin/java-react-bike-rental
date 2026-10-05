package com.imran.bike_rental_api.service;

import com.imran.bike_rental_api.dto.BookingRequest;
import com.imran.bike_rental_api.exception.BookingConflictException;
import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.model.Booking;
import com.imran.bike_rental_api.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BikeService bikeService;

    public Booking create(BookingRequest req) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }

        Bike bike = bikeService.getById(req.getBikeId());
        if (!bike.isAvailable()) {
            throw new IllegalArgumentException("Bike is not available");
        }

        boolean overlap = bookingRepository
                .existsByBikeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        bike.getId(), req.getEndDate(), req.getStartDate());
        if (overlap) {
            throw new BookingConflictException("Bike already booked for these dates");
        }

        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;

        Booking booking = new Booking();
        booking.setBike(bike);
        booking.setCustomerName(req.getCustomerName());
        booking.setCustomerPhone(req.getCustomerPhone());
        booking.setStartDate(req.getStartDate());
        booking.setEndDate(req.getEndDate());
        booking.setTotalPrice(days * bike.getPricePerDay());
        return bookingRepository.save(booking);
    }

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }
}