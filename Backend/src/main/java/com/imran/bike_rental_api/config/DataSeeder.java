package com.imran.bike_rental_api.config;

import com.imran.bike_rental_api.model.Bike;
import com.imran.bike_rental_api.repository.BikeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedBikes(BikeRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Bike(null, "N160", "Bajaj", "motorbike", 3500.0, true, "/bikes/n160.jpg"));
                repository.save(new Bike(null, "FZ V2", "Yamaha", "motorbike", 3500.0, true, "/bikes/fz-v2.jpg"));
                repository.save(new Bike(null, "NS 200", "Bajaj", "motorbike", 4000.0, true, "/bikes/ns-200.jpg"));
            } else {
                // existing bikes: add image paths if they are missing
                Map<String, String> images = Map.of(
                        "N160", "/bikes/n160.jpg",
                        "FZ V2", "/bikes/fz-v2.jpg",
                        "NS 200", "/bikes/ns-200.jpg");
                for (Bike bike : repository.findAll()) {
                    if (bike.getImageUrl() == null && images.containsKey(bike.getName())) {
                        bike.setImageUrl(images.get(bike.getName()));
                        repository.save(bike);
                    }
                }
            }
        };
    }
}