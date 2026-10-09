import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import { auth, setToken } from "../api";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const r = await auth.login({ email, password });
      setToken(r.access_token);
      onAuth(r.user);
      nav(loc.state?.from || "/", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

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
          <small>A NOTE FROM THE OUTSIDE</small>
          <h1>
            The world is
            <br />
            still <em>out there.</em>
          </h1>
          <p>Trade a little screen time for a story worth telling.</p>
        </div>

        <footer>LESS SCROLLING — MORE EXPLORING</footer>
      </aside>

      <form className="auth-form" onSubmit={submit}>
        <small>WELCOME BACK</small>
        <h2>
          Pick up where
          <br />
          you left off.
        </h2>
        <p>Your next small adventure is waiting.</p>

        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary wide" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight size={16} />
        </button>

        <p className="switch">
          New to the outside? <Link to="/register">Create an account ↗</Link>
        </p>
      </form>
    </main>
  );
}