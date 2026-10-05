import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";
const emptyForm = {
  bikeId: "",
  customerName: "",
  customerPhone: "",
  startDate: "",
  endDate: "",
};

export default function App() {
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const [bikeRes, bookingRes] = await Promise.all([
        axios.get(`${API}/bikes`),
        axios.get(`${API}/bookings`),
      ]);
      setBikes(bikeRes.data);
      setBookings(bookingRes.data);
    } catch {
      setMessage({
        type: "error",
        text: "Backend-ku connect aagala. Spring Boot run aagudha paarunga.",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedBike = bikes.find((b) => String(b.id) === String(form.bikeId));
  const days =
    form.startDate && form.endDate
      ? Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1
      : 0;
  const estimate = selectedBike && days > 0 ? days * selectedBike.pricePerDay : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await axios.post(`${API}/bookings`, {
        ...form,
        bikeId: Number(form.bikeId),
      });
      setMessage({ type: "success", text: `Booked! Total price: ${res.data.totalPrice}` });
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Server error" });
    }
  };

  return (
    <div className="page">
      <h1>Bike Rental</h1>

      <section>
        <h2>Bikes</h2>
        <div className="bikes">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className={`bike-card ${String(form.bikeId) === String(bike.id) ? "selected" : ""}`}
              onClick={() => setForm({ ...form, bikeId: String(bike.id) })}
            >
              <h3>{bike.name}</h3>
              <p>{bike.brand} · {bike.type}</p>
              <p className="price">{bike.pricePerDay} / day</p>
              <span className={bike.available ? "badge ok" : "badge no"}>
                {bike.available ? "Available" : "Not available"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Book a bike</h2>
        <form className="booking-form" onSubmit={handleSubmit}>
          <select name="bikeId" value={form.bikeId} onChange={handleChange} required>
            <option value="">Select bike</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name} ({bike.pricePerDay}/day)
              </option>
            ))}
          </select>
          <input
            name="customerName"
            placeholder="Your name"
            value={form.customerName}
            onChange={handleChange}
            required
          />
          <input
            name="customerPhone"
            placeholder="Phone number"
            value={form.customerPhone}
            onChange={handleChange}
            required
          />
          <label>
            Start date
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </label>
          <label>
            End date
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </label>

          {estimate > 0 && (
            <p className="estimate">
              {days} day(s) × {selectedBike.pricePerDay} = <b>{estimate}</b>
            </p>
          )}

          <button type="submit">Book now</button>
          {message && <div className={`message ${message.type}`}>{message.text}</div>}
        </form>
      </section>

      <section>
        <h2>Bookings</h2>
        {bookings.length === 0 ? (
          <p className="empty">Innum bookings illa</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Bike</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>From</th>
                <th>To</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.bike?.name}</td>
                  <td>{b.customerName}</td>
                  <td>{b.customerPhone}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>{b.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}