import { useGeneralContext } from "../context/GeneralContext";
import { useEffect, useState } from "react";
import { Theme, useTheme } from "@mui/material/styles";
import { HomePageStyle } from "../styles/HomePageStyle";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  TextField,
  Divider,
  InputAdornment,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Chip,
  FormLabel,
  InputLabel,
  Select,
  DialogActions,
  Dialog,
  DialogContentText,
  DialogContent,
  DialogTitle,
  MenuItem,
  RadioGroup,
  OutlinedInput,
  IconButton,
  Box,
  CircularProgress,
  Radio,
  Paper,
  Button,
} from "@mui/material";
import moment from "moment";
import SombrillaIcon from "@mui/icons-material/BeachAccessTwoTone";
import PersonIcon from "@mui/icons-material/Person";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import GarageIcon from "@mui/icons-material/Garage";
import AccountCircle from "@mui/icons-material/AccountCircle";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import CarpaIcon from "@mui/icons-material/HomeTwoTone";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { DeleteRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import { ReservaRapidaStyle } from "../styles/ReservaRapidaStyle";
import {
  AttachMoneyRounded,
  MonetizationOn,
  PriceChange,
  PriceCheck,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function getStyles(cochera, cocheras, theme) {
  return {
    fontWeight:
      cocheras.indexOf(cochera) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const initData = {
  pago: {
    fecha: moment().format("DD/MM/YYYY"),
    cantidad: null,
    metodo: null,
  },
  precioTrigger: {
    recurso: "dia",
    cocheras: "dia",
  },
  errors: {
    general: {},
    cocheras: {},
    pago: {},
  },
  data: {
    cocheras: {
      numeros: [],
    },
    idRecursosDisponibles: [],
  },
  momentFechas: {
    ingreso: moment(),
    egreso: moment(),
  },
};

export function ReservaRapida() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { socketClient } = useGeneralContext();
  const [dialogPagoOpen, setDialogPagoOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardable, setGuardable] = useState(true);
  const [pagoActual, setPagoActual] = useState({ ...initData.pago });
  const [preciosTriggers, setPreciosTriggers] = useState({
    ...initData.precioTrigger,
  });
  const [data, setData] = useState({ ...initData.data });
  const [momentFechas, setMomentFechas] = useState({
    ...initData.momentFechas,
  });
  const [errors, setErrors] = useState({
    general: {},
    cocheras: {},
    pago: {},
  });

  const [nombre, setNombre] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [cantPersonas, setCantPersonas] = useState("");
  const [fechaEgreso, setFechaEgreso] = useState(moment().format("YYYY-MM-DD"));
  const [fechaIngreso, setFechaIngreso] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [idRecurso, setIdRecurso] = useState(null);
  const [tipoRecurso, setTipoRecurso] = useState("carpa");
  const [comentario, setComentario] = useState("");
  const [recursoPrecioPorDia, setRecursoPrecioPorDia] = useState("");
  const [recursoPrecioTotal, setRecursoPrecioTotal] = useState("");
  const [cocherasNumeros, setCocherasNumeros] = useState([]);
  const [cocherasPrecioPorDia, setCocherasPrecioPorDia] = useState("");
  const [cocherasPrecioTotal, setCocherasPrecioTotal] = useState("");
  const [pagos, setPagos] = useState([]);

  useEffect(
    () => updateRecursosDisponibles(fechaIngreso, fechaEgreso, tipoRecurso),
    []
  );

  const agruparDatos = () => ({
    general: {
      nombre,
      localidad,
      telefono,
      mail,
      cantPersonas,
      fechaIngreso,
      fechaEgreso,
      idRecurso,
      tipoRecurso,
      comentario,
      precioPorDia: recursoPrecioPorDia,
      precioTotal: recursoPrecioTotal,
    },
    cocheras: {
      numeros: cocherasNumeros,
      precioPorDia: cocherasPrecioPorDia,
      precioTotal: cocherasPrecioTotal,
    },
    pagos,
  });

  const updateRecursosDisponibles = async (ingreso, egreso, tipoRecurso) => {
    toast("Cargando recursos disponibles...", {
      progress: true,
      closeButton: false,
      closeOnClick: false,
      isLoading: true,
      toastId: "loading",
    });

    const response = JSON.parse(
      await socketClient.getRecursosDisponibles(ingreso, egreso, tipoRecurso)
    );

    const idRecursosDisponibles = response.recursos;
    const cocherasNumerosDisponibles = response.cocheras.map((x) => x.nombre);
    const cocherasSelected = getIncludesIn(
      cocherasNumeros,
      cocherasNumerosDisponibles
    );

    setData((old) => ({
      ...old,
      idRecursosDisponibles,
      cocheras: {
        ...old.cocheras,
        numeros: cocherasNumerosDisponibles,
      },
    }));

    const precios = getUpdatedPrecios(
      getDaysBetweenIncludes(ingreso, egreso),
      cocherasSelected.length
    );

    setIdRecurso(idRecursosDisponibles.includes(idRecurso) ? idRecurso : null);
    setRecursoPrecioPorDia(precios.recurso.precioPorDia);
    setRecursoPrecioTotal(precios.recurso.precioTotal);
    setTipoRecurso(tipoRecurso);
    setFechaIngreso(moment(ingreso).format("YYYY-MM-DD"));
    setFechaEgreso(moment(egreso).format("YYYY-MM-DD"));
    setCocherasNumeros(cocherasSelected);
    setCocherasPrecioPorDia(
      cocherasSelected.length > 0 ? precios.cocheras.precioPorDia : 0
    );
    setCocherasPrecioTotal(
      cocherasSelected.length > 0 ? precios.cocheras.precioTotal : 0
    );

    if (idRecursosDisponibles.length === 0) {
      setGuardable(false);
      return toast(
        "El recurso de la reserva está ocupado por otra reserva en la fecha seleccionada. Por favor, seleccione otra fecha.",
        {
          type: "error",
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          draggable: false,
        }
      );
    } else setGuardable(true);
  };

  const getIncludesIn = (target, array) => {
    const includes = [];
    target.forEach((x) => {
      if (array.includes(x)) includes.push(x);
    });
    return includes;
  };

  const getUpdatedPrecios = (cantidadDias, cantidadCocheras) => {
    const preciosRecurso =
      preciosTriggers.recurso === "dia"
        ? getPreciosDesdeDia(
            recursoPrecioPorDia,
            recursoPrecioTotal,
            cantidadDias
          )
        : getPreciosDesdeTotal(
            recursoPrecioPorDia,
            recursoPrecioTotal,
            cantidadDias
          );

    const preciosCocheras =
      preciosTriggers.cocheras === "dia"
        ? getPreciosCocheraDesdeDia(
            cocherasPrecioPorDia,
            cocherasPrecioTotal,
            cantidadDias,
            cantidadCocheras
          )
        : getPreciosCocheraDesdeTotal(
            cocherasPrecioPorDia,
            cocherasPrecioTotal,
            cantidadDias,
            cantidadCocheras
          );

    return {
      recurso: preciosRecurso,
      cocheras: preciosCocheras,
    };
  };

  const formatNumber = (number) => parseFloat(number.toFixed(2)).toString();

  const getPreciosDesdeTotal = (precioPorDia, precioTotal, cantidadDias) => {
    const cantidadDeDias = cantidadDias || getCantidadDiasReserva();
    precioPorDia =
      precioPorDia && toString(precioPorDia).length > 0
        ? Number(precioPorDia)
        : 0;
    precioTotal =
      precioTotal && toString(precioTotal).length > 0 ? Number(precioTotal) : 0;

    return {
      precioPorDia: formatNumber(precioTotal / cantidadDeDias),
      precioTotal: formatNumber(precioTotal),
    };
  };

  const getPreciosDesdeDia = (precioPorDia, precioTotal, cantidadDias) => {
    const cantidadDeDias = cantidadDias || getCantidadDiasReserva();
    precioPorDia =
      precioPorDia && toString(precioPorDia).length > 0
        ? Number(precioPorDia)
        : 0;
    precioTotal =
      precioTotal && toString(precioTotal).length > 0 ? Number(precioTotal) : 0;

    return {
      precioPorDia: formatNumber(precioPorDia),
      precioTotal: formatNumber(precioPorDia * cantidadDeDias),
    };
  };

  const getPreciosCocheraDesdeTotal = (
    precioPorDia,
    precioTotal,
    cantidadDias,
    cantidadCocheras
  ) => {
    const cantidadDeDias = cantidadDias || getCantidadDiasReserva();
    const cantidadDeCocheras = cantidadCocheras || cocherasNumeros.length;
    precioPorDia =
      precioPorDia && toString(precioPorDia).length > 0
        ? Number(precioPorDia)
        : 0;
    precioTotal =
      precioTotal && toString(precioTotal).length > 0 ? Number(precioTotal) : 0;

    return {
      precioPorDia: formatNumber(
        precioTotal / (cantidadDeDias * cantidadDeCocheras)
      ),
      precioTotal: formatNumber(precioTotal),
    };
  };

  const getPreciosCocheraDesdeDia = (
    precioPorDia,
    precioTotal,
    cantidadDias,
    cantidadCocheras
  ) => {
    const cantidadDeDias = cantidadDias || getCantidadDiasReserva();
    const cantidadDeCocheras = cantidadCocheras || cocherasNumeros.length;
    precioPorDia =
      precioPorDia && toString(precioPorDia).length > 0
        ? Number(precioPorDia)
        : 0;
    precioTotal =
      precioTotal && toString(precioTotal).length > 0 ? Number(precioTotal) : 0;

    return {
      precioPorDia: formatNumber(precioPorDia),
      precioTotal: formatNumber(
        precioPorDia * cantidadDeDias * cantidadDeCocheras
      ),
    };
  };

  const getCantidadDiasReserva = () =>
    getDaysBetweenIncludes(fechaIngreso, fechaEgreso);

  const getDaysBetweenIncludes = (start, end) => {
    start = moment(start);
    end = moment(end);
    return end.diff(start, "days") + 1;
  };

  const searchErrors = () => {
    const errorsFound = { general: {}, cocheras: {}, pago: {} };

    const hayRecursoPrecioDia =
      Boolean(recursoPrecioPorDia) && recursoPrecioPorDia !== "0";

    const hayCocheraPrecioDia =
      Boolean(cocherasPrecioPorDia) && cocherasPrecioPorDia !== "0";

    if (!nombre || nombre.length === 0) errorsFound.general.nombre = true;

    if (!idRecurso) errorsFound.general.idRecurso = true;
    if (!hayRecursoPrecioDia) {
      errorsFound.general.precioPorDia = true;
      errorsFound.general.precioTotal = true;
    } else {
      delete errorsFound.general.precioPorDia;
      delete errorsFound.general.precioTotal;
    }

    if (cocherasNumeros.length > 0) {
      if (!hayCocheraPrecioDia) {
        errorsFound.cocheras.precioPorDia = true;
        errorsFound.cocheras.precioTotal = true;
      } else {
        delete errorsFound.cocheras.precioPorDia;
        delete errorsFound.cocheras.precioTotal;
      }
    } else if (hayCocheraPrecioDia) {
      errorsFound.cocheras.numeros = true;
    }

    return errorsFound;
  };

  const handleSaveReserva = () => {
    setErrors(initData.errors);

    const errorsFound = searchErrors();

    if (
      Object.keys(errorsFound.general).length !== 0 ||
      Object.keys(errorsFound.cocheras).length !== 0
    ) {
      toast("El formulario contiene errores.", { type: "error" });
      return setErrors(errorsFound);
    }

    confirmSaveReserva();
  };

  const confirmSaveReserva = async () => {
    setGuardando(true);

    const payload = replaceNull(agruparDatos());

    await socketClient.saveReserva(payload);

    resetForm();

    toast("Reserva actualizada!", { type: "success" });
    navigate(-1);
  };

  const resetForm = () => {
    setGuardando(false);
    setPreciosTriggers({ ...initData.precioTrigger });
    setErrors({ general: {}, cocheras: {}, pago: {} });
    setData({ ...initData.data });
    setPagoActual({ ...initData.pago });

    setNombre("");
    setLocalidad("");
    setTelefono("");
    setMail("");
    setCantPersonas("");
    setFechaEgreso("");
    setFechaIngreso("");
    setIdRecurso(null);
    setTipoRecurso("");
    setComentario("");
    setRecursoPrecioPorDia("");
    setRecursoPrecioTotal("");
    setCocherasNumeros([]);
    setCocherasPrecioPorDia("");
    setCocherasPrecioTotal("");
    setPagos([]);
  };

  const replaceNull = (obj) => {
    for (var key in obj) {
      if (!obj[key] || obj[key] === "") {
        const remplazeByZero = ["cantPersonas", "precioPorDia", "precioTotal"];
        obj[key] = remplazeByZero.includes(key) ? "0" : "";
      } else if (typeof obj[key] === "object") {
        replaceNull(obj[key]);
      }
    }
    return obj;
  };

  useEffect(() => {
    setMomentFechas({
      ingreso: moment(fechaIngreso),
      egreso: moment(fechaEgreso),
    });
  }, [fechaIngreso, fechaEgreso]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={{ ...HomePageStyle.container, paddingBottom: "80px" }}>
        <Accordion>
          <AccordionSummary expandIcon={<PersonIcon />}>
            <Typography fontWeight={700}>General</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper
              elevation={8}
              sx={{ ...HomePageStyle.allContainerSizeCenterChild, mt: 2 }}
            >
              <Typography sx={ReservaRapidaStyle.padding10}>
                Datos reserva
              </Typography>
              <div style={ReservaRapidaStyle.formContainer}>
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="nombre"
                  error={errors.general.nombre}
                  label="Nombre Completo"
                  required
                  value={nombre}
                  onChange={({ target: { value } }) => setNombre(value)}
                  variant="outlined"
                  InputProps={{ startAdornment: <AccountCircle /> }}
                />
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="localidad"
                  value={localidad}
                  onChange={({ target: { value } }) => setLocalidad(value)}
                  label="Localidad"
                  variant="outlined"
                  InputProps={{ startAdornment: <FmdGoodIcon /> }}
                />
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="telefono"
                  label="Teléfono"
                  variant="outlined"
                  value={telefono}
                  onChange={({ target: { value } }) => setTelefono(value)}
                  type="number"
                  onWheel={() => document.activeElement.blur()}
                  InputProps={{ startAdornment: <LocalPhoneIcon /> }}
                />
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="mail"
                  label="Mail"
                  value={mail}
                  onChange={({ target: { value } }) => setMail(value)}
                  variant="outlined"
                  type="email"
                  InputProps={{ startAdornment: <EmailIcon /> }}
                />
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="cantPersonas"
                  label="Cantidad de personas"
                  variant="outlined"
                  type="number"
                  value={cantPersonas}
                  onChange={({ target: { value } }) => setCantPersonas(value)}
                  onWheel={() => document.activeElement.blur()}
                  InputProps={{ startAdornment: <Diversity3Icon /> }}
                />
                <DatePicker
                  sx={ReservaRapidaStyle.textField}
                  label="Ingreso"
                  maxDate={momentFechas.egreso}
                  error={errors.general.fechaIngreso}
                  onChange={(value) => {
                    updateRecursosDisponibles(
                      value.format("YYYY-MM-DD"),
                      fechaEgreso,
                      tipoRecurso
                    );
                  }}
                  value={momentFechas.ingreso}
                  format="DD/MM/YYYY"
                />
                <DatePicker
                  sx={ReservaRapidaStyle.textField}
                  label="Egreso"
                  minDate={momentFechas.ingreso}
                  error={errors.general.fechaEgreso}
                  onChange={(value) => {
                    updateRecursosDisponibles(
                      fechaIngreso,
                      value.format("YYYY-MM-DD"),
                      tipoRecurso
                    );
                  }}
                  value={momentFechas.egreso}
                  format="DD/MM/YYYY"
                />
                <RadioGroup
                  sx={ReservaRapidaStyle.radioGroup}
                  row
                  onChange={(e) => {
                    updateRecursosDisponibles(
                      fechaIngreso,
                      fechaEgreso,
                      e.target.value
                    );
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CarpaIcon />
                    <Radio
                      id="tipoRecurso"
                      value="carpa"
                      checked={tipoRecurso === "carpa"}
                    />
                    <Typography>Carpa</Typography>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SombrillaIcon />
                    <Radio
                      id="tipoRecurso"
                      value="sombrilla"
                      checked={tipoRecurso === "sombrilla"}
                    />
                    <Typography>Sombrilla</Typography>
                  </div>
                </RadioGroup>
                <FormControl sx={ReservaRapidaStyle.textField}>
                  <InputLabel id="numeroRecurso">
                    Número de {tipoRecurso}
                  </InputLabel>
                  <Select
                    labelId="numeroRecurso"
                    label={`Número de ${tipoRecurso}`}
                    name="idRecurso"
                    error={errors.general.idRecurso}
                    value={idRecurso || ""}
                    onChange={({ target: { value } }) => setIdRecurso(value)}
                  >
                    {data.idRecursosDisponibles.map((id) => (
                      <MenuItem value={id} key={id}>
                        {id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="comentario"
                  label="Otros Comentarios..."
                  variant="filled"
                  minRows={3}
                  multiline
                  value={comentario}
                  onChange={({ target: { value } }) => setComentario(value)}
                  InputProps={{ startAdornment: <AddCommentIcon /> }}
                />
              </div>
            </Paper>

            <Paper
              elevation={8}
              sx={{ ...HomePageStyle.allContainerSizeCenterChild, mt: 2 }}
            >
              <Typography sx={{ padding: "40px 10px 10px 10px" }}>
                Precio de {tipoRecurso}
              </Typography>
              <div style={ReservaRapidaStyle.formContainer}>
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="precioPorDia"
                  label="Precio por día"
                  variant="outlined"
                  type="number"
                  onWheel={() => document.activeElement.blur()}
                  value={recursoPrecioPorDia || ""}
                  error={errors.general.precioPorDia}
                  onChange={({ target: { value } }) => {
                    const { precioPorDia, precioTotal } = getPreciosDesdeDia(
                      value,
                      recursoPrecioTotal
                    );
                    setRecursoPrecioPorDia(precioPorDia);
                    setRecursoPrecioTotal(precioTotal);
                    setPreciosTriggers((old) => ({ ...old, recurso: "dia" }));
                  }}
                  InputProps={{ startAdornment: <AttachMoneyRounded /> }}
                />
                <TextField
                  sx={ReservaRapidaStyle.textField}
                  id="precioTotal"
                  label="Precio total"
                  variant="outlined"
                  value={recursoPrecioTotal || ""}
                  type="number"
                  onWheel={() => document.activeElement.blur()}
                  error={errors.general.precioTotal}
                  onChange={({ target: { value } }) => {
                    const { precioPorDia, precioTotal } = getPreciosDesdeTotal(
                      recursoPrecioPorDia,
                      value
                    );
                    setRecursoPrecioPorDia(precioPorDia);
                    setRecursoPrecioTotal(precioTotal);
                    setPreciosTriggers((old) => ({ ...old, recurso: "total" }));
                  }}
                  InputProps={{ startAdornment: <MonetizationOn /> }}
                />
              </div>
            </Paper>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<GarageIcon />}>
            <Typography fontWeight={700}>Cocheras</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl sx={ReservaRapidaStyle.selectMultiple}>
              <InputLabel>Cocheras Disponibles</InputLabel>
              <Select
                multiple
                value={cocherasNumeros}
                onChange={(event) => {
                  const {
                    target: { value },
                  } = event;
                  const numeros =
                    typeof value === "string" ? value.split(",") : value;

                  const precios =
                    preciosTriggers.cocheras === "dia"
                      ? getPreciosCocheraDesdeDia(
                          cocherasPrecioPorDia,
                          cocherasPrecioTotal,
                          null,
                          numeros.length
                        )
                      : getPreciosCocheraDesdeTotal(
                          cocherasPrecioPorDia,
                          cocherasPrecioTotal,
                          null,
                          numeros.length
                        );

                  setCocherasNumeros(numeros);
                  setCocherasPrecioPorDia(precios.precioPorDia);
                  setCocherasPrecioTotal(precios.precioTotal);
                }}
                error={errors.cocheras.numeros}
                input={<OutlinedInput label="Cocheras Disponibles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5 + 8,
                      width: 250,
                    },
                  },
                }}
              >
                {data.cocheras.numeros.map((cochera) => (
                  <MenuItem
                    key={cochera}
                    value={cochera}
                    style={getStyles(cochera, cocherasNumeros, theme)}
                  >
                    {cochera}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              sx={ReservaRapidaStyle.textField}
              id="precioPorDia"
              label={`Precio x día x c/cochera`}
              variant="outlined"
              type="number"
              onWheel={() => document.activeElement.blur()}
              value={
                !cocherasPrecioPorDia || String(cocherasPrecioPorDia) === "0"
                  ? ""
                  : cocherasPrecioPorDia
              }
              error={errors.cocheras.precioPorDia}
              onChange={({ target: { value } }) => {
                const { precioPorDia, precioTotal } = getPreciosCocheraDesdeDia(
                  value,
                  cocherasPrecioTotal
                );
                setCocherasPrecioPorDia(precioPorDia);
                setCocherasPrecioTotal(precioTotal);
                setPreciosTriggers((old) => ({ ...old, cocheras: "dia" }));
              }}
              InputProps={{ startAdornment: <AttachMoneyRounded /> }}
            />
            <TextField
              sx={ReservaRapidaStyle.textField}
              id="precioTotal"
              label="Precio total cocheras"
              variant="outlined"
              type="number"
              onWheel={() => document.activeElement.blur()}
              value={
                !cocherasPrecioTotal || String(cocherasPrecioTotal) === "0"
                  ? ""
                  : cocherasPrecioTotal
              }
              error={errors.cocheras.precioTotal}
              onChange={({ target: { value } }) => {
                const { precioPorDia, precioTotal } =
                  getPreciosCocheraDesdeTotal(cocherasPrecioPorDia, value);
                setCocherasPrecioPorDia(precioPorDia);
                setCocherasPrecioTotal(precioTotal);
                setPreciosTriggers((old) => ({ ...old, cocheras: "total" }));
              }}
              InputProps={{ startAdornment: <MonetizationOn /> }}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<PointOfSaleIcon />}>
            <Typography fontWeight={700}>Pagos</Typography>
          </AccordionSummary>
          <AccordionDetails sx={HomePageStyle.container}>
            {pagos.map((pago, i) => {
              return (
                <Paper
                  key={i}
                  sx={{ m: 1, width: "fit-content", p: 1 }}
                  elevation={5}
                >
                  ${pago.cantidad} / {moment(pago.fecha).format("DD-MM-YYYY")} /{" "}
                  {pago.metodo}
                  <IconButton
                    aria-label="Borrar pago"
                    color="error"
                    onClick={() => {
                      setPagos((old) => ({
                        pagos: old.filter((x, index) => index !== i),
                      }));
                    }}
                  >
                    <DeleteRounded />
                  </IconButton>
                </Paper>
              );
            })}
            <Button
              variant="contained"
              sx={{ ...ReservaRapidaStyle.textField, fontWeight: 600 }}
              startIcon={<PriceCheck />}
              onClick={() => setDialogPagoOpen(true)}
            >
              Agregar Pago
            </Button>
            <Dialog
              open={dialogPagoOpen}
              onClose={() => setDialogPagoOpen(false)}
            >
              <DialogTitle>Agregar Pago</DialogTitle>
              <DialogContent>
                <TextField
                  sx={ReservaRapidaStyle.smallTextField}
                  label="Cantidad"
                  variant="outlined"
                  onWheel={() => document.activeElement.blur()}
                  type="number"
                  onChange={({ target: { value } }) => {
                    setPagoActual((old) => ({
                      ...old,
                      cantidad: value,
                    }));
                  }}
                  error={errors?.pago?.cantidad}
                  InputProps={{ startAdornment: <PriceChange /> }}
                />
                <DatePicker
                  sx={ReservaRapidaStyle.smallTextField}
                  label="Fecha de pago"
                  onAccept={(date) =>
                    setPagoActual((old) => ({
                      ...old,
                      fecha: date.format("DD/MM/YYYY"),
                    }))
                  }
                  defaultValue={moment()}
                  format="DD/MM/YYYY"
                />

                <FormControl sx={ReservaRapidaStyle.smallTextField}>
                  <InputLabel>Forma de Pago</InputLabel>
                  <Select
                    error={errors?.pago?.metodo}
                    value={pagoActual?.metodo || ""}
                    label="Número"
                    onChange={({ target: { value } }) => {
                      setPagoActual((old) => ({
                        ...old,
                        metodo: value,
                      }));
                    }}
                  >
                    <MenuItem value={"Efectivo"}>Efectivo</MenuItem>
                    <MenuItem value={"Débito"}>Débito</MenuItem>
                    <MenuItem value={"Crédito"}>Crédito</MenuItem>
                    <MenuItem value={"Mercado Pago"}>Mercado Pago</MenuItem>
                    <MenuItem value={"Depósito Bancario"}>
                      Depósito Bancario
                    </MenuItem>
                    <MenuItem value={"Dólares"}>Dólares</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setDialogPagoOpen(false);
                    setPagoActual(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const { cantidad, metodo, fecha } = pagoActual;

                    if (
                      !metodo ||
                      metodo.length === 0 ||
                      !cantidad ||
                      cantidad === 0
                    ) {
                      const pagoError = {};
                      if (!metodo || metodo.length === 0)
                        pagoError.metodo = true;
                      if (!cantidad || cantidad === 0)
                        pagoError.cantidad = true;

                      return setErrors((old) => ({
                        ...old,
                        pago: pagoError,
                      }));
                    }
                    setErrors((old) => ({
                      ...old,
                      pago: null,
                    }));
                    setPagos((old) => [
                      ...old,
                      {
                        fecha: moment(fecha).format("YYYY-MM-DD"),
                        cantidad,
                        metodo,
                      },
                    ]);
                    setPagoActual(initData.pago);
                    setDialogPagoOpen(false);
                  }}
                >
                  Agregar
                </Button>
              </DialogActions>
            </Dialog>
          </AccordionDetails>
        </Accordion>
      </div>
      <div style={ReservaRapidaStyle.footer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <MonetizationOn scale={4} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontSize: 10 }}>Precio Total:</Typography>
            <Typography>
              <strong>
                {(Number(recursoPrecioTotal) || 0) +
                  (Number(cocherasPrecioTotal) || 0)}
              </strong>
            </Typography>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <AttachMoneyRounded scale={4} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontSize: 10 }}>Deuda:</Typography>
            <Typography>
              <strong>
                {(Number(recursoPrecioTotal) || 0) +
                  (Number(cocherasPrecioTotal) || 0) -
                  pagos.reduce(
                    (acc, current) => acc + Number(current.cantidad),
                    0
                  )}
              </strong>
            </Typography>
          </div>
        </div>
        <div>
          {guardando ? (
            <CircularProgress size={30} sx={{ mr: 2 }} color="success" />
          ) : (
            <>
              <Button
                sx={{ m: 1 }}
                color="info"
                onClick={() => {
                  resetForm();
                  navigate(-1);
                }}
              >
                cancelar
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ m: 1 }}
                onClick={handleSaveReserva}
                disabled={!guardable}
              >
                GUARDAR CAMBIOS
              </Button>
            </>
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
}
