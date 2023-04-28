const router = require("express").Router();
const RelatoriosController = require("./controller/RelatoriosController");
// const multer = require("multer");
const { sessionValidate } = require("../../workers/session/SessionValidate");
// não esquecer de botar sessionValidate como middleware das rotas

router.get("/get_data_custo/ncm", RelatoriosController.getNCM);

router.get("/get_data_custo/entrada", RelatoriosController.getEntradas)

router.get("/get_data_custo/saida", RelatoriosController.getSaidas)


module.exports = router;