

const router = require("express").Router();
const multer = require("multer");
const GEDController = require("./GEDController");
const multerConfigGED = require("../../../config/multerGED");
const multerConfigGEDApi = require("../../../config/multerGEDApi");
const { sessionValidate, mustBeEscritorioGED } = require("../../../workers/session/SessionValidate");

router.get("/", sessionValidate, GEDController.renderPage);

router.get("/AdminGED", sessionValidate, GEDController.renderAdminGED);

router.get("/explorar", sessionValidate, GEDController.renderPageExplorar);

router.post("/busca", sessionValidate, GEDController.busca);

router.post("/get-file", sessionValidate, GEDController.gedFileGED);

router.post("/update-detalhes", sessionValidate, GEDController.updateDetalhes);

router.post("/get-detalhes", sessionValidate, GEDController.getDetalhesById);

router.post("/download-pdf", sessionValidate, GEDController.downloadPDF);

router.get("/file-manager", sessionValidate, GEDController.fileManager);

router.post("/file-manager-get-doc", sessionValidate, GEDController.fileManagerGetDoc);

router.post("/get-by-name-doc", sessionValidate, GEDController.fileDetailsByName);

router.post("/tabela-controle", sessionValidate, GEDController.GEDControl);

router.post("/ged-files-upload", sessionValidate, multer(multerConfigGED).single("file"), GEDController.filesUpload);

//Adicionar sessionvalidate personalizado para a api victor bcrypt
router.post("/api-ged-files-upload", mustBeEscritorioGED, multer(multerConfigGEDApi).single("file"), GEDController.filesUpload);

router.post("/api-login", GEDController.gedLogin);


module.exports = router;