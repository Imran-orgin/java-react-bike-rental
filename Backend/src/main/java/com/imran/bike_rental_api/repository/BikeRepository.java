package com.imran.bike_rental_api.repository;

import com.imran.bike_rental_api.model.Bike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BikeRepository extends JpaRepository<Bike, Long> {
    List<Bike> findByAvailableTrue();
}