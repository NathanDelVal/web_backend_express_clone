const router = require("express").Router();
const cadastroEscritorioController = require('./controllers/cadastroEscritorioController');

router.get('/', cadastroEscritorioController.renderCadastrarEmpresa);
router.post('/efetuar-cadastro-escritorio', cadastroEscritorioController.efetuarCadastroEscritorio);
router.get('/confirmar-cadastro-escritorio', cadastroEscritorioController.hashAuthentication, cadastroEscritorioController.renderCadastrarSenhaAdmEscritorio);
router.post('/cadastrar-administrador', cadastroEscritorioController.cadastrarAdmEscritorio);
//router.get(('/hash-authentication', cadastroEscritorioController.hashAuthentication, next);
//router.post('/confirmar-cadastro-escritorio', cadastroEscritorioController.EnviarEmailConfirmacaoCadastroEscritorio);
//router.get('/validar-cadastro-escritorio', cadastroEscritorioController.ativarCadastroEmpresa);
//router.get('/pagina-confirmar-cadastro-escritorio', cadastroEscritorioController.renderPageConfirmarCadastro );
//router.get('/cadastrar-escritorio-copy', cadastroEscritorioController.renderCadastroEscritorioCopy);

module.exports = router;