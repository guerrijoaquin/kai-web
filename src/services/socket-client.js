import { Manager } from "socket.io-client";

export const connectToServer = (setConnecting, setSocket, user_id) => {
  const manager = new Manager("ws://localhost:5000/", {
    extraHeaders: {
      user_id,
    },
  });

  setConnecting("connecting");

  const socket = manager.socket("/");

  socket.on("connect", () => setConnecting("connected"));

  socket.on("disconnect", () => setConnecting("disconnected"));

  socket.on("reserva-updated", (arg) => {
    console.log("recibida actualización");
    console.log(arg);
  });

  setSocket(socket);
};

export const disconnect = (socket, setSocket, setConnecting) => {
  socket.close();
  setConnecting("logout");
  setSocket(null);
};
