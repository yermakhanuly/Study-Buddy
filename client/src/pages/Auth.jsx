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
      <div className="card" style={{ maxWidth: 420, margin: "48px auto" }}>
        <h2>{mode === "login" ? "Login" : "Create account"}</h2>
        <form onSubmit={submit}>
          {mode === "register" && (
            <input className="input" placeholder="Your name"
              value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          )}
          <input className="input" type="email" placeholder="Email"
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input className="input" type="password" placeholder="Password"
            value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          {error && <p style={{color:"crimson"}}>{error}</p>}
          <button className="btn" disabled={loading}>
            {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>
        <p style={{marginTop:12}}>
          {mode === "login" ? (
            <>No account? <button className="btn" onClick={()=>setMode("register")}>Register</button></>
          ) : (
            <>Have an account? <button className="btn" onClick={()=>setMode("login")}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}
