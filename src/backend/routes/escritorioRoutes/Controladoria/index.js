

const router = require("express").Router();
const ControladoriaController = require("./controllers/ControladoriaController");
const multer = require("multer");
const { sessionValidate } = require("../../../workers/session/SessionValidate");

router.get("/controladoria", sessionValidate, ControladoriaController.renderPage);


module.exports = router;