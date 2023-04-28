const router = require('express').Router();
const SuporteController = require('./Controllers/SuporteController');
const SuporteChamadosController = require('./Controllers/SuporteChamadosController')
const GerenciarEscritoriosController = require('./Controllers/GerenciarEscritorios')
const ManageAccounts = require('./Controllers/ManageAccounts')
const { sessionValidate } = require('../../../workers/session/SessionValidate');


router.get('/', SuporteController.renderAcessoSuporte);
router.post('/login', SuporteController.loginSuporte);

router.get("/sair", function (req, res) {
    req.session.destroy(function (error) {
        return res.redirect("/suporte");
    });
});


//   ---> administrativo/...

router.get('/suporte-chamados', sessionValidate, SuporteChamadosController.renderPage);
router.get('/suporte-getchamados', sessionValidate, SuporteChamadosController.getChamadosSuporte);
router.post('/suporte-getchat',  sessionValidate, SuporteChamadosController.getChatSuporte);
router.post('/suporte-atender-chamado', sessionValidate, SuporteChamadosController.atenderChamado);

router.get('/escritorios', sessionValidate, GerenciarEscritoriosController.renderPage);

router.post('/post-count-consumototal', sessionValidate, GerenciarEscritoriosController.getCountConsumoTotal);

router.get('/get-consumo-notas', sessionValidate, GerenciarEscritoriosController.requestGraficoConsumo);

//----------------------------------------------------------------------------------------------------------ROTA RENDERIZA escritorios
router.get('/get-escritorios',  sessionValidate, GerenciarEscritoriosController.requestCreate);
//---------------------------------------------------------------------------------------------------------- GRÁFICOS

router.post('/get-consumo-notas-byescritorio',  sessionValidate, GerenciarEscritoriosController.requestGraficoConsumoByEscritorio);

router.post('/fetchsuggestions', sessionValidate, GerenciarEscritoriosController.suggestionsEscritorio);

router.post('/update-escritorio', sessionValidate, GerenciarEscritoriosController.update_escritorio);
router.post('/update-escritorio-multiplos', sessionValidate, GerenciarEscritoriosController.update_escritorios_multiplos);


router.post('/update-planos', sessionValidate, ManageAccounts.updatePlano);

router.post('/cancelar-plano', sessionValidate, ManageAccounts.cancelarPlano);


module.exports = router;
