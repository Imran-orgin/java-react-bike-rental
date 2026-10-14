import { useEffect, useState } from "react";
import api, { imageSrc } from "./api";
import { useAuth } from "./auth/authContext";
import AuthPage from "./AuthPage";
import AdminBikes from "./AdminBikes";
import "./App.css";

const BRAND = "Bike Rental"; // change to your friend's business name
const CURRENCY = "LKR"; // change if needed

const money = (n) => `${CURRENCY} ${Number(n).toLocaleString()}`;

const emptyForm = {
  bikeId: "",
  customerName: "",
  customerPhone: "",
  startDate: "",
  endDate: "",
};
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

function BikeImage({ bike }) {
  const [failed, setFailed] = useState(false);
  if (!bike.imageUrl || failed) {
    return <div className="bike-placeholder">{bike.name}</div>;
  }
  return <img src={imageSrc(bike.imageUrl)} alt={bike.name} onError={() => setFailed(true)} />;
}

export default function App() {
  const { user, logout } = useAuth();
  const [view, setView] = useState("home"); // home | login | register | admin
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null); // booking form result
  const [cancelMessage, setCancelMessage] = useState(null); // cancel result
  const [notice, setNotice] = useState(null); // page-level errors

  const isAdmin = user?.role === "ADMIN";

  const loadBikes = async () => {
    try {
      const res = await api.get("/bikes");
      setBikes(res.data);
    } catch {
      setNotice("Unable to reach the server. Please try again later.");
    }
  };

  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        setView("home");
        setNotice("Your session has expired. Please log in again.");
      }
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  useEffect(() => {
    if (user) loadBookings();
  }, [user]);

  const handleLogout = () => {
    logout();
    setView("home");
    setForm(emptyForm);
    setMessage(null);
    setCancelMessage(null);
    setBookings([]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectBike = (id) => {
    setForm({ ...form, bikeId: String(id) });
    document.getElementById("book").scrollIntoView({ behavior: "smooth" });
  };

  const selectedBike = bikes.find((b) => String(b.id) === String(form.bikeId));
  const days =
    form.startDate && form.endDate
      ? Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1
      : 0;
  const estimate = selectedBike && days > 0 ? days * selectedBike.pricePerDay : 0;
  const visibleBookings = user ? bookings : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post("/bookings", {
        ...form,
        customerName: form.customerName.trim() || user.fullName,
        bikeId: Number(form.bikeId),
      });
      setMessage({
        type: "success",
        text: `Booking confirmed! Total: ${money(res.data.totalPrice)}`,
      });
      setForm(emptyForm);
      loadBookings();
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        setNotice("Your session has expired. Please log in again.");
        setView("login");
        return;
      }
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Something went wrong. Please try again.",
      });
    }
  };

  const cancelBooking = async (booking) => {
    const label = `${booking.bike?.name} (${booking.startDate} to ${booking.endDate})`;
    if (!window.confirm(`Cancel this booking?\n${label}`)) return;
    setCancelMessage(null);
    try {
      await api.delete(`/bookings/${booking.id}`);
      setCancelMessage({ type: "success", text: "Booking cancelled." });
      loadBookings();
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        setNotice("Your session has expired. Please log in again.");
        setView("login");
        return;
      }
      setCancelMessage({
        type: "error",
        text: err.response?.data?.error || "Unable to cancel this booking.",
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <span className="logo" onClick={() => setView("home")}>🏍️ {BRAND}</span>
          <div className="nav-links">
            {view === "home" && (
              <>
                <a href="#bikes">Bikes</a>
                <a href="#book">Book</a>
                {user && <a href="#bookings">Bookings</a>}
              </>
            )}
            {isAdmin && (
              <button
                className="nav-btn"
                onClick={() => setView(view === "admin" ? "home" : "admin")}
              >
                {view === "admin" ? "Back to site" : "Manage bikes"}
              </button>
            )}
            {user ? (
              <>
                <span className="nav-user">Hi, {user.fullName}</span>
                <button className="nav-btn" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <button className="nav-btn" onClick={() => setView("login")}>Log in</button>
                <button className="nav-btn primary" onClick={() => setView("register")}>Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {(view === "login" || view === "register") && (
        <AuthPage
          mode={view}
          onDone={() => {
            setNotice(null);
            setView("home");
          }}
          onSwitch={() => setView(view === "login" ? "register" : "login")}
        />
      )}

      {view === "admin" && isAdmin && (
        <main className="container">
          <section className="section">
            <AdminBikes bikes={bikes} onChanged={loadBikes} money={money} />
          </section>
        </main>
      )}

      {view === "home" && (
        <>
          <header className="hero">
            <div className="hero-inner">
              <h1>Rent a bike. Ride today.</h1>
              <p>Choose your bike, pick your dates, and book in a minute.</p>
              <a className="btn-hero" href="#bikes">View bikes</a>
            </div>
          </header>

          <main className="container">
            {notice && <div className="message error banner">{notice}</div>}

            <section id="bikes" className="section">
              <h2>Our bikes</h2>
              <div className="bikes">
                {bikes.map((bike) => (
                  <div key={bike.id} className="bike-card">
                    <div className="bike-img">
                      <BikeImage bike={bike} />
                      <span className={bike.available ? "badge ok" : "badge no"}>
                        {bike.available ? "Available" : "Not available"}
                      </span>
                    </div>
                    <div className="bike-body">
                      <h3>{bike.name}</h3>
                      <p className="muted">{bike.brand} · {bike.type}</p>
                      <div className="bike-footer">
                        <p className="price">
                          {money(bike.pricePerDay)} <span>/ day</span>
                        </p>
                        <button
                          className="btn"
                          disabled={!bike.available}
                          onClick={() => selectBike(bike.id)}
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="book" className="section">
              <h2>Book your ride</h2>
              {!user ? (
                <div className="login-prompt">
                  <h3>Log in to book</h3>
                  <p className="muted">Log in to your account, or create a new one to book a bike.</p>
                  <div className="actions">
                    <button className="btn" onClick={() => setView("login")}>Log in</button>
                    <button className="btn btn-outline" onClick={() => setView("register")}>Sign up</button>
                  </div>
                </div>
              ) : (
                <div className="book-grid">
                  <div className="summary">
                    {selectedBike ? (
                      <>
                        <div className="summary-img">
                          <BikeImage bike={selectedBike} />
                        </div>
                        <h3>{selectedBike.name}</h3>
                        <p className="muted">{selectedBike.brand} · {selectedBike.type}</p>
                        <p className="price">
                          {money(selectedBike.pricePerDay)} <span>/ day</span>
                        </p>
                        {estimate > 0 && (
                          <div className="estimate">
                            <span>
                              {days} day(s) × {money(selectedBike.pricePerDay)}
                            </span>
                            <strong>{money(estimate)}</strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="muted">Select a bike from the list above, or choose one from the dropdown.</p>
                    )}
                  </div>

                  <form className="booking-form" onSubmit={handleSubmit}>
                    <label>
                      Bike
                      <select name="bikeId" value={form.bikeId} onChange={handleChange} required>
                        <option value="">Select a bike</option>
                        {bikes
                          .filter((bike) => bike.available)
                          .map((bike) => (
                            <option key={bike.id} value={bike.id}>
                              {bike.name} ({money(bike.pricePerDay)}/day)
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Customer name
                      <input
                        name="customerName"
                        placeholder={user.fullName}
                        value={form.customerName}
                        onChange={handleChange}
                      />
                    </label>
                    <label>
                      Phone number
                      <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required />
                    </label>
                    <div className="row">
                      <label>
                        Start date
                        <input
                          type="date"
                          name="startDate"
                          min={today}
                          value={form.startDate}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        End date
                        <input
                          type="date"
                          name="endDate"
                          min={form.startDate || today}
                          value={form.endDate}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <button type="submit" className="btn btn-lg">Book now</button>
                    {message && <div className={`message ${message.type}`}>{message.text}</div>}
                  </form>
                </div>
              )}
            </section>

            {user && (
              <section id="bookings" className="section">
                <h2>{isAdmin ? "All bookings" : "My bookings"}</h2>
                {cancelMessage && (
                  <div className={`message ${cancelMessage.type} spaced`}>{cancelMessage.text}</div>
                )}
                {visibleBookings.length === 0 ? (
                  <p className="muted">No bookings yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Bike</th>
                          <th>Customer</th>
                          <th>Phone</th>
                          {isAdmin && <th>Account</th>}
                          <th>From</th>
                          <th>To</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBookings.map((b) => (
                          <tr key={b.id}>
                            <td>{b.bike?.name}</td>
                            <td>{b.customerName}</td>
                            <td>{b.customerPhone}</td>
                            {isAdmin && <td>{b.bookedBy || "-"}</td>}
                            <td>{b.startDate}</td>
                            <td>{b.endDate}</td>
                            <td>{money(b.totalPrice)}</td>
                            <td>
                              {(isAdmin || b.startDate > today) && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => cancelBooking(b)}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </main>
        </>
      )}

      <footer className="footer">© {new Date().getFullYear()} {BRAND}. All rights reserved.</footer>
    </>
  );
}