const path = require("path");
/*const express = require("express");
const router = express.Router();
*/
const router = require("express").Router();
const multer = require("multer");
const moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");
const RecuperarSenhaController = require("../routes/escritorioRoutes/Controllers/RecuperarSenhaController");
const { spawn, exec } = require("child_process");
const { knexPostgre } = require("../database/knex");
const bcrypt = require("bcrypt");
const UserChamadosController = require("./escritorioRoutes/ChamadosSuporte/controllers/UserChamadosController");
const { shutDownFREEplans } = require("./escritorioRoutes/Controllers/SYNCRONOUS");
const { limiter, slower } = require("../config/requestRate");
const fetch = require("node-fetch");
const { capitalize } = require("./helpers/capitalize");
const { processarXml, manifestarNota } = require("./helpers/pythonRunScript");
const { setNotaNaoProcessada, saveNewSuggestionEtiquetaMongo, mongoConnectionCheck } = require("../../backend/database/mongoDB");
const { responseForRequest } = require("../routes/helpers/responseToRequest");
//---------------------------------------------[SQL SERVER ENVIROMENT]----------------------------------------------------
const { getDefaultSettings } = require("http2");
const { sessionValidate } = require("../workers/session/SessionValidate");

const { SSL_OP_CISCO_ANYCONNECT } = require("constants");

const { schemaEmail } = require("../workers/JOI/schemas");

//-----------------------------------------------------------------------------------------------------------------------x
const qs = require("qs")
const axios = require("axios")
const { ExpireTime, ExpireTimePlano } = require("./helpers/sessionTime");
const { redisClient } = require("../database/redis");



//--------------------------------------------[ RAW QUERYS FOR SETTINGS ]-------------------------------------------------
/*
//Habilitando chave única para id por padrão
knexPostgre.raw("CREATE EXTENSION IF NOT EXISTS "uuid-ossp";").then(function () {
    console.log("---------------[ UUID-OSSP OK! ]-------------------");

    //Habilitando extensão insensitiva à acento
    knexPostgre.raw("CREATE EXTENSION IF NOT EXISTS "unaccent";").then(function () {
        console.log("---------------[ UNACCENT OK! ]-------------------");
    });
});
*/
//-----------------------------------------------------------------------------------------------------------------------x






//----------------------------------------------------------------[ROTAS DAS PAGINA]-----------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------REDIRECT TO LOGIN ON ACESSO PAGE
/*
router.get("/", function(req, res) {

    if (req.session.userData) {
        return res.redirect("/antecipados/notas");
    } else {
        return res.redirect("/acesso");
    }

});
*/

router.get("/", function (req, res) {
    res.render("./_escritorio/_Home/divulgacao");
});

router.get("/a", function (req, res) {
    res.send("VICTOR")
});

router.get("/quemSomos", function (req, res) {
    res.render("./_escritorio/_Home/quemSomos");
});

router.get("/tag", function (req, res) {
    res.render("tagsinputs_teste");
});

//router.get("/robo-fiscal2", sessionValidate, RoboFiscalController2.renderPage);

//ROBO FISCAL - MUDAR PARA CONTROLER POSTERIORMENTE
router.get("/pg", slower(), async (req, res) => {
    const trx = await knexPostgre.transaction();
    await trx("test").select("id_login").from("dbo.login_tbl_view").where({ email: "viktor7700@gmail.com" }).then((rows) => {
        if (rows.length > 0) {
            return res.send(JSON.stringify(rows[0]))
        } else {
            var msg = "Email informado não encontra-se cadastrado."
            return res.send(msg)
        }
        //res.send(JSON.stringify(queryPg.toSQL().toNative()))
    }).catch((error) => {
        console.log(error)
    })
});
//-----------------------------------------------------------------------------------------------------------ROTA ACESSO-HBS
router.get("/acesso", function (req, res) {
    var content = "";
    if (req.session.userData) {
        return res.redirect("/menu/apps");
    }
    else {
        return res.render("./_escritorio/_Home/acesso", { content: content });
    }
});


