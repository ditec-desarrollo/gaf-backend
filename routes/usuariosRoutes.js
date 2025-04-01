const { Router } = require("express");
const auth = require("../middlewares/auth");
const validateFields = require("../middlewares/validateFields");
const { check } = require("express-validator");

const {
  getAuthStatus,
  obtenerUsuarios,
  obtenerPermisos,
  obtenerOpcionesHabilitadas,
} = require("../controllers/usuariosControllers");

const verifyRole = require("../middlewares/verifyRole");

const router = Router();

router.get("/authStatus", auth, getAuthStatus);
router.get("/listar/:id?", auth, verifyRole, obtenerUsuarios);
router.get("/permisos/:cuil/:idPersona", auth, obtenerPermisos);
router.get("/opciones", auth, obtenerOpcionesHabilitadas);


module.exports = router;
