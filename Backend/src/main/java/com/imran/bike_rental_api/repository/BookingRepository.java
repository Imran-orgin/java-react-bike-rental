package com.imran.bike_rental_api.repository;

import com.imran.bike_rental_api.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    // overlap: existing.start <= newEnd AND existing.end >= newStart
    boolean existsByBikeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long bikeId, LocalDate newEnd, LocalDate newStart);

    boolean existsByBikeId(Long bikeId);

    List<Booking> findByUserEmailOrderByStartDateDesc(String email);

    List<Booking> findAllByOrderByStartDateDesc();
}