//-----------------------------------------------------------------------------------------------------------ROTA POST BOTÃO LOGIN
router.post("/login", async (req, res) => {
    var content = "";
    try {
        var datasend = "";
        var rowsData = "";
        var rowsAffected = "";
        var result = {
            status: null,
            msg: "",
            redirect: ""
        }
        var { Email, Senha } = req.body

        const { error, value } = await schemaEmail.validate({ Email, Senha });
        //MEMO IMPLEMENTAR O JOI PARA VERIFICAR SE O INPUT  DO USUARIO FOI REALMENTE UM EMAIL, CASO NÃO DEVOLVER ERRO
        if (error) {
            //console.log("JOI ERROR: ", error)
            result.status = false;
            result.msg = error.message;
            result.error = true;
            return res.send(result);
        }
        if (!error && value) {
            //console.log("Joi validou")
            const getDataLogin = async (useremail) => {
                return await knexPostgre.from("login_tbl_view").withSchema("dbo").where({ email: useremail })
                    .andWhere({ ativo: "SIM" })
                    .then(rows => rows[0])
                    .then(async (rows) => {
                        /* rows ? rows : rows = await knexPostgre.from("empresas_tbl_view").withSchema("dbo").where({ email_empresa: useremail })
                            .andWhere({ situacao: "Ativa" })
                            .then(rows => rows[0]) */
                        if (rows) {
                            result.status = true;
                            result.msg = `Seja Bem-vindo ${await capitalize(rows.usuario)}`
                            console.log("result ", result)
                            return rows;
                        }
                        if (!rows) {
                            result.status = false;
                            result.msg = "Email informado não encontra-se cadastrado ou seu escritório está inativo."
                            //res.send(result);
                            console.log("result ", result)
                            return
                        }
                    }).catch((error) => { console.log(error); });
            }
            const bcryptValidade = async (data) => {
                if (data) {
                    var isMatchPassword = null;
                    if (data?.senha) {
                        isMatchPassword = await bcrypt.compare(Senha, data.senha)
                    }
                    if (isMatchPassword) {
                        delete data["senha"]
                        /*ARMAZENAR TOKEN*/
                        var ano = parseInt(moment(data.data_inicio).format("YYYY"))
                        var mes = parseInt(moment(data.data_inicio).format("M") + "00")
                        var dia = parseInt(moment(data.data_inicio).format("DD"))
                        var tag = null;
                        if (data?.nome_fantasia) tag = data.nome_fantasia.substring(0, 2)

                        data.token = `${tag}${(ano + mes + dia)}`

                        if (data.ativo == "SIM") {
                            //if null then false                            //verificar a necessidade
                            data.prod1 ? data.prod1 : data.prod1 = false;
                            data.prod2 ? data.prod2 : data.prod2 = false;
                            data.prod3 ? data.prod3 : data.prod3 = false;
                            data.prod4 ? data.prod4 : data.prod4 = false;

                            //Colocando o Ip do Cliente na sessão
                            var clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
                            data.ip = clientIp.replace("::ffff:", "");

                            //Atribuindo dados do cliente à sessão
                            req.session.userData = data
                            result.redirect = "/menu/apps";
                            return res.send(result);

                        } else {
                            result.msg = "Você não possui as permissões necessárias"
                            return res.send(result)
                        }
                    } else {
                        if (result.msg != "Email informado não encontra-se cadastrado ou seu escritório está inativo.") { result.msg = "Credênciais inválidas!"; }
                        return res.send(result);
                    }
                } else {
                    //Usuário não encontrado no banco
                    //result.msg = "Credênciais inválidas!";
                    return res.send(result);
                }
            }
            bcryptValidade(await getDataLogin(Email))
        }
    } catch (error) {
        console.log(error)
        //result.msg = "Credênciais inválidas!";
        //res.send(result);
    }
});




//-----------------------------------------------------------------------------------------------------------GET LOGOUT ENCERRAR SESSÃO
router.get("/sair", function (req, res) {
    req.session.destroy(function (error) {
        return res.redirect("/acesso");
    });
});

//---------------------------------------------[ROTAS DE GET/POST]--------------------------------------------------------



//---------------------------------------------------------------------------------------------------------ROTA POST ALTERAR SENHA : VERIFICA SE EMAIL EXISTE E ENVIA EMAIL DE RECUPERAÇÃO
router.post("/recuperaracesso", RecuperarSenhaController.request);
//---------------------------------------------------------------------------------------------------------ROTA RENDERIZA ALTERAR_SENHA
router.get("/alterarsenha", RecuperarSenhaController.renderPage);
//---------------------------------------------------------------------------------------------------------ROTA POST UPDATE SENHA
router.post("/atualizarsenha", RecuperarSenhaController.updatePassword); //-----------------------------------------------------------------------------------------------------------------------x
//---------------------------------------------------------------------------------------------------------ROTA VERIFICA/VALIDA CADRASTRO


