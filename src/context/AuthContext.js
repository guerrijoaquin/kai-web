import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { VARIABLES } from "../ENV";

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("There is no Auth provider");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isUserLogged = () => localStorage.getItem("token") != null;

  const logout = () => {
    localStorage.setItem("token", null);
    localStorage.setItem("userId", null);
    localStorage.setItem("email", null);
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await axios.post(VARIABLES.API_URL + "/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("email", data.email);

    setUser({
      email,
      id: data.id,
      token: data.token,
    });
  };

  const getToken = () => localStorage.getItem("token");

  const getUserId = () => localStorage.getItem("userId");

  const getEmail = () => localStorage.getItem("email");

  const getUser = () => ({
    id: getUserId(),
    email: getEmail(),
    token: getToken(),
  });

  useEffect(() => {
    if (isUserLogged()) setUser(getUser());
    setLoading(false);
  }, []);

  return (
    <authContext.Provider
      value={{
        login,
        user,
        logout,
        loading,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
