import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Quests from "../pages/Quests";
import QuestDetail from "../pages/QuestDetail";
import Progress from "../pages/Progress";
import Leaderboard from "../pages/Leaderboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import { auth, clearToken, getToken } from "../api";

export default function App() {
  const [user, setUser] = useState(undefined);
  const loc = useLocation();

  useEffect(() => {
    let live = true;

    if (!getToken()) {
      setUser(null);
      return;
    }

    auth
      .me()
      .then((u) => live && setUser(u))
      .catch(() => {
        clearToken();
        if (live) setUser(null);
      });

    return () => {
      live = false;
    };
  }, [loc.pathname]);

  const authPage = ["/login", "/register"].includes(loc.pathname);

  if (user === undefined && !authPage) {
    return (
      <div className="boot">
        <b>
          g<span>.</span>
        </b>
        <p>Opening your field journal…</p>
      </div>
    );
  }

  return (
    <>
      {!authPage && <Navbar user={user} onLogout={() => setUser(null)} />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onAuth={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register onAuth={setUser} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Home user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute user={user}>
              <Quests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests/:id"
          element={
            <ProtectedRoute user={user}>
              <QuestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute user={user}>
              <Progress user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute user={user}>
              <Leaderboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}