//router.get("/verificarcadastro", CadastroUsuarioController.verify);


router.get("/meu-plano", slower(), sessionValidate, async (req, res) => {
    //console.log("/meu-plano!!!!!!!!!!!");
    var plano = req.session.userData.plano;
    if (!plano) return res.send(null);
    return res.send(plano);
    /* // Destruir sessão do usuário
    req.session.destroy(function (error) {
        return res.redirect("/acesso");
    });
    */
});







router.get("/teste", async (req, res) => {
    res.render("./_escritorio/_EndUser/empresas");
});

//---------------------------------------------------------------------------------------------------------ROTA UserChamadosController
router.get("/get-chamados", slower(), sessionValidate, UserChamadosController.getChamados);
router.post("/get-chat-chamado", slower(), sessionValidate, UserChamadosController.getChatChamado);
router.post("/create-chamado", slower(), sessionValidate, UserChamadosController.createChamado);
router.post("/close-chamado", slower(), sessionValidate, UserChamadosController.closeChamado);
/*
router.post(
    "/chatchamados",
    sessionValidate,
    UserChamadosController.sendChat
);
*/
router.get("/get-newmsg", slower(), sessionValidate, UserChamadosController.getNewMsg);

router.get("/testpowerbi", async (req, res) => {
    res.render("powerbiteste");
});






router.get("/timerpage", async (req, res) => {
    res.render("timeout");
});


router.get("/countdownFREE", slower(), sessionValidate, async (req, res) => {
    var timer = await ExpireTimePlano(req.session.userData.data_inicio, "YYYY-MM-DD HH:mm:ss")
    console.log("countdown timer ", timer)
    if (timer == "Invalid date") {
        timer = "00:00:00"
    }
    res.send({ "timer": timer });
});



router.get("/expiration-timer", slower(), sessionValidate, async (req, res) => {

    const sessionTIME = req.session.userData.data_inicio
    var SetExpire = 1 //NUMBER OF DAYS
    var expirationTIME = moment(sessionTIME, "YYYY-MM-DD HH:mm:ss").add(SetExpire, "days").add(3, "hours").valueOf()
    //console.log("SESSION DATE", req.session.userData.data_inicio, "==>", expirationTIME)
    res.send({ "expirationtime": expirationTIME });
});


router.get("/expireShutDownFREEplans", slower(), function (req, res) {
    shutDownFREEplans(1) //1 = day
    req.session.destroy(function (error) {
        return res.redirect("/acesso");
    });
});


//--------------------------------------------------------------------------------------------------------ROTA ALTERAR-REGRAS

//--------------------------------------------------------------------------------------------------------SERVER SOCKET (TRANSPORTADO PARA SERVERSOCKET)

//-------------------------------------------------------------------------------------------------------ROTA POST IMAGENS
router.get("/imagem", sessionValidate, async (req, res) => {
    var root = req.session.userData[0].root; //VARIÁVEL ADMIN TRUE OU FALSE?
    var { administrador, root } = req.session.userData

    message = "";
    try {
        return res.render("imagem", { message: message });
    } catch { }
});


//FUNÇÃO QUE COLOCA O SERVIDOR PARA DORMIR MOMENTANEAMENTE - Tipo um delay
//COMO USAR? => await sleep(5000);
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//-----------------------------------------[Python Exec with Parms]------------------------------------------------------x

/*
router.post("/testepython", async (req, res) => {
    var { filename } = req.body;

    initLoadAndSend(filename);

    res.send().status(200);
});
*/



//----------------------------------------------------[ROTINAS]-----------------------------------------------------------

async function pythonRotine() {
    var arrayNotProcessedFiles = await setNotaNaoProcessada();
    //console.log("arrayNotProcessedFiles =>>>> ", arrayNotProcessedFiles);

    if (arrayNotProcessedFiles.length > 0) {
        processarXml(arrayNotProcessedFiles);
    } else {
        console.log("Node.js ==>> Nenhuma nota para processar no momento (Mongo => pythonRotine()")
    }
    //console.log(`arg was => ${arg1}`);
}
//-----------------------------------------------[CONTROLE DE ROTINAS]----------------------------------------------------
//setInterval(pythonRotine, 600000);
//setInterval(() => {shutDownFREEplans(1)}, 600000)
















//Rota teste aplicativo

