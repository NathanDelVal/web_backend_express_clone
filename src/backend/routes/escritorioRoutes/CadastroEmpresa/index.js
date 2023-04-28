const router = require('express').Router();
const { sessionValidate, mustBeRoot, mustBeAdministrador } = require("../../../workers/session/SessionValidate");
const {efetuarCadastroEmpresa} = require('./controllers/cadastroEmpresaController');

router.post("/efetuar-cadastro-empresa", sessionValidate,  efetuarCadastroEmpresa);

module.exports = router;