import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http.js";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(url, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card hero" style={{ maxWidth: 520, margin: "48px auto" }}>
        <h2 className="page-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="page-subtitle">
          Turn long notes into focused study cards in seconds.
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              className="input"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          {error && <div className="alert error">{error}</div>}
          <button className="btn" disabled={loading}>
            {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>
        <div className="row" style={{ marginTop: 16 }}>
          <span className="meta">
            {mode === "login" ? "New here?" : "Already have an account?"}
          </span>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create an account" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
