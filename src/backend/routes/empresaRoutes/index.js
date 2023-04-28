const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const moment = require("moment");
const bcrypt = require("bcrypt");
const { knexPostgre } = require("../../database/knex");
const { shutDownFREEplans } = require("../escritorioRoutes/Controllers/SYNCRONOUS");
const { limiter, slower } = require("../../config/requestRate");
const { capitalize } = require("../helpers/capitalize");
const { processarXml, manifestarNota } = require("../helpers/pythonRunScript");
const { setNotaNaoProcessada, saveNewSuggestionEtiquetaMongo } = require("../../../backend/database/mongoDB");
const { sessionValidate } = require("../../workers/session/SessionValidate");
const { schemaEmail } = require("../../workers/JOI/schemas");
const S3aws = require("../../APIs/AWS/S3");
const { mustBeAdministrador, mustBeEscritorio, mustBeEmpresa } = require('../../../backend/workers/session/SessionValidate.js');
const { responseForRequest } = require("../../routes/helpers/responseToRequest");
const NotasController = require('./NotasFiscais/controllers');

/* RENDER LOGIN PAGE */
router.get("/", function (req, res) {
  try {
    if(!req.session.userData) {
      return res.render("./_empresa/Acesso");
    }
    return res.redirect('/empresa/apps');
  } catch (error) {
    return res.status(500).send({ status: false, error: true, msg: error.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
      var { Email, Senha } = req.body

    const { error, value } = await schemaEmail.validate({ Email, Senha });
    //MEMO IMPLEMENTAR O JOI PARA VERIFICAR SE O INPUT  DO USUARIO FOI REALMENTE UM EMAIL, CASO NÃO DEVOLVER ERRO
    if (error) {
      //console.log("JOI ERROR: ", error)
      return res.send(responseForRequest(error.message, false, error));
    }
    if (!error && value) {
      //console.log("Joi validou")
      const getDataLogin = async (useremail) => {
        return await knexPostgre.from("empresas_tbl_view").withSchema("dbo").where({ email_empresa: useremail })
          .andWhere({ status: 'Ativa' })
          .then(rows => rows[0])
          .then(async (rows) => {
            //situacao // é da empresa || Ativa ou Inativa
            //status // é do escritorio || Ativa ou Inativa
            return rows;

            /* if (rows) {
                result.status = true;
                result.msg = `Seja Bem-vindo ${await capitalize(rows.usuario)}`
                return rows;
            }
            if (!rows) {
                result.status = false;
                result.msg = 'Email informado não encontra-se cadastrado ou sua empresa está inativa.'
                return rows;
            } */
          }).catch((error) => {
            console.trace(error);
            return res.send(responseForRequest("Internal Error", false, true));
          });
      }

      const bcryptValidade = async (data) => {
        if (!data) {
          return res.send(responseForRequest("Email informado não encontra-se cadastrado ou sua empresa está inativa.", false));
        }

        if (data) {
          var isMatchPassword = null;
          if (data?.senha_de_acesso) {
            isMatchPassword = await bcrypt.compare(Senha, data.senha_de_acesso)
          }

          if (!isMatchPassword) {
            return res.send(responseForRequest("Credênciais inválidas!", false));
          }

          if (isMatchPassword) {
            delete data['senha_de_acesso'];
            /*ARMAZENAR TOKEN*/
            var ano = parseInt(moment(data.data_inicio).format('YYYY'))
            var mes = parseInt(moment(data.data_inicio).format('M') + '00')
            var dia = parseInt(moment(data.data_inicio).format('DD'))
            var tag = null;
            if (data?.nome_fantasia) tag = data.nome_fantasia.substring(0, 2)
            data.token = `${tag}${(ano + mes + dia)}`


            if (data.status != "Ativa") {
              return res.send(responseForRequest("Você não possui as permissões necessárias", false));
            }

            if (data.status == "Ativa") {
              //Colocando o Ip do Cliente na sessão
              var clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
              data.ip = clientIp.replace('::ffff:', '');
              //Atribuindo dados do cliente à sessão
              req.session.userData = data;
              console.log("dataqw ", data)
              return res.send(responseForRequest(`Seja Bem-vindo ${await capitalize(data.cliente)}`, true, null, {redirect:"/empresa/apps"}));

            }


          }


        }
      }
      bcryptValidade(await getDataLogin(Email));
    }
  } catch (error) {
    console.trace(error)
    //result.msg = "Credênciais inválidas!";
    res.send(responseForRequest("Internal Error", false, true));
  }
});


/* LOGOUT */
//-----------------------------------------------------------------------------------------------------------GET LOGOUT ENCERRAR SESSÃO
router.get("/sair", function (req, res) {
  req.session.destroy(function (error) {
    return res.redirect("/empresa");
  });
});




/* RENDER MENU APPS */
router.get("/apps", mustBeEmpresa, function (req, res) {
  var {id_empresa}= req.session.userData
  console.log("id_empresa wert ", id_empresa)
try{
return res.render("_empresa/Menu/Apps", {id_empresa})
}catch(error){
  console.trace(error.message)
}
});


/* RENDER NOTAS FISCAIS */
router.get("/notasfiscais", mustBeEmpresa, function (req, res) {
  try {
    var { cliente, administrador, root, nome_fantasia_escritorio, suporte } = req.session.userData;
    return res.render("./_empresa/Notas/notasfiscais", {
      cliente,
      nome_fantasia_escritorio,
      administrador,
      root,
      suporte,
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: true, msg: error.message });
  }
});


router.post("/buscar-notas", mustBeEmpresa, NotasController.buscarNotas)



module.exports = router;
