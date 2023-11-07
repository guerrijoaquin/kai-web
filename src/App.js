import React from "react";
import { Route, Routes } from "react-router-dom";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { GeneralProvider } from "./context/GeneralContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          </Routes>
        </AuthProvider>
      </GeneralProvider>
    </>
  );
}

export default App;
