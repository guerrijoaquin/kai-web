import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { HomePageStyle } from "../styles/HomePageStyle";
import { SocketClient } from "../services/socket-client";
import { useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { useGeneralContext } from "../context/GeneralContext";

export function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { setConnecting, socketClient, setSocketClient, connecting } =
    useGeneralContext();

  const handleLogout = async () => {
    try {
      socketClient.disconnect();
      setSocketClient(null);
      await logout();
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (user && !socketClient && connecting !== "logout") {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setSocketClient(new SocketClient(setConnecting, user.token, navigate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketClient, setConnecting, setSocketClient, user]);

  if (loading || (!socketClient && user))
    return (
      <div style={HomePageStyle.allSizeCenterChild}>
        <CircularProgress />
      </div>
    );

  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <div style={HomePageStyle.header}>
        <p style={HomePageStyle.email}>{user.email}</p>
        <button
          className="bg-slate-200 hover:bg-slate-300 rounded py-2 px-4 text-black flex items-center"
          onClick={handleLogout}
        >
          <FiLogOut className="w-6 h-6 mr-2" /> SALIR
        </button>
      </div>
      {children}
    </>
  );
}
