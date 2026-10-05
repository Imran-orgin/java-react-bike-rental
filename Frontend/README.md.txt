# Java + React Bike Rental

Bike rental system with booking and double-booking prevention.

## Tech Stack
- Backend: Java 17+, Spring Boot, Spring Data JPA, MySQL
- Frontend: React (Vite), Axios

## Features
- View bikes (N160, FZ V2, NS 200) with price per day
- Book a bike for a date range; total price = days x price per day
- Same bike cannot be booked for overlapping dates (409 Conflict)
- Validation and clear error messages (400 / 404 / 409)

## API
- `GET /api/bikes`, `GET /api/bikes/{id}`, `POST /api/bikes`, `PUT /api/bikes/{id}`, `DELETE /api/bikes/{id}`
- `POST /api/bookings`, `GET /api/bookings`

## Run
1. Create MySQL database `bike_rental_db`
2. Backend: `cd Backend` then `./mvnw spring-boot:run` (port 8080)
3. Frontend: `cd Frontend`, `npm install`, `npm run dev` (port 5173)