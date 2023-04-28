const bcrypt = require("bcrypt");
const { knexPostgre } = require("../../../../database/knex");
const mongoFunctions = require("../../../../database/mongoDB");
const sender = require("../../../../workers/email/senderToEffie");
const { responseForRequest } = require("../../../helpers/responseToRequest");
const emailRedirect = require("../../../../workers/email/redirect_links");

module.exports = {
  async request(req, res) {
    var { email_rec } = req.body;
    try {
      const emailAtivo = await knexPostgre("login_tbl_view")
        .withSchema("dbo")
        .select("email", "ativo")
        .where("email", email_rec)
        .then((rows) => {
          if (rows.length > 0) {
            if (rows[0].ativo == "SIM") {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        })
        .catch((error) => {
          console.log("APP ===>", error);
          return res.send(
            responseForRequest(
              "Houve um erro ao localizar suas credenciais.",
              false,
              true
            )
          );
        });
      console.log(">>>> Email ativo: ", emailAtivo);
      if (!emailAtivo) {
        console.log('>>>> IF DO EMAIL INATIVO');
        return res.send(responseForRequest("Sua credencial encontra-se inativa ou não existe.", false, true));
      }
      const validationHash = Math.random().toString(36).substring(2, 10);

      mongoFunctions
        .saveHashMongo(email_rec, validationHash, "Recuperação de Senha")
        .then(async (result) => {
          if (result) {

            var mailOptions = {
              subject: "Recuperar Senha - Notas Entrada Mezzomo",
              to: email_rec,
              from: "",
            };
            const reqHost = process.env.MAIL_HOST;
            const htmlPage = "recuperarSenha.html";
            const emailRedirectLink = `${reqHost}${emailRedirect.recuperarSenha}?hash=${validationHash}&email=${email_rec}`;
            const effieEndPoint = "/effie/escritorio/recuperar-senha";
            const senderToEffie = await sender.emailReady(
              mailOptions,
              htmlPage,
              emailRedirectLink,
              effieEndPoint
            );

            console.log()

            if (!senderToEffie) {
              console.log(
                "Não foi possivel enviar o email para o Effie ",
                senderToEffie
              );
              return res
                .status(200)
                .send(
                  responseForRequest(
                    "Não foi possivel enviar o email para o Effie",
                    false,
                    true
                  )
                );
            }
            return res
              .status(200)
              .send(
                responseForRequest(
                  "Um link de alteração foi enviado para seu email.",
                  true,
                  false
                )
              );
          } else {
            console.log(
              ">>>> Falha ao gravar hahs de recuperar senha no MONGO!"
            );
            return res
              .status(200)
              .send(
                responseForRequest("Falha ao gravar hash no Mongo", false, true)
              );
          }
        })
        .catch((error) => {
          console.log("APP ===>", error);
          res
            .status(200)
            .send(
              responseForRequest("Falha ao gravar hash no Mongo.", false, true)
            );
        });
    } catch (error) {
      console.log("APP ===>", error);
      return res.send(
        responseForRequest(
          "Houve um erro ao localizar suas credenciais.",
          false,
          true
        )
      );
    }
  },

  async renderPage(req, res) {
    var {hash, email} = req.query;

    if (!hash || !email){
        console.log('>>>> renderPage: hash ou email inválidos');
        const response = responseForRequest('Seu link pode ter sido modificado, parâmetros inválidos.', false, true);
        return res.render("./_escritorio/_Home/acesso", {response});
    }

      mongoFunctions.findHashMongo(email, hash).then(async (result) => {
        if (result) {
          try {
            await knexPostgre("login_tbl").withSchema("dbo")
              .select("usuario")
              .where("email", email)
              .limit(1)
              .then((rows) => {
                const rowsData = rows[0];
                if (rows.length == 0) {
                    return res.render('./_escritorio/_Home/acesso', {"response": responseForRequest('Seu email não possui cadastro!', false, true)});
                }

                const usuario = rowsData.usuario;
                return res.render("./_escritorio/_Home/alterarsenha", {
                  "email": email,
                  "hash": hash,
                  "usuario": usuario,
                  "response": responseForRequest('Seu cadastro foi validado com sucesso!', true, false)
                });

              })
              .catch((error) => {
                console.log("APP ===> renderPage: Erro ao buscar email no postgresql", error);
                return res.render('./_escritorio/_Home/acesso', {"response": responseForRequest('Houve um erro, tente novamente.', false, true)});

              });
          } catch (error) {
            console.log("APP ===> renderPage ", error);
            return res.render('./_escritorio/_Home/acesso', {"response": responseForRequest('Houve um erro, tente novamente.', false, true)});

          }
        } else {

          return res.render('./_escritorio/_Home/acesso', {"response": responseForRequest('O link perdeu a validade. Tente novamente.', false, true)});

        }
      });


  },

  async updatePassword(req, res) {
      //const post = req.body;

      const {hash, email, newpassok} = req.body;

      mongoFunctions.findHashMongo(email, hash).then(async (result) => {
        if (!result) {
            console.log('APP ===> updatePassword ,findHashMongo ', result);
            return res.status(200).send(
                responseForRequest(
                "Credênciais inválidas!",
                false,
                true
              ));

        }

          try {
            const encryptedPassword = await bcrypt.hash(newpassok, 12);
            knexPostgre("login_tbl").withSchema("dbo")
              .where("email", email)
              .update("senha", encryptedPassword)
              .then((rows) => {
                if (rows  == 0) {
                    console.log("APP ===> updatePassword, Senha não atualizada ");
                    return res.status(200).send(responseForRequest(
                        "Erro ao alterar sua senha. Seu usuário ou escritório não encontra-se ativo.", false, true
                    ));
                }
                mongoFunctions.deleteHashMongo(email, hash);
                console.log(
                    "APP ===> updatePassword, Senha recuperada com sucesso! email: ",
                    email
                  );
                  return res.send(responseForRequest("Senha alterada com sucesso!", true, false));


              })
              .catch((error) => {
                console.log("APP ===> updatePassword  ", error);
                return res.send(responseForRequest("Um erro inesperado ocorreu, por favor, tente novamente.", false, true ));
              });
          } catch (error) {
            console.log("APP ===> updatePassword, Erro catch atualizarsenha: ", error);
            return res.send(responseForRequest("Um erro inesperado ocorreu, por favor, tente novamente.", false, true ));

          }
      });

  },
};
