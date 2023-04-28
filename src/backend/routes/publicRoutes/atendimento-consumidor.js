const router = require("express").Router();
const multer = require("multer");
const { sessionValidate } = require("../../workers/session/SessionValidate");

const AtendimentoConsumidorController = require("../../routes/escritorioRoutes/Controllers/AtendimentoConsumidorController");
const { limiter , slower } = require("../../config/requestRate");

//-------------------------------------------------[PYTHON RESP]---------------------------------------------------------
router.post('/tenho-interesse', slower(), AtendimentoConsumidorController.SendEmail)





module.exports = router;