/*
{
    nome_do_arquivo: "94611446-GRF_31365873000121_06052021_102028.PDF",
    cnpj: "31365873000121",
    cliente: "ROCHA CONCRETO E BRITA LTDA",
    json_path: "/16/ROCHA CONCRETO E BRITA LTDA/FGTS/2021/Abril/",    status_documento: "Enviado",
    thumb: "94611446-GRF_31365873000121_06052021_102028_thumb.jpeg",
    natureza: "FGTS"
  }
*/

/*
{
  nome_do_arquivo: "94611446-GRF_31365873000121_06052021_102028.PDF",
  json_path: "/16/ROCHA CONCRETO E BRITA LTDA/FGTS/2021/Abril/94611446-GRF_31365873000121_06052021_102028",
  thumb: "94611446-GRF_31365873000121_06052021_102028.jpeg",
  target: "thumb"
}
 */





const base64_encode = async (file) => {
    var dataout = "";
    if (file) {
        try {
            dataout = new Buffer.from(file).toString("base64");
        } catch (error) {
            console.log(error);
        }
    }
    return dataout;
}


const { ArrayObjToHierarchical } = require("./helpers/ArrayObjToHierarchicalPath");
const { getGedFileSystem } = require("../database/mongoDB");
router.get("/mongoged", async (req, res) => {
    console.log("oi")
    //console.log("ssssssssss ", await getGedFileSystem())
    res.send(await ArrayObjToHierarchical(await getGedFileSystem(), "parent"));
});


router.get("/ged-pdf-app", slower(), async (req, res) => {
    const gedfolder = path.resolve(__dirname, "..", "..", "..", "storage", "ged_folder");
    var { data } = req.body
    try {
        var out = [];

        var arr = data;
        if (!Array.isArray(data)) {
            arr = new Array();
            arr.push(data);
        }

        async function getFiles(arrayfiles) {
            return await Promise.all(arrayfiles.map(async (objfile) => {
                var { json_path, nome_do_arquivo, thumb } = objfile;
                if (json_path && nome_do_arquivo && thumb) {

                    var thumb_64 = null;
                    var file_64 = null;

                    thumb_64 = await base64_encode(await fs.readFileSync(path.resolve(`${gedfolder}${json_path}${thumb}`)));
                    file = await fs.readFileSync(path.resolve(`${gedfolder}${json_path}${nome_do_arquivo}`))

                    if (thumb_64) {
                        objfile["thumb_64"] = thumb_64;
                    }

                    const config_aws = {
                        Bucket: process.env.AWS_BUCKET_GED,
                        CreateBucketConfiguration: {
                            // Set your region here
                            //LocationConstraint: "eu-west-1"
                        },
                        Key: nome_do_arquivo,
                        Body: file
                    };
                    // Uploading files to the bucket
                    /*
                        s3.upload(config_aws, function(error, data) {
                            if (error) {
                                throw error;
                            }
                            console.log(`File uploaded successfully. ${data.Location}`);
                        });
                    */
                } else {
                    //ALGUM ITEM ESTÁ FALTANDO
                    objfile.error_required_fields_empyt = [];
                    if (!nome_do_arquivo) { objfile["error_required_fields_empyt"].push("nome_do_arquivo is required") };
                    if (!json_path) { objfile["error_required_fields_empyt"].push("json_path is required") };
                    if (!thumb) { objfile["error_required_fields_empyt"].push("thumb is required") };
                }
                return objfile;
            }));
        }
        //const found_Files = await getFiles(arr);
        return res.send(await getFiles(arr))
    } catch (error) {
        return res.send(error.message).status(500);
    }

});




router.get("/meuip", async (req, res) => {
    return res.send(`<h3>Seu IP é ${req.ip}</h3>`);
});


/* const Promise = require("bluebird");

router.get("/blue-bird", async (req, res) => {
    var nomes = ["Victor", "Gabriel Giordano"];

    async function getIds() {
        var todos_ids = [];
        console.log("for iniciado");
        for (const nome of nomes) {
            todos_ids.push(

                await knexPostgre("login_tbl").withSchema("dbo")
                .select("id_login")
                .where("usuario", nome)
                .then(rows => {
                    console.log("rows ", rows[0].id_login)
                    return rows[0].id_login;
                })
            )
        }
        console.log("for finalizado");
        return todos_ids;
    }

    await getIds().then(data => { console.log("saida", data) });
    console.log("pass");

    res.send("Ok!");
});

 */

