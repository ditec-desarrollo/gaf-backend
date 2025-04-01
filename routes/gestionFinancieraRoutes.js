const { Router } = require("express");
const auth = require("../middlewares/auth");
const verifyRole = require("../middlewares/verifyRole");

const multer = require('multer');
const path = require('path');

const { 
    listarAnexos, 
    agregarAnexo, 
    editarAnexo, 
    borrarAnexo, 
    listarFinalidades, 
    agregarFinalidad, 
    editarFinalidad, 
    borrarFinalidad, 
    listarFunciones, 
    agregarFuncion, 
    editarFuncion, 
    borrarFuncion, 
    listarItems, 
    agregarItem, 
    editarItem, 
    borrarItem, 
    listarPartidas, 
    agregarPartida, 
    editarPartida, 
    borrarPartida, 
    agregarEjercicio, 
    editarEjercicio, 
    borrarEjercicio, 
    listarTiposDeMovimientos, 
    listarOrganismos, 
    agregarExpediente, 
    listarPartidasConCodigo, 
    obtenerDetPresupuestoPorItemYpartida, 
    agregarMovimiento, 
    listarPartidasCONCAT, 
    partidaExistente, 
    buscarExpediente, 
    listarAnteproyecto, 
    actualizarPresupuestoAnteproyecto, 
    listarEjercicio, 
    actualizarCredito, 
    actualizarPresupuestoAprobado, 
    modificarMovimiento, 
    obtenerPartidasPorItemYMovimiento, 
    editarDetalleMovimiento, 
    acumular, 
    buscarExpedienteParaModificarDefinitiva, 
    agregarMovimientoDefinitivaPreventiva, 
    obtenerPresupuestosParaMovimientoPresupuestario, 
    listarItemsFiltrado, 
    obtenerPerfilPorCuil, 
    actualizarCreditoCompleto, 
    actualizarPresupuestoAprobadoCompleto, 
    obtenerTiposDeInstrumentos, 
    obtenerSaldoPorDetPresupuestoID, 
    obtenerProveedores, 
    editarProveedor, 
    agregarProveedor, 
    eliminarProveedor, 
    obtenerRubros, 
    agregarRubro, 
    crearEstructuraItem, 
    listarItemsSinPartidas, 
    obtenerProveedor, 
    agregarMovimientoPorTransferenciaDePartidas, 
    modificarMovimientoParaTransferenciaEntrePartidas, 
    buscarExpedienteParaModificarPorTransferenciaEntrePartidas, 
    eliminarNomenclador,
    agregarNomenclador,
    editarNomenclador,
    obtenerNomencladores,
    listarPartidasConCodigoGasto,
    buscarExpedienteParaModificarNomenclador,
    obtenerEncuadres,
    obtenerEncuadresLegales,
    editarEncuadreLegal,
    agregarEncuadreLegal,
    eliminarEncuadreLegal,
    
    obtenerTiposDeCompras,
    obtenerDatosItem,
    obtenerMovimientoReserva,
    obtenerMovimientoCompromiso,
    registroCompromisoAlta,
    obtenerArchivo,
    modificarAltaDeCompromiso,
    modificarDefinitiva,
    obtenerLibramiento,
    buscarProveedorPorCuit,
    registroCompromisoAltaSinArchivo,
    agregarMovimientoCompromiso,
    agregarMovimientoDefinitivaPreventivaSinArchivo,
    chequearSiElExpedienteExisteAntesDeIniciarUnaReservaNueva,
    obtenerNomencladoresPorPartida,
    transferirEstructuraItem,
  } = require("../controllers/gestionFinancieraControllers");
const { listarTipoUsuario, listarUsuarios, listarProcesos, listarOpciones, agregarTipoUsuario, editarTipoUsuario, eliminarTipoUsuario, listarPermisosTU, actualizarPermisosTU, agregarUsuario, verificarEmpleado, listarPermisosU, actualizarPermisosU, agregarProceso, deshabilitarProceso, editarProceso, cambiarTipoUsuario } = require("../controllers/gafAdmin");

const router = Router();

//YA corregido con LOG
router.get("/anexo/listar",auth,  listarAnexos);
router.post("/anexo/alta",auth,  agregarAnexo)
router.put("/anexo/editar/:id",auth, editarAnexo)
router.delete("/anexo/borrar",auth,  borrarAnexo)

//YA corregido con LOG
router.get("/funcion/listar",auth,  listarFunciones);
router.post("/funcion/alta",auth,  agregarFuncion)
router.put("/funcion/editar/:id",auth, editarFuncion)
router.delete("/funcion/borrar",auth,  borrarFuncion)

