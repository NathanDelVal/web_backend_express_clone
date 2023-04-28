const router = require("express").Router();
const AcumuladoresController = require('./controllers/AcumuladoresController')
const { sessionValidate, mustBeAdministrador, mustBeRoot } = require("../../../workers/session/SessionValidate");
const { limiter , slower } = require('../../../config/requestRate');

router.get("/", slower(), sessionValidate, AcumuladoresController.getAcumuladores);
router.get("/cfopsbycnpj", slower(), sessionValidate, AcumuladoresController.getAcumuladores);

module.exports = router;