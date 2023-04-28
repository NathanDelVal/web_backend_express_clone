const router = require('express').Router();
const recuperarSenhaController = require('./controller/RecuperarSenhaController');

router.post("/acesso", recuperarSenhaController.request);
//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA ALTERAR_SENHA
router.get("/alterar-senha", recuperarSenhaController.renderPage);
//---------------------------------------------------------------------------------------------------------ROTA POST UPDATE SENHA
router.post("/atualizar-senha", recuperarSenhaController.updatePassword);

module.exports = router;