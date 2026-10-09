import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute({ user, children }) {
  const loc = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  if (user === undefined) {
    return (
      <div className="loading">
        <span className="spinner" />
        Opening your field journal…
      </div>
    );
  }

  return children;
}