import { useAuth } from "../context/AuthContext";
import { connectToServer, disconnect } from "../services/socket-client";
import { useGeneralContext } from "../context/GeneralContext";
import { useEffect, useState } from "react";
import { HomePageStyle } from "../styles/HomePageStyle";
import { FiLogOut } from "react-icons/fi";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  Fab,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import moment from "moment";
import SombrillaIcon from "@mui/icons-material/BeachAccessTwoTone";
import CarpaIcon from "@mui/icons-material/HomeTwoTone";
import { toast } from "react-toastify";

export function Home() {
  const { logout, user } = useAuth();
  const [date, setDate] = useState(new moment());
  const { setConnecting, socket, setSocket, connecting } = useGeneralContext();
  const [reservas, setReservas] = useState(null);

  useEffect(() => {
    if (!socket && connecting !== "logout")
      connectToServer(setConnecting, setSocket, user.uid);
    else if (socket) handleDateChanged(date);
  }, [socket, setConnecting, setSocket, user.uid]);

  const handleLogout = async () => {
    try {
      await disconnect(socket, setSocket, setConnecting);
      await logout();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDateChanged = (date) => {
    setDate(date);
    const dateString = date.format("YYYY-MM-DD");

    socket.timeout(3000).emit("get-reservas", dateString, (err, response) => {
      console.log(response);
      err && console.error(err);
      if (err) return toast("Ocurrió un error :/", { type: "error" });
      else setReservas(response);
    });
  };

  const handleAddReserva = () => {};

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={HomePageStyle.container}>
        <div style={HomePageStyle.header}>
          <p style={HomePageStyle.email}>{user.email}</p>
          <button
            className="bg-slate-200 hover:bg-slate-300 rounded py-2 px-4 text-black flex items-center"
            onClick={handleLogout}
          >
            <FiLogOut className="w-6 h-6 mr-2" /> SALIR
          </button>
        </div>
        <DatePicker
          sx={{ m: 1 }}
          label="Fecha"
          onAccept={handleDateChanged}
          value={date}
          format="DD/MM/YYYY"
        />
        {!reservas ? (
          <div style={HomePageStyle.allContainerSizeCenterChild}>
            <CircularProgress sx={{ marginTop: "20px" }} size={30} />
          </div>
        ) : (
          <>
            <>
              {reservas?.length === 0 ? (
                <p style={{ padding: "10px" }}>No hay reservas en esta fecha</p>
              ) : (
                <>
                  {reservas.map((reserva) => (
                    <List key={reserva.idReserva}>
                      <ListItem>
                        <ListItemIcon>
                          {reserva.recurso.carpa ? (
                            <CarpaIcon />
                          ) : (
                            <SombrillaIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${reserva.recurso.nombreTipoRecurso} ${reserva.recurso.idRecurso}`}
                        />
                      </ListItem>
                      <Divider />
                    </List>
                  ))}
                </>
              )}
            </>
            <Fab
              sx={{ position: "fixed", right: "20px", bottom: "20px" }}
              color="primary"
              aria-label="add"
              onClick={handleAddReserva}
            >
              <AddIcon />
            </Fab>
          </>
        )}
      </div>
    </LocalizationProvider>
  );
}
