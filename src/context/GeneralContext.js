import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const generalContext = createContext();

export const useGeneralContext = () => {
  const context = useContext(generalContext);
  return context;
};

export function GeneralProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    toast.dismiss();
    if (connecting === "disconnected")
      toast("Se perdió la conexión. Reconectando...", {
        type: "error",
        progress: true,
        closeButton: false,
        closeOnClick: false,
        isLoading: true,
        toastId: "server_status_disconnected",
      });
    else if (connecting === "connected")
      toast("Conectado al servidor!", {
        type: "success",
        toastId: "server_status_connected",
      });
    else if (connecting === "connecting")
      toast("Conectando al servidor...", {
        progress: true,
        closeButton: false,
        closeOnClick: false,
        isLoading: true,
        toastId: "server_status_null",
      });
  }, [connecting]);

  return (
    <generalContext.Provider
      value={{
        loading,
        setLoading,
        connecting,
        setConnecting,
        socket,
        setSocket,
      }}
    >
      {children}
    </generalContext.Provider>
  );
}
