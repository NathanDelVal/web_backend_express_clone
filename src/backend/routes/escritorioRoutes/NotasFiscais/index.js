const router = require("express").Router();
const multer = require("multer");
const multerConfigEnviarNotas = require("../../../config/multerNotas");
const NFController = require("./controllers/NFController");
const GraficosController = require("./controllers/GraficosController");
const GuiasController = require("./controllers/GuiasController");
const NotasController = require("./controllers/NotasController");
const EnviarNotasController = require("./controllers/EnviarNotasController");

const {
  sessionValidate,
  mustBeValidToken,
} = require("../../../workers/session/SessionValidate");
const path = require("path");
const fs = require("fs");
const {
  multerUploadXmlToFolder,
} = require("../../../config/multer-upload-xml-to-folder");

router.get("/notasfiscais", sessionValidate, NFController.renderPage);

router.get(
  "/operacoesNotasFiscais",
  sessionValidate,
  NFController.renderPageOperacoes
);

router.post(
  "/nfe-by-chave-de-acesso",
  sessionValidate,
  NFController.getNfeByChaveAcesso
);

router.post(
  "/nfce-by-chave-de-acesso",
  sessionValidate,
  NFController.getNfceByChaveAcesso
);

router.post("/download-pdf", sessionValidate, NFController.downloadPDF);

router.post("/download-xml", sessionValidate, NFController.downloadXML);

router.post("/requestdados", sessionValidate, NFController.requestDados);

router.post(
  "/adicionarsuggestion",
  sessionValidate,
  NFController.saveNewSuggestionsEtiquetas
);

router.get(
  "/get-suggestions-etiquetas",
  sessionValidate,
  NFController.getSuggestionsEtiquetas
);

router.post(
  "/atualizar-etiqueta",
  sessionValidate,
  NFController.atualizarEtiqueta
);

router.post(
  "/atualizar-anotacoes",
  sessionValidate,
  NFController.atualizarAnotacoes
);

router.post("/remover-etiqueta", sessionValidate, NFController.removerEtiqueta);

router.get("/graficos-antiga", sessionValidate, GraficosController.renderPageOld);

router.get("/graficos", sessionValidate, GraficosController.renderPage);

router.get("/guias", sessionValidate, GuiasController.renderPage);

router.get("/enviar-notas", sessionValidate, EnviarNotasController.renderPage);

router.post(
  "/upload-notas",
  sessionValidate,
  multer(multerConfigEnviarNotas).single("file"),
  EnviarNotasController.upload
);

router.post(
  "/update-notas-dataentrada",
  sessionValidate,
  NFController.updateDataEntrada
); //OK 17/06/2021

router.post(
  "/update-notas-difaliquota",
  sessionValidate,
  NFController.updateDifAliquota
); //OK 17/06/2021

router.get(
  "/get-suggestions",
  sessionValidate,
  NFController.requestSuggestions
);

router.get(
  "/get-suggestions-anotacoes",
  sessionValidate,
  NFController.requestSuggestionsAnotacoes
);

router.post("/reenviar-nota", sessionValidate, NotasController.reenviarNota);

router.post(
  "/update-cfop-entrada",
  sessionValidate,
  NFController.updateCFOPEntrada
);

router.post(
  "/update-acumulador-danfe-nfe",
  sessionValidate,
  NFController.updateAcumuladorDanfeNfe
);

router.post(
  "/update-acumulador-danfe-nfce",
  sessionValidate,
  NFController.updateAcumuladorDanfeNfce
);

router.post(
  "/manifestar-nota",
  sessionValidate,
  NFController.updateManifestacaoNota
);

router.post(
  "/update-mv4-danfe-nfe",
  sessionValidate,
  NFController.updateMva4DanfeNfce
); //FERNANDO disse que é somente para a página Corrigir Aprovados

router.post(
  "/update-reducaoBaseIcmsSaida-danfe-nfe",
  sessionValidate,
  NFController.updateReducaoBaseIcmsSaidaDanfeNfce
); //FERNANDO disse que é somente para a página Corrigir Aprovados

router.post(
  "/upload-xml-to-folder",
  mustBeValidToken,
  multer(multerUploadXmlToFolder).single("file"),
  EnviarNotasController.uploadXmlToFolderUploads
);


router.get("/relatorio/antecipados", sessionValidate, GraficosController.getAntecipadosData)


module.exports = router;