//YA corregido con LOG
router.get("/finalidad/listar",auth,  listarFinalidades);
router.post("/finalidad/alta",auth, agregarFinalidad)
router.put("/finalidad/editar/:id",auth,editarFinalidad)
router.delete("/finalidad/borrar",auth, borrarFinalidad)

//YA corregido con LOG
router.get("/ejercicio/listar",auth,  listarEjercicio);
router.post("/ejercicio/alta",auth,  agregarEjercicio)
router.put("/ejercicio/editar/:id",auth, editarEjercicio)
router.delete("/ejercicio/borrar",auth,  borrarEjercicio)

//YA corregido con LOG
router.get("/item/listar",auth,  listarItems);
router.get("/item/listarSinPartidas/:presupuesto_id",auth,  listarItemsSinPartidas);
router.post("/item/listar/:cuil",auth,  listarItemsFiltrado);
router.post("/item/alta",auth,  agregarItem) //YA corregido con LOG
router.put("/item/editar/:id",auth, editarItem) //YA corregido con LOG
router.delete("/item/borrar",auth,  borrarItem) //YA corregido con LOG

//YA corregido con LOG
router.get("/partida/obtenerPartidasPorItemYMovimiento",auth, obtenerPartidasPorItemYMovimiento)
router.get("/partida/listar",auth,  listarPartidas);
router.get("/partida/listarConCodigo",auth,  listarPartidasConCodigo);
router.get("/partida/listarConCodigoGasto",auth,  listarPartidasConCodigoGasto);
router.get("/partida/listar/concat",auth,  listarPartidasCONCAT);
router.post("/partida/existente",auth,  partidaExistente);
router.post("/partida/alta",auth,  agregarPartida)
router.put("/partida/editar/:id",auth, editarPartida)
router.delete("/partida/borrar",auth,  borrarPartida) //YA corregido con LOG

router.get("/tipoDeMovimiento/listar",auth, listarTiposDeMovimientos);

router.get("/organismo/listar",auth, listarOrganismos);

//YA corregido con LOG
router.post("/expediente/alta",auth,agregarExpediente) //YA corregido con LOG
router.get("/expediente/buscar",auth, buscarExpediente)
router.get("/expediente/verificarExistenciaExpedienteEnReserva",auth, chequearSiElExpedienteExisteAntesDeIniciarUnaReservaNueva)
router.get("/expediente/buscarExpedienteComun",auth, buscarExpedienteParaModificarDefinitiva)
router.get("/expediente/buscarExpedienteParaTransferencias",auth, buscarExpedienteParaModificarPorTransferenciaEntrePartidas)

router.patch("/editarDetalleMovimiento",auth, editarDetalleMovimiento) //YA corregido con LOG

router.get("/detPresupuesto/obtenerPorItemYPartida",auth, obtenerDetPresupuestoPorItemYpartida)
router.get("/detPresupuesto/obtenerSaldoPorDetPresupuestoID",auth, obtenerSaldoPorDetPresupuestoID)

router.post("/movimiento/alta",auth,agregarMovimiento) //YA corregido con LOG
router.post("/movimiento/altaDefinitivaPreventivaSinArchivo",auth,agregarMovimientoDefinitivaPreventivaSinArchivo) //YA corregido con LOG
router.post("/movimiento/altaPorTransferenciaEntrePartidas",auth,agregarMovimientoPorTransferenciaDePartidas) //YA corregido con LOG
router.patch("/movimiento/editarPorTransferenciaEntrePartidas",auth,modificarMovimientoParaTransferenciaEntrePartidas) //YA corregido con LOG

router.patch("/movimiento/editarAltaDeCompromiso",auth,modificarAltaDeCompromiso) //YA corregido con LOG

router.patch("/movimiento/editarDefinitiva",auth,modificarDefinitiva)  //YA corregido con LOG


// Configurar el almacenamiento de los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Directorio donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombrar los archivos con un timestamp
  },
});

// Inicializar multer
const upload = multer({ storage: storage });

// router.post('/registroCompromiso/alta',auth, upload.fields([
//   { name: 'archivoActa', maxCount: 1 },
//   { name: 'archivoProtocolo', maxCount: 1 },
//   { name: 'archivoFactura', maxCount: 1 },
// ]), registroCompromisoAlta);

router.post('/registroCompromiso/alta',auth, upload.fields([
  { name: 'documentacion', maxCount: 1 }
]), registroCompromisoAlta);

router.post("/registroCompromisoSinArchivo/alta",auth,agregarMovimientoCompromiso)  //YA corregido con LOG