const omieContas = require("../APIs/OMIE/omieFunctionsContas");
const { nextTick } = require("process");

router.post("/omie", async (req, res) => {
    var data = {
        identificacao: {
            cCodInt: "1013",
            cNome: "MATIAS & MEZZOMO LTDA",
            cDoc: "05351757000143",
            cObs: "Conta adicionada via API",
            dDtReg: "10/01/2022",
            dDtValid: "10/03/2022"
        },
        endereco: {
            cEndereco: "Av. 15 de novembro, 20",
            cCEP: "68488-000",
            cCidade: "Breu Branco",
            cUF: "PA",
            cPais: "Brasil"
        },
        telefone_email: {
            cDDDTel: "94",
            cNumTel: "98150-0807",
            cEmail: "fermezzomotuc@gmail.com",
            cWebsite: "https://www.robotax.com.br/"
        }
    }
    console.log("ROUTER OMIE >>>>  ", await omieContas.ConsultarConta(data));
});

router.post("/omie-consultar", async (req, res) => {
    var data = {
        "cCodInt": "2396"
    };
    const apiOmieResponse = await omieContas.Listartags(data)
    console.log("ROUTER OMIE >>>>  ", apiOmieResponse);
    return res.send("Ok");
});

router.post("/omie-cadastrar", async (req, res) => {
    var data = {
        identificacao: {
            cCodInt: "1016",
            cNome: "Rui LTDA",
            cDoc: "63.903.632/0001-86",
            cObs: "Conta adicionada via API",
            dDtReg: "10/01/2022",
            dDtValid: "10/03/2022"
        },
        endereco: {
            cEndereco: "Av. 15 de novembro, 20",
            cCEP: "68488-000",
            cCidade: "Breu Branco",
            cUF: "PA",
            cPais: "Brasil"
        },
        telefone_email: {
            cDDDTel: "94",
            cNumTel: "98150-0807",
            cEmail: "fermezzomotuc@gmail.com",
            cWebsite: "https://www.robotax.com.br/"
        }
    }
    console.log("ROUTER OMIE >>>>  ", await omieContas.IncluirConta(data));
    return res.send("OKAY");
});


router.post("/omie-alterar", async (req, res) => {
    console.log(">>> Omie tag");
    var params = {
        identificacao: {
            cCodInt: "2396",
            cDoc: "94177403000154",
            cNome: "ft941",
            cObs: "Conta adicionada via API",
            dDtReg: "24/01/2022",
            dDtValid: "24/03/2022",
            nCod: 1991779462,
            nCodTelemkt: 0,
            nCodVend: 1574987592,
            nCodVert: 0
        },
        endereco: {
            cBairro: "",
            cCEP: "21512-331",
            cCidade: "",
            cCompl: "",
            cEndereco: "wall st, undefined, undefined",
            cPais: "Brasil",
            cUF: ""
        },
        telefone_email: {
            cDDDFax: "",
            cDDDTel: "32",
            cEmail: "rui.nascimento@tucurui.ufpa.br",
            cNumFax: "",
            cNumTel: "1231-21323",
            cWebsite: "www.ploop.com.br"
        },
        informacoesAdicionais: {
            cCnae: "       ",
            cRegTrib: " ",
            nFaixaFat: "                                                                                                    ",
            nNumFunc: 0
        },
        tags: [
            { "tag": "Ativa" }
        ]

    };
    const apiOmieResponse = await omieContas.AlterarConta(params)
    console.log("ROUTER alterar OMIE >>>>  ", apiOmieResponse);
    return res.send("Ok \n", apiOmieResponse);

})



///AREA DE TESTES


/*

Arquivo para upload de arquivos feitos no front-end.

Uso no modal de inserir novos clientes na página "Clientes" para inserir certificados digitais

*/


router.get("/modelo", async (req, res, next) => {
    res.render("./xpaginasDeTeste/modelo")
})
router.get("/auditoria", async (req, res, next) => {
    res.render("./_escritorio/Auditoria/auditoria")
})
router.get("/r", async (req, res, next) => {
    res.render("form")
})
const { getStreamFiles } = require("../workers/formidable/");

router.post("/r", async (req, res) => {
    console.log("req.body ", req.body);
    /*  const out = await getStreamFiles(req);
     console.log(">>OUT ", out);
     const {fields, files}= out;
     console.log("fields opkok: ", fields);
     console.log("files opkok: ", files);  */
    res.send("ok")
})


module.exports = router;
