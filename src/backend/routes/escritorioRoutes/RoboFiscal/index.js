const router = require("express").Router();
const RoboFiscalController = require("./RoboFiscalController");
const { sessionValidate } = require("../../../workers/session/SessionValidate");

router.get("/", sessionValidate, RoboFiscalController.renderRoboFiscal);

router.get("/get-data-robo-fiscal-produtos", sessionValidate, RoboFiscalController.requestRoboFiscalProdutos);

router.post("/download-pdf", sessionValidate, RoboFiscalController.downloadPDF);

router.post("/download-xml", sessionValidate, RoboFiscalController.downloadXML);

router.post('/get-pdf-by-chave', sessionValidate, RoboFiscalController.getPDFByChaveAcesso)

router.post("/count-notas-entrada-saida", sessionValidate, RoboFiscalController.countNotasEntradaSaida);
/*
//A rota "/count-notas-entrada-saida" substituiu as rotas abaixo
router.get("/get-data-robo-fiscal-notas", sessionValidate, RoboFiscalController.requestRoboFiscalNotas);
router.post("/getdata-robofiscalnotas-bymonth", sessionValidate, RoboFiscalController.requestRoboFiscalNotasByMonth);
*/

module.exports = router;