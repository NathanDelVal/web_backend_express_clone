const router = require("express").Router();
const RoboContabilController = require("./RoboContabilController");
const { sessionValidate } = require("../../../workers/session/SessionValidate");

router.get("/", sessionValidate, RoboContabilController.renderRoboContabil); //ROTA RENDERIZA NF


module.exports = router;