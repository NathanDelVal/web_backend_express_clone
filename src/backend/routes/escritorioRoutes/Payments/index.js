const router = require("express").Router();
const PaymentsController = require("./controller/PaymentsController");
const { sessionValidate } = require("../../../workers/session/SessionValidate");
const { limiter , slower } = require("../../../config/requestRate");

router.get("/nibo-consulta-clientes", slower(), sessionValidate, PaymentsController.consultarClientes);
//router.get("/nibo-criar-cliente", sessionValidate, PaymentsController.criarCliente);

module.exports = router;