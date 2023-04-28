const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { knexPostgre } = require("../../../database/knex");
const httpOrigin = process.env.MAIL_HOST;
const httpOriginPort = process.env.PORT;
const {
  saveHashMongo,
  findHashMongo,
  deleteHashMongo,
} = require("../../../database/mongoDB");
const { dispatchEmail } = require("../../helpers/smtp");

const givemeaHash = async (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len); // return required number of characters
};

const reqAdress = {
  validacaoCadastroEscritorio: "/verificarcadastro",
  validacaoCadastroUsuario:
    "/cadastro-usuario/paginapage-confirmar-cadastro-usuario",
  recuperarSenha: "/alterarsenha",
};

module.exports = {
  async request(req, res) {
    var { email_rec } = req.body;
    const consultaAtivo = async () => {
      return knexPostgre("dbo.login_tbl_view")
        .select("email", "ativo")
        .where("email", email_rec)
        .then((rows) => {
          if (rows.length != 0) {
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
        });
    };
    try {
      await consultaAtivo().then(async (result) => {
        if (result) {
          const hash = await givemeaHash(12);
          saveHashMongo(email_rec, hash, "Recuperação de Senha").then(
            async (result) => {
              if (result) {
                const subject = "Email de Confirmação - Notas Entrada Mezzomo";
                const htmlPage = "recuperarSenha.html";
                const reqHost = httpOrigin; //req.get('host');
                const redirectLink = `${reqHost}${reqAdress.recuperarSenha}?id=${hash}&email=${email_rec}`;
                const envioResp = await dispatchEmail(
                  email_rec,
                  subject,
                  htmlPage,
                  redirectLink,
                  req
                );
                if (envioResp) {
                  return res.send(
                    "Um link de alteração foi enviado para seu email."
                  );
                } else {
                  console.log("envioResp erro: ", envioResp);
                }
              } else {
                console.log("Erro ao gravar no Mongodb");
              }
            }
          );
        } else {
          return res.send("Sua credencial encontra-se inativa ou não existe.");
        }
      });
    } catch (error) {
      console.log("APP ===>", error);
    }
  },

  async renderPage(req, res) {
    const chave_cliente = req.query.id;
    const email = req.query.email;

    var requestHost = `${req.protocol}://${req.get("host")}`;
    if (
      requestHost == httpOrigin ||
      (requestHost == `http://localhost:${httpOriginPort}` && chave_cliente)
    ) {
      //console.log("Domain is matched. Information is from Authentic email redirect");
      //verificar se o token existe no mongo
      findHashMongo(email, chave_cliente).then(async (result) => {
        if (result) {
          try {
            knexPostgre("dbo.login_tbl")
              .select("usuario")
              .where("email", email)
              .then((rows) => {
                const rowsData = rows[0];
                if (rows.length != 0) {
                  const usuario = rowsData.usuario;
                  return res.render("./_escritorio/_Home/alterarsenha", {
                    email,
                    chave_cliente,
                    usuario,
                  });
                } else {
                  res.end();
                }
              })
              .catch((error) => {
                console.log("APP ===>", error);
              });
          } catch (error) {
            console.log("APP ===>", error);
          }
        } else {
          var msgError = "Seu email não possui cadastro";
          return res.render("acesso", { msgEmail: msgError });
        }
      });
    } else {
      //console.log("enviei issss")
      var msgError = "O link perdeu a validade. Tente novamente.";
      return res.render("acesso", { msgEmail: msgError });
    }
  },

  async updatePassword(req, res) {
    try {
      const post = req.body;
      const chave_cliente = post.chave_cliente;
      const email = post.email;
      const nova_senha = post.newpassok;

      findHashMongo(email, chave_cliente).then(async (result) => {
        if (result) {
          deleteHashMongo(email, chave_cliente);
          try {
            const encryptedPassword = await bcrypt.hash(nova_senha, 12);
            knexPostgre("dbo.login_tbl_view")
              .where("email", email)
              .update("senha", encryptedPassword)
              .then((rows) => {
                rowsAffected = rows;
                if (rowsAffected > 0) {
                  console.log(
                    "APP ===> Senha recuperada com sucesso! email: ",
                    email
                  );
                  return res.send("Senha alterada com sucesso!");
                } else {
                  return res.send(
                    "Erro ao alterar sua senha. Seu usuário ou escritório não encontram-se ativos."
                  );
                }
              })
              .catch((error) => {
                console.log("APP ===>", error);
                res.status(500);
              });
          } catch (error) {
            console.log("Erro catch atualizarsenha:", error);
            var msgError =
              "Ocorreu um erro na sua solicitação, tente novamente.";
            return res.render("acesso", { msgEmail: msgError });
          }
        }
      });
    } catch (error) {
      var msgError = "Ocorreu um erro na sua solicitação, tente novamente.";
      return res.render("acesso", { msgEmail: msgError });
    }
  },
};
