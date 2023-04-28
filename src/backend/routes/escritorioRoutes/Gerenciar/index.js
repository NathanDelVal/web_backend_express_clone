const router = require("express").Router();
const multer = require("multer");

const GerenciarMainController = require("./gerenciarController/GerenciarMainController");
const UsuariosController = require('./gerenciarController/UsuariosController');
const ClientesController = require('../Controllers/ClientesController');
const ClassificarItensController = require("./gerenciarController/ClassificarItensController");
const AprovarItensController = require("./gerenciarController/AprovarItensController");
const CorrigirAprovadosController = require("./gerenciarController/CorrigirAprovadosController");
const RegrasController = require("./gerenciarController/RegrasController");
const multerConfigCertificado = require("../../../config/multerCertificado");
const multerConfigCertificadoUpdate = require("../../../config/multerCertificadoUpdate");

const { sessionValidate, mustBeRoot, mustBeAdministrador } = require("../../../workers/session/SessionValidate");

// after login
router.get("/", sessionValidate, GerenciarMainController.renderPage);

router.get('/consumo', sessionValidate, GerenciarMainController.renderPageConsumo);
router.get("/get-consumo-notas", sessionValidate, GerenciarMainController.requestGraficoConsumo);
router.get('/get-count-consumototal', sessionValidate, GerenciarMainController.requestGraficoConsumoTotal);
router.get("/get-consumo-notas", sessionValidate, GerenciarMainController.requestGraficoConsumo);
router.get("/get-count-consumomensal", sessionValidate, GerenciarMainController.requestGraficoConsumoMensal);
//router.get("/get-count-consumototal", sessionValidate, GerenciarMainController.requestGraficoConsumoTotal);

//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA Pendências
router.get('/pendencias', sessionValidate, GerenciarMainController.renderPagePendencias);

//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA USUÁRIOS
router.get("/usuarios", sessionValidate, UsuariosController.renderPage);
//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/get-usuarios", sessionValidate, UsuariosController.requestCreate);
//---------------------------------------------------------------------------------------------------------ROTA UPDATE USUÁRIO
router.post("/update-usuario", sessionValidate, UsuariosController.updateSingle);
//---------------------------------------------------------------------------------------------------------ROTA UPDATE MULTIPLOS USUÁRIOS
router.post("/update-usuario-multiplos", sessionValidate, UsuariosController.updateMulti);
//---------------------------------------------------------------------------------------------------------ROTA INSERE USUÁRIO(S)
router.post("/insert-usuarios", sessionValidate, UsuariosController.insertUsuario);
//---------------------------------------------------------------------------------------------------------ROTA PARA DOWNLOAD DE TEMPLATE PLANILHA (XLSX) PARA INSERÇÃO DE USUÁRIO(S)
router.get("/download-xlsx-usuarios", sessionValidate, mustBeAdministrador, UsuariosController.downloadTemplateXLSX);
//---------------------------------------------------------------------------------------------------------ROTA PARA INSERÇÃO DE USUÁRIO(S) ATRAVÉS DA PLANILHA (XLSX)
router.post("/insert-xlsx-usuarios", sessionValidate, mustBeAdministrador, UsuariosController.insertUsuariosXLSX);




//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA CLIENTES
router.get("/clientes", sessionValidate, ClientesController.renderPage);
//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/get-clientes", sessionValidate, ClientesController.requestCreate);
//---------------------------------------------------------------------------------------------------------ROTA UPDATE CLIENTE
router.post("/update-cliente", sessionValidate, multer(multerConfigCertificadoUpdate).array("file"), ClientesController.updateSingle);
//---------------------------------------------------------------------------------------------------------ROTA UPDATE MULTIPLOS CLIENTES
router.post("/update-cliente-multiplos", sessionValidate, ClientesController.updateMulti);
//---------------------------------------------------------------------------------------------------------ROTA INSERT MULTIPLOS CLIENTE(S)
//router.post("/insert-cliente", sessionValidate, multer(multerConfigCertificado).array("file"), ClientesController.insert);

//---------------------------------------------------------------------------------------------------------ROTA INSERT MULTIPLOS CLIENTE(S)
router.post("/filter-acumuladores", sessionValidate, ClientesController.filterAcumuladores);
router.post("/data-acumuladores", sessionValidate, ClientesController.dataAcumuladores);
//---------------------------------------------------------------------------------------------------------ROTA UPDATE ACUMULADOR
router.post("/update-acumulador", sessionValidate, ClientesController.updateAcumulador);
//---------------------------------------------------------------------------------------------------------ROTA INSERE USUÁRIO(S)
router.get("/download-xlsx-clientes", sessionValidate, ClientesController.downloadTemplateXLSX);
//---------------------------------------------------------------------------------------------------------ROTA PARA INSERÇÃO DE CLIENTES(S) ATRAVÉS DA PLANILHA (XLSX)
router.post("/insert-xlsx-clientes", sessionValidate, ClientesController.insertClientesXLSX);
//---------------------------------------------------------------------------------------------------------ROTA PARA DOWNLOAD DE TEMPLATE (PLANILHA (XLSX)) DE ACUMULADORES
router.get("/download-xlsx-acumuladores", sessionValidate, ClientesController.downloadTemplateAcumuladoresXLSX);
//---------------------------------------------------------------------------------------------------------ROTA PARA INSERÇÃO DE ACUMULADORES ATRAVÉS DA PLANILHA (XLSX)
router.post("/insert-xlsx-acumuladores", sessionValidate, ClientesController.insertAcumuladoresXLSX);


