import { useState } from "react";
import api from "../api";
import { AuthContext } from "./authContext";

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("auth")) || null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const save = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    save(res.data);
  };

  const register = async (fullName, email, password) => {
    const res = await api.post("/auth/register", { fullName, email, password });
    save(res.data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}