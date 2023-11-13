import { toast } from "react-toastify";
import { Manager } from "socket.io-client";
import { VARIABLES } from "../ENV";

export class SocketClient {
  socket;
  refreshData;
  constructor(setConnecting, user_id, authToken, navigate) {
    this.setConnecting = setConnecting;
    this.user_id = user_id;
    this.navigate = navigate;
    this.authToken = authToken;
    this.connectToServer();
  }

  getSocket() {
    return this.socket;
  }

  connectToServer() {
    const manager = new Manager(VARIABLES.API_URL, {
      extraHeaders: {
        user_id: this.user_id,
        "ngrok-skip-browser-warning": true,
        token: this.authToken,
      },
      transports: ["polling"],
    });

    this.setConnecting("connecting");

    this.socket = manager.socket("/");

    this.socket.on("connect", () => this.setConnecting("connected"));

    this.socket.on("disconnect", () => this.setConnecting("disconnected"));

    this.socket.on("reserva-updated", ({ operation, reservaId, userId }) => {
      if (userId === this.user_id) return;

      const urlParams = new URLSearchParams(window.location.search);
      const currentReservaId = urlParams.get("reservaId");

      const onHomeScreen = currentReservaId === null;
      if (onHomeScreen && this.refreshData) return this.refreshData();

      if (!onHomeScreen && String(currentReservaId) === String(reservaId)) {
        if (operation === "UPDATE")
          return toast(
            "Otro usuario actualizó los datos de esta reserva. Recargue esta página si desea trabajar con los datos nuevos.",
            {
              type: "warning",
              autoClose: false,
            }
          );
        else if (operation === "DELETE") {
          return toast(
            "Otro usuario eliminó esta reserva. Redirigiendo a inicio...",
            {
              type: "error",
              onClose: () => {
                this.navigate("/");
              },
            }
          );
        }
      }
    });
  }

  disconnect() {
    this.socket.close();
    this.setConnecting("logout");
    this.setSocket(null);
  }

  async handleResponse(response, resolve, reject) {
    toast.dismiss();

    if (response === "KAI not found") {
      toast(
        "No se encontró el cliente KAI Desktop. Verifique que esté iniciado y recarge esta página.",
        { type: "error", autoClose: false }
      );
      reject(new Error("Cliente KAI Desktop no encontrado"));
    }

    if (response === "error") {
      toast("Ocurrió un error :/. Intente nuevamente.", {
        type: "error",
      });
      reject(new Error("Ocurrió un error al obtener reservas"));
    }

    resolve(response);
  }

  async getReservas(date) {
    return new Promise((resolve, reject) => {
      this.socket.emit("get-reservas", date, (res) =>
        this.handleResponse(res, resolve, reject)
      );
    });
  }

  async getRecursosDisponibles(ingreso, egreso, tipoRecurso) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "get-recursos-disponibles",
        ingreso,
        egreso,
        tipoRecurso,
        (res) => this.handleResponse(res, resolve, reject)
      );
    });
  }

  async saveReserva(payload) {
    return new Promise((resolve, reject) => {
      this.socket.emit("save-reserva", payload, (res) =>
        this.handleResponse(res, resolve, reject)
      );
    });
  }

  async updateReserva(payload) {
    return new Promise((resolve, reject) => {
      this.socket.emit("update-reserva", payload, (res) =>
        this.handleResponse(res, resolve, reject)
      );
    });
  }

  async getReserva(reservaId) {
    return new Promise((resolve, reject) => {
      this.socket.emit("get-reserva", reservaId, (res) =>
        this.handleResponse(res, resolve, reject)
      );
    });
  }

  async deleteReserva(reservaId) {
    return new Promise((resolve, reject) => {
      this.socket.emit("delete-reserva", reservaId, (res) =>
        this.handleResponse(res, resolve, reject)
      );
    });
  }

  async getRecursosDisponiblesConReserva(
    ingreso,
    egreso,
    tipoRecurso,
    reservaId
  ) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "get-recursos-disponibles",
        ingreso,
        egreso,
        tipoRecurso,
        reservaId,
        (res) => this.handleResponse(res, resolve, reject)
      );
    });
  }
}
