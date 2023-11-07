import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { HomePageStyle } from "../styles/HomePageStyle";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div style={HomePageStyle.allSizeCenterChild}>
        <CircularProgress />
      </div>
    );

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}
