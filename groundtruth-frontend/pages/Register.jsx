import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import { auth, setToken } from "../api";

export default function Register({ onAuth }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    country: "India",
    state: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const r = await auth.register(form);
      setToken(r.access_token);
      onAuth(r.user);
      nav("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["username", "Username", "text"],
    ["email", "Email address", "email"],
    ["password", "Password (8+ characters)", "password"],
    ["state", "State", "text"],
    ["city", "City", "text"],
  ];

  return (
    <main className="auth">
      <aside className="auth-side">
        <Link className="brand light" to="/">
          <span className="brand-icon">
            <Compass />
          </span>
          <span>
            groundtruth<span className="clay">.</span>
            <small>FIELD JOURNAL / VOL. 01</small>
          </span>
        </Link>

        <div>
          <small>YOUR OUTSIDE ERA</small>
          <h1>
            Make room
            <br />
            for <em>the real.</em>
          </h1>
          <p>One small quest. A different way to see your everyday.</p>
        </div>

        <footer>LESS SCROLLING — MORE EXPLORING</footer>
      </aside>

      <form className="auth-form" onSubmit={submit}>
        <small>START YOUR JOURNAL</small>
        <h2>
          Every explorer
          <br />
          starts somewhere.
        </h2>
        <p>Create your account. The outside can wait one minute.</p>

        {fields.map(([name, label, type]) => (
          <label key={name}>
            {label}
            <input
              name={name}
              type={type}
              required={["username", "email", "password"].includes(name)}
              minLength={
                name === "username" ? 3 : name === "password" ? 8 : undefined
              }
              maxLength={name === "password" ? 128 : 80}
              value={form[name]}
              onChange={change}
              placeholder={
                name === "username"
                  ? "trail_name"
                  : name === "email"
                  ? "you@example.com"
                  : name === "password"
                  ? "At least 8 characters"
                  : `Your ${name}`
              }
            />
          </label>
        ))}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary wide" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
          <ArrowRight size={16} />
        </button>

        <p className="switch">
          Already have a journal? <Link to="/login">Sign in ↗</Link>
        </p>
      </form>
    </main>
  );
}