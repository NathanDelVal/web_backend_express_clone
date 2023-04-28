const router = require("express").Router();
const cadastroUsuarioController = require('./controllers/CadastroUsuarioController');

router.get("/pagina-confirmar-cadastro-usuario", cadastroUsuarioController.renderConfirmarCadastroUsuario);
router.post("/confirmar-cadastro-usuario", cadastroUsuarioController.confirmarCadastroUsuario);

module.exports = router;