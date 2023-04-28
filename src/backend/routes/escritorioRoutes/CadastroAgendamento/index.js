const router = require('express').Router();

const cadastroAgendamentoController = require('./controllers/cadastroAgendamentoController');

router.get('/', cadastroAgendamentoController.renderCadastrarAgendamento);

router.post('/confirmar-cadastro', cadastroAgendamentoController.cadastrarAgendamento);


module.exports = router;