router.post('/movimiento/altaDefinitivaPreventiva',auth, upload.fields([
  { name: 'documentacion', maxCount: 1 }
]), agregarMovimientoDefinitivaPreventiva);

// router.get('/archivo/:nombreArchivo', obtenerArchivo);
router.get('/archivo',auth, obtenerArchivo);


router.patch("/movimiento/editar",auth,modificarMovimiento) //REVISAR
router.get("/movimiento/tipoInstrumento",auth, obtenerTiposDeInstrumentos)

router.get("/anteproyecto/listar",auth, listarAnteproyecto);


//FALTA LOG
router.put("/anteproyecto/editar",auth, actualizarPresupuestoAnteproyecto);

router.put("/credito/editar",auth, actualizarCredito);

router.put("/credito/editarCompleto",auth, actualizarCreditoCompleto);

router.put("/presupuesto/editar",auth, actualizarPresupuestoAprobado);
router.get("/presupuesto/listar",auth, obtenerPresupuestosParaMovimientoPresupuestario)

router.put("/presupuesto/editarCompleto",auth, actualizarPresupuestoAprobadoCompleto);

router.put("/acumular",auth, acumular);

router.post('/perfil/:cuil',auth, obtenerPerfilPorCuil);

router.post('/anteproyecto/crearEstructura',auth, crearEstructuraItem);
router.post('/anteproyecto/transferirEstructura',auth, transferirEstructuraItem);


router.get("/proveedores/listar",auth, obtenerProveedores);
router.put("/proveedores/editar",auth, editarProveedor);
router.post("/proveedores/agregar",auth, agregarProveedor);
router.delete("/proveedores/eliminar/:idEliminar",auth, eliminarProveedor);
router.get('/proveedores/:cuit',auth, buscarProveedorPorCuit);

//EJECUCION DE GASTOS
router.get("/proveedor/listar",auth, obtenerProveedor);
//

router.get("/rubros/listar",auth, obtenerRubros);
router.post("/rubros/agregar",auth, agregarRubro);

router.get("/nomencladores/listar",auth, obtenerNomencladores);
router.get("/nomencladores/listarPorPartida",auth, obtenerNomencladoresPorPartida);
router.put("/nomencladores/editar",auth, editarNomenclador);
router.post("/nomencladores/agregar",auth, agregarNomenclador);
router.delete("/nomencladores/eliminar/:idEliminar",auth, eliminarNomenclador);

router.get("/detmovimiento_nomenclador/buscar",auth, buscarExpedienteParaModificarNomenclador);

router.get("/encuadres/listar",auth, obtenerEncuadres)
router.get("/encuadrelegal/listar",auth, obtenerEncuadresLegales);
router.put("/encuadrelegal/editar",auth, editarEncuadreLegal);
router.post("/encuadrelegal/agregar",auth, agregarEncuadreLegal);
router.delete("/encuadrelegal/eliminar/:idEliminar",auth, eliminarEncuadreLegal);

router.get("/tipocompra/listar",auth, obtenerTiposDeCompras)

router.get("/obtenerDatosItem",auth, obtenerDatosItem)

router.get("/obtenerMovimientoReserva",auth, obtenerMovimientoReserva)
router.get("/obtenerMovimientoCompromiso",auth, obtenerMovimientoCompromiso)

router.get("/obtenerLibramiento",auth, obtenerLibramiento)

// CONTROLADORES PARA ADMIN DE GAF

router.get("/listarTipoUsuario", listarTipoUsuario);
router.post("/agregarTipoUsuario", agregarTipoUsuario);
router.put("/editarTipoUsuario/:id", editarTipoUsuario);
router.delete("/eliminarTipoUsuario/:id", eliminarTipoUsuario);
router.get("/listarPermisosTU/:id_tusuario", listarPermisosTU);
router.post("/actualizarPermisosTU/:usuarioId", actualizarPermisosTU);
router.post("/cambiarTipoUsuario", cambiarTipoUsuario);

router.post("/verificarEmpleado/:afiliado", verificarEmpleado);
router.post("/agregarUsuario", agregarUsuario);
router.post("/listarPermisosUsuario/", listarPermisosU);
router.post("/actualizarPermisosU/:usuarioId", actualizarPermisosU);
router.get("/listarUsuarios", listarUsuarios)

router.get("/listarProcesos", listarProcesos);
router.post("/altaProceso", agregarProceso);
router.post('/deshabilitarProceso/:id_proceso', deshabilitarProceso);
router.put('/editarP/:id_proceso', editarProceso);

router.get("/listarOpciones", listarOpciones)

module.exports = router;