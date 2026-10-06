import { useState } from "react";
import { useAuth } from "./auth/authContext";

export default function AuthPage({ mode, onDone, onSwitch }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.fullName, form.email, form.password);
      }
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Log in" : "Create account"}</h2>

        {!isLogin && (
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
        )}
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={isLogin ? undefined : 6}
            required
          />
        </label>

        <button type="submit" className="btn btn-lg" disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
        </button>
        {error && <div className="message error">{error}</div>}

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}