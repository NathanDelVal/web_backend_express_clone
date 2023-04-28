const hbs = require("hbs");
const moment = require("moment");
const crypto = require("crypto");
const { knexPostgre } = require("../../../../database/knex");
const fs = require("fs");
const { getDefaultSettings } = require("http2");
const JSONfilename = "./storage/SupportMSG/SupportChat.json";
const {
  saveSocketMsgMongo,
  getChatMongo,
  deleteChamadoMongo,
} = require("../../../../database/mongoDB");

module.exports = {
  async getChatChamado(req, res) {
    //console.log("-> getChatChamado(req, res)")
    var { usuario, email } = req.session.userData;

    var { hashChat } = req.body;

    var ActualChat = await getChatMongo(email, hashChat);
    return res.send({ ActualChat });
  },

  async getChamados(req, res) {
    var email = req.session.userData.email;
    var usuario = req.session.userData.usuario;
    var flagResposta = 0;

    knexPostgre("dbo.chamados_tbl")
      .select(
        "id_chamado",
        "numerochamado",
        "assunto",
        "tipo",
        "descricao",
        "status",
        "respondidopor",
        "usuarioemail",
        "resposta",
        "usuarionome",
        "inserido",
        "prioridade"
      )
      .where("usuarioemail", email)
      .andWhereNot("status", "Fechado")
      .then((rows) => {
        var dataTableChamados = rows.map(function (saida) {
          saida.inserido = moment(saida.inserido, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          );
          return saida;
        });
        dataTableChamados = JSON.stringify(dataTableChamados);

        return res.send({
          dataTableChamados,
          email,
          flagResposta,
        });
      })
      .catch((error) => {
        console.log("APP ===>", error);
      });
  },

  async createChamado(req, res) {
    var { usuario, email } = req.session.userData;

    var { assunto, descricao, tipo } = req.body;

    var status = "Aberto";
    var numeroPrioridade = "";

    function givemeaHash(len) {
      return crypto
        .randomBytes(Math.ceil(len / 2))
        .toString("hex") // convert to hexadecimal format
        .slice(0, len); // return required number of characters
    }
    var HashNumeroChamado = "CH#" + givemeaHash(12);

    if (tipo == "Problema na página") {
      numeroPrioridade = 3;
    }
    if (tipo == "Tributação") {
      numeroPrioridade = 2;
    }
    if (tipo == "Dúvidas") {
      numeroPrioridade = 0;
    }
    if (tipo == "Outros") {
      numeroPrioridade = 1;
    }

    const createChat = async () => {
      if (HashNumeroChamado && email) {
        saveSocketMsgMongo(email, HashNumeroChamado);
      } else {
        console.log("ERRO AO CRIAR CHAT DE SUPORTE NO MONGO DB");
      }
    };

    if (
      assunto != undefined &&
      descricao != undefined &&
      tipo != undefined &&
      assunto != "" &&
      descricao != "" &&
      tipo != ""
    ) {
      try {
        let getdate = new moment().format("YYYY-MM-DD HH:mm:ss.ms");
        knexPostgre("dbo.chamados_tbl")
          .insert({
            numerochamado: HashNumeroChamado,
            assunto: assunto,
            tipo: tipo,
            descricao: descricao,
            status: status,
            respondidopor: "",
            resposta: "",
            inserido: getdate,
            modificado: getdate,
            usuarionome: usuario,
            usuarioemail: email,
            prioridade: numeroPrioridade,
          })
          .returning("id_chamado")
          .into("dbo.chamados_tbl")
          .then((id_chamado) => {
            let rowsAffected = id_chamado;
            if (rowsAffected > 0) {
              createChat();
              return res.send(
                "Chamado aberto com sucesso! Já estamos verificando como podemos ajudar."
              );
            } else {
              return res.send(
                "Erro ao abrir ao abrir chamado. Tente novamente!"
              );
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } catch (error) {
        console.log("APP ===>", error);
      }
    } else {
      return res.send("Não foi possivel abrir seu chamado. Tente novamente!");
    }
  },

  async sendChat(req, res) {
    console.log("CHEGOU MSG DO CLIENTE ", req.body);
    if (req.method == "POST") {
      var usuario = req.session.userData.usuario;
      var newMsg = req.body.newMsg;
      var nchamado = req.body.numeroChamado;
      if (newMsg != "" && newMsg != undefined) {
        var SupportChat = "";

        /*
                JsonRW.readFilePromise(JSONfilename).then(data => {
                    SupportChat = JSON.parse(data);
                    SupportChat[usuario][nchamado].push(newMsg)
                    //fs.writeFileSync('./storage/SupportMSG/SupportChat.json', SupportChatUpdated);
                }).then(function () {
                    JsonRW.writeFilePromise(JSONfilename, JSON.stringify(SupportChat))
                }).then(function () {
                    return res.status(201).send('Chat Salvo')
                });
            } else {
                return res.status(422)
            */
      }
    } else {
      return res.status(400);
    }
  },

  async closeChamado(req, res) {
    if (req.method == "POST") {
      var usuario = req.session.userData.usuario;
      var email = req.session.userData.email;
      var numeroChamado = req.body.numeroChamado;
      console.log("numeroChamado ", numeroChamado);
      if (usuario && numeroChamado) {
        try {
          let getdate = new moment().format("YYYY-MM-DD HH:mm:ss.ms");
          knexPostgre("dbo.chamados_tbl")
            .where("numerochamado", numeroChamado)
            .update({
              Status: "Fechado",
              Prioridade: "0",
              Modificado: getdate,
            })
            .then((rows) => {
              var rowsAffected = rows;

              if (rowsAffected > 0) {
                if (email && numeroChamado) {
                  deleteChamadoMongo(email, numeroChamado);
                  console.log(
                    "close chamado -> [nome do usuário: " +
                      email +
                      ", chamado: ",
                    numeroChamado + "]"
                  );
                } else {
                  console.log("erro ao fechar chamado ");
                }

                //REMOVENDOCHAT ENCERRADO DO JSON
                /*

                fs.readFile('./storage/SupportMSG/SupportChat.json', (error, data) => {
                if (error) return res.status(500);
                let SupportChat = JSON.parse(data);

                const deleteChat = async () => {
                delete SupportChat[usuario][numeroChamado];
                return SupportChat;
                }
                const ReescreverJSON = async () => {
                let SupportChatUpdated = JSON.stringify(SupportChat);
                fs.writeFileSync('./storage/SupportMSG/SupportChat.json', SupportChatUpdated);
                }

                (async function () {
                ReescreverJSON(await deleteChat());
                })();
                });
                */

                return res.send("Chamado encerrado com sucesso. Obrigado!");
              } else {
                return res.send("Erro ao encerrar chamado, tente novamente.");
              }
            })
            .catch((error) => {
              console.log("APP ===>", error);
              return res.status(500);
            });
        } catch (error) {
          return res.status(500);
        }
      }
    }
  },

  async getNewMsg(req, res) {
    var email = req.session.userData.email;
    var UserName = req.session.userData.usuario;

    var SupportChat;
    var file = "./storage/SupportMSG/SupportChat.json";

    //Refatorar, a leitura deve ser feita no Mongo DB
    const readFilePromise = (JSONfilename) =>
      new Promise((resolve, reject) => {
        fs.readFile(JSONfilename, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

    readFilePromise(file)
      .then((data) => {
        SupportChat = JSON.parse(data);
        SupportChat = SupportChat[UserName];
      })
      .then(function () {
        try {
          return res.send({
            SupportChat,
          });
        } catch (error) {
          console.log("APP ===>", error);
        }
      });
  },
};
