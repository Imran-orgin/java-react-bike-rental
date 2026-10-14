package com.imran.bike_rental_api.service;

import com.imran.bike_rental_api.dto.BookingRequest;
import com.imran.bike_rental_api.dto.BookingResponse;
import com.imran.bike_rental_api.exception.BookingConflictException;
import com.imran.bike_rental_api.exception.ForbiddenOperationException;
import com.imran.bike_rental_api.exception.InvalidCredentialsException;
import com.imran.bike_rental_api.exception.ResourceNotFoundException;
import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.model.Booking;
import com.imran.bike_rental_api.model.User;
import com.imran.bike_rental_api.repository.BookingRepository;
import com.imran.bike_rental_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BikeService bikeService;

    public BookingResponse create(BookingRequest req, String email) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

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
        booking.setUser(user);
        booking.setCustomerName(req.getCustomerName());
        booking.setCustomerPhone(req.getCustomerPhone());
        booking.setStartDate(req.getStartDate());
        booking.setEndDate(req.getEndDate());
        booking.setTotalPrice(days * bike.getPricePerDay());
        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getBookings(String email, boolean admin) {
        List<Booking> bookings = admin
                ? bookingRepository.findAllByOrderByStartDateDesc()
                : bookingRepository.findByUserEmailOrderByStartDateDesc(email);
        return bookings.stream().map(this::toResponse).toList();
    }

    public void cancel(Long id, String email, boolean admin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!admin) {
            boolean owner = booking.getUser() != null && booking.getUser().getEmail().equals(email);
            if (!owner) {
                throw new ForbiddenOperationException("You can only cancel your own bookings");
            }
            if (!booking.getStartDate().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Bookings that have already started cannot be cancelled");
            }
        }
        bookingRepository.delete(booking);
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getBike(),
                b.getCustomerName(),
                b.getCustomerPhone(),
                b.getStartDate(),
                b.getEndDate(),
                b.getTotalPrice(),
                b.getUser() != null ? b.getUser().getEmail() : null);
    }
}