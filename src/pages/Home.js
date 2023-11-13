import { useGeneralContext } from "../context/GeneralContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomePageStyle } from "../styles/HomePageStyle";
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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import moment from "moment";
import SombrillaIcon from "@mui/icons-material/BeachAccessTwoTone";
import CarpaIcon from "@mui/icons-material/HomeTwoTone";
import { toast } from "react-toastify";
import { ReservaRapidaStyle } from "../styles/ReservaRapidaStyle";
import { EditRounded } from "@mui/icons-material";

export function Home() {
  const [savedDate, setSavedDate] = useState(new moment());
  const { socketClient } = useGeneralContext();
  const [reservas, setReservas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    handleDateChanged(savedDate);
    socketClient.refreshData = handleDateChanged;
  }, []);

  const handleDateChanged = async (date) => {
    if (!date) date = savedDate;
    else setSavedDate(date);

    const dateString = date.format("YYYY-MM-DD");

    const response = await socketClient.getReservas(dateString);

    setReservas(response);
  };

  const handleAddReserva = () => navigate("/reservaRapida");

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={HomePageStyle.container}>
        <DatePicker
          sx={{ m: 1 }}
          label="Fecha"
          onChange={handleDateChanged}
          value={savedDate}
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
                <List>
                  {reservas.map((reserva) => (
                    <div
                      key={reserva.idReserva}
                      style={ReservaRapidaStyle.textField}
                    >
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
                        <IconButton
                          aria-label="Editar reserva"
                          onClick={() => {
                            navigate(
                              `/updateReserva?reservaId=${reserva.idReserva}`,
                              {
                                state: { reservaId: reserva.idReserva },
                              }
                            );
                          }}
                        >
                          <EditRounded />
                        </IconButton>
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
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
