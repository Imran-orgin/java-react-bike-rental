package com.imran.bike_rental_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull
    private Long bikeId;
    @NotBlank
    private String customerName;
    @NotBlank
    private String customerPhone;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
}