const router = require("express").Router();
const CNPJController = require("./controllers/CNPJController");
const { sessionValidate } = require("../../../workers/session/SessionValidate");
const { limiter , slower } = require('../../../config/requestRate');


//-------------------------------------------------[PYTHON RESP]---------------------------------------------------------
var notascomerro = [];
var notasquechegaram = [];

//Essa função verifica se os arquivos enviados através do site foram validados ou tiveram erros ao serem processados pelo Python, devolvendo a resposta para o cliente na página.
const pythonresp = (req, res, next) => {
    var notasRecebidas = req.query.Nnota;
    notasquechegaram.push(notasRecebidas);

    if (notasRecebidas.length > 0) {
        for (var i = 0; i < notasRecebidas.length; i++) {
            for (var j = 0; j < NfeErro.length; j++) {
                if ("COD1 " + notasRecebidas[i] == NfeErro[j]) {
                    notascomerro.push(NfeErro[j]);
                }
                if ("COD2 " + notasRecebidas[i] == NfeErro[j]) {
                    notascomerro.push(NfeErro[j]);
                }
                if ("COD3 " + notasRecebidas[i] == NfeErro[j]) {
                    notascomerro.push(NfeErro[j]);
                }
                if ("COD4 " + notasRecebidas[i] == NfeErro[j]) {
                    notascomerro.push(NfeErro[j]);
                }
            }
        }
        next();
    } else {
        res.redirect("/acesso");
    }
};
//----------------------------------------------------------------------------------------------------------------------x

//rui slower hoje  // POSTMAN http://107.21.172.180:7777/antecipados/get-cnpj   body = json {"cnpj": "00000000000191"}
router.post('/get-cnpj', CNPJController.request)
//router.post('/get-cnpj2', CNPJController.request2)



//--------------------------------------------------[PYTHON ROUTE]-------------------------------------------------------
router.get("/statusnotapy", slower(), sessionValidate, pythonresp, async(req, res, next) => {
    //Envia a resposta do processamento das notas para a página
    //console.log("status PYTHON", notascomerro)
    res.send(notascomerro);

    var notasRecebidas = req.query.Nnota;
    //Apaga as notas que já tiveram a resposta para a página enviadas.
    for (var i = 0; i < notasRecebidas.length; i++) {
        var index = notascomerro.indexOf("COD1 " + notasRecebidas[i]);
        if (index > -1) {
            notascomerro.splice(index, 1);
        }
        var index2 = notascomerro.indexOf("COD2 " + notasRecebidas[i]);
        if (index > -1) {
            notascomerro.splice(index2, 1);
        }
        var index3 = notascomerro.indexOf("COD3 " + notasRecebidas[i]);
        if (index > -1) {
            notascomerro.splice(index3, 1);
        }
        var index4 = notascomerro.indexOf("COD4 " + notasRecebidas[i]);
        if (index > -1) {
            notascomerro.splice(index4, 1);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------------------x

//importnotas - tabela

/*
//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA NOTAS
router.get("/notas", sessionValidate, NotasController.renderPage);
//-----------------------------------------------------------------------------------------------------------ROTA BUSCAR NOTAS
router.post("/importnotas", sessionValidate, NotasController.request);

//-----------------------------------------------------------------------------------------------------------UPDATE RETORNA PARA APROVAÇÃO - MODAL POST
router.post("/update-retorna-para-aprovacao", sessionValidate, NotasController.updateRetornaAprovacao);

router.post('/visualizar-nota', sessionValidate, NotasController.VisualizarNota);

router.post("/download-pdf", sessionValidate, NotasController.downloadPDF);

router.post("/download-xml", sessionValidate, NotasController.downloadXML);


*/



module.exports = router;