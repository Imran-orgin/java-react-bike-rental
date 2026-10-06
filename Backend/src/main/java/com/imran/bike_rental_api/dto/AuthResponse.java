package com.imran.bike_rental_api.dto;

public record AuthResponse(String token, String email, String fullName, String role) {
}