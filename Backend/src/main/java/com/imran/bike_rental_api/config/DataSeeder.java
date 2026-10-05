package com.imran.bike_rental_api.config;

import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.repository.BikeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedBikes(BikeRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Bike(null, "N160", "Bajaj", "motorbike", 3500.0, true));
                repository.save(new Bike(null, "FZ V2", "Yamaha", "motorbike", 3500.0, true));
                repository.save(new Bike(null, "NS 200", "Bajaj", "motorbike", 4000.0, true));
            }
        };
    }
}