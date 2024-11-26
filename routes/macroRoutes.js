const { Router } = require("express");
const Oauth = require("../middlewares/Oauth");
const verifyIngresoToken = require("../middlewares/verifyIngresoToken");
const verifyRole = require("../middlewares/verifyRole");
const {
  obtenerCategorias,
  obtenerTiposDeReclamoPorCategoria,
  listarReclamosCiudadano,
  ingresarReclamo,
  buscarReclamoPorId,
  obtenerTurnosDisponiblesPorDia,
  obtenerTurnosDisponiblesPorHora,
  existeTurno,
  confirmarTurno,
  anularTurno,
  usuarioExistente,
  tipoUsuario,
  guardarImagen,
  existeLoginApp,
  obtenerTokenAutorizacion,
  credencial,
  obtenerDatosCarnetSanidad,
  agregarUsuario,
  registroUsuario,
  validarUsuario,
  restablecerClave,
  editarClave,
} = require("../controllers/macroControllers");

const router = Router();

//------------------------------INGRESO CIUDADANO------------------------------//
router.get("/existeLoginApp/:dni/:password", existeLoginApp); // VERIFICA EXISTENCIA DE USUARIO PARA DAR TOKEN DE INGRESO Y DATOS
router.post(
  "/obtenerTokenAutorizacion",
  verifyIngresoToken,
  obtenerTokenAutorizacion
); //OROTGA EL TOKEN DE AUTORIZACION PARA HACER PETICIONES
router.get("/credencial/", Oauth, credencial); // VERIFICA EXISTENCIA DE USUARIO PARA DAR TOKEN DE INGRESO Y DATOS
router.get("/obtenerDatosCarnetSanidad/", Oauth, obtenerDatosCarnetSanidad); // CARNET DE SANIDAD DE USUARIO DEL CIDITUC
router.post("/altaUsuario", agregarUsuario); // MIGRACION DE USUARIO YA REGISTRADO CON OTRO METODO (NO CIDITUC)
router.post("/registro", registroUsuario); // REGRISTRAR USUARIO Y ENVIAR EMAIL DE VALIDACION
router.put("/validar", validarUsuario); // VALIDAR USUARIO POR CODIGO ENVIADO AL EMAIL
router.put("/restablecerClave", restablecerClave); // RESTABLECER CONTRASEÑA
router.put("/cambiarClave", editarClave); // CAMBIAR CONTRASEÑA
//------------------------------INGRESO CIUDADANO------------------------------//

//------------------------------RECLAMOS CIUDADANO------------------------------//
router.get("/listarCategorias", Oauth, obtenerCategorias);
router.get(
  "/listarTiposDeReclamosPorCategoria",
  Oauth,
  obtenerTiposDeReclamoPorCategoria
);
router.post("/ingresarReclamo", Oauth, ingresarReclamo);
router.post("/pruebaImagen", guardarImagen);

router.get("/listarReclamosCiudadano", Oauth, listarReclamosCiudadano); //REVISADO Y AGREGADO DE ESTADO_TRAMITE
router.get("/buscarReclamoPorId", Oauth, buscarReclamoPorId); //REVISADO Y AGREGADO DE ESTADO_TRAMITE
//------------------------------RECLAMOS CIUDADANO------------------------------//+

//------------------------------TURNOS CIUDADANO------------------------------//
router.get(
  "/buscarTurnosDisponiblesPorDia",
  Oauth,
  obtenerTurnosDisponiblesPorDia
);
router.get(
  "/buscarTurnosDisponiblesPorHora",
  Oauth,
  obtenerTurnosDisponiblesPorHora
);
router.get("/existeTurno", Oauth, existeTurno);
router.get("/confirmarTurno", Oauth, confirmarTurno);
router.get("/anularTurno", Oauth, anularTurno);

router.get("/existe", usuarioExistente); // USUARIO EXISTE EN BD_MUNI POR CUIT Y/O EMAIL
router.get("/tipoUsuario", tipoUsuario); // TIPO DE USUARIO EN BD_MUNI
//------------------------------TURNOS CIUDADANO------------------------------//

module.exports = router;