//---------------------------------------------------------------------------------------------------------ROTA PARA INSERÇÃO DE NOVO ACUMULADOR (Insert if not exists or update on demand. Needs user's confirmation)
router.post("/criar-acumulador", sessionValidate, ClientesController.insertAcumulador);
//---------------------------------------------------------------------------------------------------------ROTA PARA UPDATE DE ACUMULADOR (By user's confirmation)
router.post("/update-new-acumulador", sessionValidate, ClientesController.updateNewAcumulador);

router.post("/criar-acumulador-multiplos", sessionValidate, ClientesController.insertAcumuladorMultiplos);

router.post("/criar-acumulador-multiplos", sessionValidate, ClientesController.insertAcumuladorMultiplos);

router.post("/get-cfopsByCnpj", sessionValidate, ClientesController.getCFOPSbycnpj);


//relacionar cfops (xing - segunda feira)
router.post("/relacionar_novo_cfop", sessionValidate, ClientesController.relacionarCFOP);

router.post("/relacionar_novo_cfop_update", sessionValidate, ClientesController.updateRelacionarCFOP);


//classes para clientes controller (tabela tributações)


//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/aprovar-itens", sessionValidate, AprovarItensController.renderPage);
//----------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/get-aprovar-itens", sessionValidate, AprovarItensController.requestCreate);
//----------------------------------------------------------------------------------------------------------ROTA APROVAR NOTAS
router.post("/busca-aprovar-itens", sessionValidate, AprovarItensController.requestSearch);
//----------------------------------------------------------------------------------------------------------ROTA UPDATE PENDENTE
router.post("/update-pendente", sessionValidate, mustBeRoot, mustBeAdministrador, AprovarItensController.updatePendente);


//----------------------------------------------------------------------------------------------------------ROTA APROVAR PENDENTE (Single and Multiple)
router.post("/aprovar-pendente", sessionValidate, mustBeRoot, mustBeAdministrador, AprovarItensController.aprovarPendente);



//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/corrigir-aprovados", sessionValidate, CorrigirAprovadosController.renderPage);
//----------------------------------------------------------------------------------------------------------ROTA RENDERIZA APROVAR_ITENS
router.get("/corrigir-get-aprovar-itens", sessionValidate, CorrigirAprovadosController.requestCreate); //parece que não é mais usado!!

//----------------------------------------------------------------------------------------------------------ROTA UPDATE PENDENTE
router.post("/busca-corrigir-aprovados", sessionValidate, CorrigirAprovadosController.requestSearch);

router.post("/corrigir-update-pendente", sessionValidate, mustBeRoot, mustBeRoot, mustBeAdministrador, CorrigirAprovadosController.updateSingle);
//----------------------------------------------------------------------------------------------------------ROTA UPDATE PENDENTES
router.post("/corrigir-update-pendente-multiplos", sessionValidate, mustBeRoot, mustBeRoot, mustBeAdministrador, CorrigirAprovadosController.updateMulti);
//----------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------CLASSIFICAR ITENS CONTROLLER
router.get("/classificar-itens", sessionValidate, ClassificarItensController.renderPage);
router.post("/busca-classificar-itens", sessionValidate, ClassificarItensController.requestSearch);


//---------------------------------------------------------------------------------------------------------REGRAS CONTROLLER
router.get("/alterar-regras", sessionValidate, RegrasController.renderPage);
router.get("/get-tabela-regras", sessionValidate, RegrasController.getRegras);
router.post("/get-tabela-itens-atribuidos", sessionValidate, RegrasController.getItensRegra);
router.post("/delete-item-atribuido", sessionValidate, RegrasController.deleteItemRegra);
router.post("/delete-itens-atribuidos", sessionValidate, RegrasController.deleteItensRegra);
router.post("/get-busca-atribuir", sessionValidate, RegrasController.getAtribuirRegra);
router.post("/create-regra", sessionValidate, RegrasController.insert);
router.post("/update-regra", sessionValidate, RegrasController.updateSingle);
router.post("/atribuir_item_regra", sessionValidate, RegrasController.atribuirItemRegra);









module.exports = router;