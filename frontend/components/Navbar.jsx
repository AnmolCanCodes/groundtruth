import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Compass, BookOpen, Trophy, LogOut, Menu, X } from "lucide-react";
import { clearToken } from "../api";

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const links = [
    ["/", "Field journal", BookOpen],
    ["/quests", "Explore", Compass],
    ["/progress", "My progress", BookOpen],
    ["/leaderboard", "Leaderboard", Trophy],
  ];

  function logout() {
    clearToken();
    onLogout();
    nav("/login");
  }

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-icon">
          <Compass />
        </span>
        <span>
          groundtruth<span className="clay">.</span>
          <small>FIELD JOURNAL / VOL. 01</small>
        </span>
      </Link>

      <button
        className="menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? "nav-links open" : "nav-links"}>
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {user ? (
          <button className="logout" onClick={logout}>
            <span className="avatar">
              {user.username?.[0]?.toUpperCase()}
            </span>
            {user.username}
            <LogOut size={14} />
          </button>
        ) : (
          <Link className="nav-link" to="/login">
            Sign in ↗
          </Link>
        )}
      </nav>
    </header>
  );
}