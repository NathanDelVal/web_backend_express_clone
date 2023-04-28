var fs = require("fs");
const crypto = require("crypto");
const { knexPostgre } = require("../../../../database/knex");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { responseForRequest } = require("../../../helpers/responseToRequest");

module.exports = {
  async renderConfirmarCadastroUsuario(req, res) {
    var { email } = req.query;
    if (!email) return res.send(responseForRequest("Parâmetro inválido", false, true));

    /* const resultadoQuery = await knexPostgre('').withSchema('dbo')
        .select('email', 'ativo')
        .where('email', email) */
    console.log("Entrou no render: renderConfirmarCadastroUsuario");
    var loginAtivo = "";
    try {
      var emailExiste = await knexPostgre("login_tbl")
        .withSchema("dbo")
        .select()
        .where("email", email)
        .limit(1)
        .then((rows) => {
          console.log(">>>> Rows!!! ", rows);
          if (!rows) return false;

          console.log(">>> rows.length ", rows.length);
          if (rows.length > 0) {
            rows = rows[0];
            console.log(">>>> rows.ativo ", rows.ativo);
            loginAtivo = rows.ativo;
            return true;
          }
          return false;
        })
        .catch((error) => {
          console.log("Erro ", error.message);
          return res.render("./_escritorio/ConfirmacaoCadastro/confirmar-cadastro-usuario",{"response": responseForRequest("Falha ao buscar dados", false, true)});
        });

      console.log("emailExiste ", emailExiste);
      console.log("loginAtivo", loginAtivo);
      //esoerando as páginas para renderizar os erros
      if (!emailExiste) {
        console.log(">>>> renderConfirmarCadastroUsuario: Email não existe ");
        //return res.send("Email Não existe");
        return res.render("./_escritorio/ConfirmacaoCadastro/confirmar-cadastro-usuario", { "response":  responseForRequest("Email inválido", false, true)} );
      }

      if (emailExiste && loginAtivo === "SIM") {
        console.log(">>>> renderConfirmarCadastroUsuario: Email não existe ");
        //return res.send("Email existe, porém já está ativo");
        return res.render("./_escritorio/ConfirmacaoCadastro/confirmar-cadastro-usuario", { "response":  responseForRequest("Email já está com login ativo", false, true)} );
      }
    } catch (error) {
      console.log("Erro ", error.message);
      return res.render("./_escritorio/ConfirmacaoCadastro/confirmar-cadastro-usuario",{"response": responseForRequest("Falha ao buscar dados", false, true)});
    }
    console.log(">>>> renderConfirmarCadastroUsuario ", email);
    return res.render("./_escritorio/ConfirmacaoCadastro/confirmar-cadastro-usuario", { "email": email,
                                                                            "response":  responseForRequest("Email pronto para validação", true, false) });
  },

  async confirmarCadastroUsuario(req, res) {
    var result = { msg: "", redirect: "" };
    var {
      input_usuario,
      input_pass,
      input_email,
      input_pass_validate,
      input_token,
    } = req.body;
    input_token = input_token.toLowerCase();

    if (
      !input_usuario ||
      !input_pass ||
      !input_email ||
      !input_pass_validate ||
      !input_token
    ) {
      console.log(
        ">>>> confirmarCadastroUsuario: Algum campo inválido do formulário ",
        input_usuario,
        input_pass,
        input_email,
        input_pass_validate,
        input_token
      );
      return res
        .status(200)
        .send(responseForRequest("Formulário incompleto!", false, true));
    }

    if (input_pass != input_pass_validate) {
      console.log(
        ">>>> confirmarCadastroUsuario: senhas diferentes ",
        input_pass,
        input_pass_validate
      );
      return res
        .status(200)
        .send(responseForRequest("As senhas são diferentes!", false, true));
    }

    const encryptedPassword = await bcrypt.hash(input_pass, 12);
    //console.log("senha: ", encryptedPassword)
    try {
      knexPostgre("login_tbl_view")
        .withSchema("dbo")
        .select("id_login", "email", "ativo", "data_inicio", "nome_fantasia")
        .where("email", input_email)
        //.andWhere("ativo", "!=", "SIM")
        .then((rows) => {
          rows = rows[0];
          //var rowsAffected = rows.length;
          console.log(">>>> rows!!!! ", rows);
          if (!rows)
            return res
              .status(200)
              .send(
                responseForRequest("Você não possui pré-cadastro", false, true)
              );
          if (rows.length == 0)
            return res
              .status(200)
              .send(
                responseForRequest("Você não possui pré-cadastro", false, true)
              );

          if (rows.ativo == "SIM")   return res.status(200).send(responseForRequest("Cadastro não realizado. Usuário encontra-se com login ativo.", false, true)
          );
          console.log("ativoooo ? ", rows.ativo);

          //verificar se o token está correto aqui antes de prosseguir

          /*VALIDAR TOKEN*/
          var ano = parseInt(moment(rows.data_inicio).format("YYYY"));
          var mes = parseInt(moment(rows.data_inicio).format("M") + "00");
          var dia = parseInt(moment(rows.data_inicio).format("DD"));
          var tag = rows.nome_fantasia.substring(0, 2);
          var tokenCorreto = `${tag}${ano + mes + dia}`;

          if (input_token !== tokenCorreto) {
            console.log(
              "tipos das variaveis: ",
              typeof input_token,
              typeof tokenCorreto
            );
            console.log(
              ">>>> confirmarCadastroUsuario: Token incorreto",
              input_token,
              tokenCorreto
            );
            return res
              .status(200)
              .send(
                responseForRequest("O token informado é invalido!", false, true)
              );
          }
          const userid = rows.id_login;
          knexPostgre("login_tbl")
            .withSchema("dbo")
            .where({
              email: input_email,
              id_login: userid,
            })
            .update({
              usuario: input_usuario,
              senha: encryptedPassword,
              ativo: "SIM",
            })
            .then((rows) => {
              rowsAffected = rows;
              console.log("confirmarCadastroUsuario: Rows ", rows);
              //result.msg = "Cadastro confirmado com sucesso!";
              result.redirect = `/acesso`;
              //return res.send(result);
              return res
                .status(200)
                .send(
                  responseForRequest(
                    "Cadastro confirmado com sucesso!",
                    false,
                    true
                  )
                );
            });
        })
        .catch((error) => console.log("APP ===>", error));
    } catch (error) {
      return res.status(404);
    }
  },
};
