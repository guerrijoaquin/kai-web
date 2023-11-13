import React from "react";
import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { GeneralProvider } from "./context/GeneralContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReservaRapida } from "./pages/ReservaRapida";
import { UpdateReserva } from "./pages/UpdateReserva";

function App() {
  return (
    <>
      <ToastContainer
        autoClose={3000}
        newestOnTop={true}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
      />
      <GeneralProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservaRapida"
              element={
                <ProtectedRoute>
                  <ReservaRapida />
                </ProtectedRoute>
              }
            />
            <Route
              path="/updateReserva"
              element={
                <ProtectedRoute>
                  <UpdateReserva />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </GeneralProvider>
    </>
  );
}

export default App;
