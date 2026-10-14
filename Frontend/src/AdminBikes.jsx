import { useRef, useState } from "react";
import api, { imageSrc } from "./api";

const emptyBike = {
  name: "",
  brand: "",
  type: "motorbike",
  pricePerDay: "",
  imageUrl: "",
  available: true,
};

export default function AdminBikes({ bikes, onChanged, money }) {
  const [form, setForm] = useState(emptyBike);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const showError = (err) =>
    setMessage({
      type: "error",
      text: err.response?.data?.error || "Something went wrong. Please try again.",
    });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyBike);
  };

  const startEdit = (bike) => {
    setEditingId(bike.id);
    setForm({
      name: bike.name,
      brand: bike.brand || "",
      type: bike.type || "motorbike",
      pricePerDay: String(bike.pricePerDay),
      imageUrl: bike.imageUrl || "",
      available: bike.available,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMessage(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await api.post("/bikes/upload", data);
      setForm((current) => ({ ...current, imageUrl: res.data.imageUrl }));
    } catch (err) {
      showError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const payload = {
      ...form,
      pricePerDay: Number(form.pricePerDay),
      imageUrl: form.imageUrl || null,
    };
    try {
      if (editingId) {
        await api.put(`/bikes/${editingId}`, payload);
        setMessage({ type: "success", text: "Bike updated." });
      } else {
        await api.post("/bikes", payload);
        setMessage({ type: "success", text: "Bike added." });
      }
      reset();
      onChanged();
    } catch (err) {
      showError(err);
    }
  };

  const toggleAvailability = async (bike) => {
    setMessage(null);
    try {
      await api.put(`/bikes/${bike.id}`, { ...bike, available: !bike.available });
      onChanged();
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async (bike) => {
    if (!window.confirm(`Delete ${bike.name}? This cannot be undone.`)) return;
    setMessage(null);
    try {
      await api.delete(`/bikes/${bike.id}`);
      if (editingId === bike.id) reset();
      setMessage({ type: "success", text: `${bike.name} deleted.` });
      onChanged();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <>
      <h2>Manage bikes</h2>
      <div className="admin-grid">
        <form className="booking-form" onSubmit={handleSubmit}>
          <h3 className="admin-form-title">{editingId ? "Edit bike" : "Add a new bike"}</h3>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Brand
            <input name="brand" value={form.brand} onChange={handleChange} />
          </label>
          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="motorbike">Motorbike</option>
              <option value="scooter">Scooter</option>
              <option value="bicycle">Bicycle</option>
            </select>
          </label>
          <label>
            Price per day
            <input
              type="number"
              name="pricePerDay"
              min="1"
              step="any"
              value={form.pricePerDay}
              onChange={handleChange}
              required
            />
          </label>

          <div className="image-field">
            <span className="field-label">Photo</span>
            {form.imageUrl && (
              <img className="image-preview" src={imageSrc(form.imageUrl)} alt="Bike preview" />
            )}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={uploading}
                onClick={() => fileRef.current.click()}
              >
                {uploading ? "Uploading..." : form.imageUrl ? "Change photo" : "Choose photo"}
              </button>
              {form.imageUrl && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setForm({ ...form, imageUrl: "" })}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              hidden
            />
            <span className="hint no-margin">JPG, PNG or WebP, up to 5 MB.</span>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            Available for booking
          </label>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={uploading}>
              {editingId ? "Save changes" : "Add bike"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={reset}>
                Cancel edit
              </button>
            )}
          </div>
          {message && <div className={`message ${message.type}`}>{message.text}</div>}
        </form>

        <div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bike</th>
                  <th>Type</th>
                  <th>Price / day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bikes.map((bike) => (
                  <tr key={bike.id}>
                    <td>
                      <strong>{bike.name}</strong>
                      <div className="muted">{bike.brand}</div>
                    </td>
                    <td>{bike.type}</td>
                    <td>{money(bike.pricePerDay)}</td>
                    <td>
                      <button
                        className={bike.available ? "pill ok" : "pill no"}
                        title="Click to change"
                        onClick={() => toggleAvailability(bike)}
                      >
                        {bike.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm" onClick={() => startEdit(bike)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bike)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Click a status to mark a bike available or unavailable.</p>
        </div>
      </div>
    </>
  );
}