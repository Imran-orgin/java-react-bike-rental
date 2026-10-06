package com.imran.bike_rental_api.dto;

import com.imran.bike_rental_api.model.Bike;

import java.time.LocalDate;

public record BookingResponse(
        Long id,
        Bike bike,
        String customerName,
        String customerPhone,
        LocalDate startDate,
        LocalDate endDate,
        double totalPrice,
        String bookedBy) {
}