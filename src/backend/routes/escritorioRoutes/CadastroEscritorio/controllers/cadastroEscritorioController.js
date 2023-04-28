const moment = require("moment");
const bcrypt = require("bcrypt");
const { knexPostgre } = require("../../../../database/knex");
const { schemaCadastrarEscritorio } = require("../../../../workers/JOI/schemas");
const { Consulta_CNPJ } = require("../../../../database/sqlite/consulta_cnpj");
const {isValidCPF} = require('../../../helpers/validacaoCPF');
const { formatacoes} = require("../../../../APIs/DANFE/core/brasil/brazilian/brazilian");
const mongoFunctions = require("../../../../database/mongoDB");
const sender = require("../../../../workers/email/senderToEffie");
const { responseForRequest } = require("../../../helpers/responseToRequest");
const emailRedirect = require("../../../../workers/email/redirect_links");
const omie = require("../../../../APIs/OMIE");

const reqHost = process.env.MAIL_HOST;

module.exports = {
  async renderCadastrarEmpresa(req, res) {
    return res.render("./_escritorio/Escritorio/cadastrar-escritorio");
  },

  async efetuarCadastroEscritorio(req, res) {
    //Definição dos planos
    var prod1 = 0; /** @param prod1 = Robotax1 */
    var prod2 = 0; /** @param prod2 = Robotax2 */
    var prod3 = 0; /** @param prod3 = RobotaxFiscal */
    var prod4 = 0; /** @param prod4 = RobotaxDocs */
    var prod5 = 0; /** @param prod5 = RobotaxControl */

    var { cnpj, cpf, tipo_conta, nome_completo, razao_social, municipio } = req.body;
    console.log('>>> req.body inicio ', req.body, "\n\n");

    //cálculo para verificar se o cpf é válido
    const cpfValido = isValidCPF(cpf);
    if (!cpfValido){
      return res.status(200).send(responseForRequest("CPF inválido", false, true));
    }
    //Remoções de máscara
    if (cnpj) req.body.cnpj = formatacoes.removerMascara(cnpj);
    if (cpf) req.body.cpf = formatacoes.removerMascara(cpf);

    //Caso seja uma pessoa física se cadastrando
    if (tipo_conta === "pf") {
      if (!cnpj) {
        req.body.cnpj = req.body.cpf;
      }
      if (!razao_social) req.body.razao_social = nome_completo;
    }


    //se o front já faz a busca, precisa fazer no back tb?
    //caso seja uma pessoa jurídica, recuperando a cidade e estado através do cnpj
  /*   if (tipo_conta === "pj") {
      const consultaCnpj = Consulta_CNPJ(cnpj);
      if(consultaCnpj){
        req.body.municipio = consultaCnpj.municipio;
        req.body.uf = consultaCnpj.uf;
      }
    } */

    try {
      const { error, value } = schemaCadastrarEscritorio.validate(req.body);

      if (error) {
        console.log('>>>>> JOIError: ', error);
        return res.send(responseForRequest(error.message, false, true));
      }
      if (!error && value) {
        var {
          nome_completo,
          email,
          numero_contato,
          cnpj,
          razao_social,
          nome_fantasia,
          cep,
          endereco,
          numero_endereco,
          plano,
          formapagamento,
          cpf,
          tipo_conta,
          municipio,
          uf,
          website,
          bairro
        } = value;

        console.log("req.body>>>>> ", req.body);
        //Concatenando o endereco
        endereco = endereco.concat('| ', bairro, '| ', municipio, '| ', uf);
        console.log('>>>> Endereco concatenado', endereco);
        if (plano == "Robotax1") prod1 = 1;
        if (plano == "Robotax2") (prod1 = 1), (prod2 = 1);
        if (plano == "RobotaxFiscal") (prod1 = 1), (prod2 = 1), (prod3 = 1);
        if (plano == "RobotaxDocs") prod4 = 1;
        if (plano == "RobotaxControl") (prod1 = 1), (prod2 = 1), (prod5 = 1);

        if (!prod1 && !prod2 && !prod3 && !prod4 && !prod5) {
          return res.send(responseForRequest("Produtos inválidos", false, true));
        }

        //hash para o link do email, será usado após ser inserido no postgreslq
        const validationHash = Math.random().toString(36).substring(2, 10);
        const mongoReturn = await mongoFunctions.saveHashMongo(
          value.email,
          validationHash,
          "Envio confirmação de cadastro"
        );
        if (!mongoReturn) return res.send(responseForRequest("Erro ao gravar hash de validação de email no mongodb",false,true));
        const getdate = moment().format("YYYY-MM-DD HH:mm:ss.ms");

        var insertionObject = {
          nome_responsavel: nome_completo,
          email_responsavel: email,
          telefone: numero_contato,
          cpf_responsavel: cpf,
          cnpj: cnpj,
          nome_fantasia: nome_fantasia,
          razao_social: razao_social,
          endereco: endereco,
          cep: cep,
          numero: numero_endereco,
          data_inicio: getdate,
          forma_pagamento: formapagamento,
          status: "Inativa",
          plano: plano,
          prod1: prod1,
          prod2: prod2,
          prod3: prod3,
          prod4: prod4,
          prod5: prod5
        };

        knexPostgre("escritorios_tbl")
          .withSchema("dbo")
          .insert(insertionObject)
          .returning("id_escritorio")
          .then(returned_id => returned_id[0])
          .then(async (returned_id) => {
            if (returned_id) {
              var mailOptions = {
                subject: "Email de Confirmação - Notas Entrada Mezzomo",
                to: email,
                from: "",
              };
              const htmlPage = "validacaoCadastroEscritorio.html";
              const emailRedirectLink = `${reqHost}${emailRedirect.validacaoCadastroEscritorio}?hash=${validationHash}&email=${email}`;
              const effieEndPoint =
                "/effie/escritorio/enviar-email-confirmacao-escritorio";
              const EffieResponse = await sender.emailReady(
                mailOptions,
                htmlPage,
                emailRedirectLink,
                effieEndPoint
              );

             /*  var params = {
                identificacao: {
                  cCodInt: returned_id,
                  cNome: nome_fantasia,
                  cDoc: cnpj,
                  cObs: "Conta adicionada via API",
                  dDtReg: moment(getdate).format("DD/MM/YYYY"),
                  dDtValid: moment(getdate).add(2, 'M').format("DD/MM/YYYY"),
                },
                endereco: {
                  cEndereco: endereco,
                  cCEP: cep,
                  cCidade: municipio,
                  cUF: uf,
                  cPais: "Brasil",
                },
                telefone_email: {
                  cDDDTel: numero_contato.substring(1,3),
                  cNumTel: numero_contato.substring(5),
                  cEmail: email,
                  cWebsite: website || "",
                },
                tags: [
                  {"tag": "Inativo"}
                ]

              };

              console.log('>>>> obj PARAMS!!!! ', params);

              console.log('Cadastrando no omie')
              //Cadastro da Conta
              const cadastroEfetivoOmie = await omie.CadastroEfetivo(params, 'IncluirConta');
              console.log('Resultado do cadastro ', cadastroEfetivoOmie); */

              //Cadastro de Contato


              if (!EffieResponse) {
                console.log("Não foi possivel enviar o email para o Effie ", EffieResponse);
                return res.status(200).send(responseForRequest("Não foi possivel enviar o email para o Effie",false,true));
              }

              return res
                .status(200)
                .send(responseForRequest("Escritorio pré-cadastrado com sucesso",true,false)
                );
            }
              return res.status(200).send(responseForRequest("Falha no cadastro, CNPJ já está cadastrado no banco",false,true));

          })
          .catch(async (error) => {
            console.log("Erro ao inserir CNPJ, pois o mesmo é duplicado: ", error.message);

            if (
              error.message.includes("duplicate key value violates unique constraint")
            ) {
              console.log("Entrou no if do duplicates!!!!!");
              await knexPostgre
                .select("status")
                .from("escritorios_tbl")
                .withSchema("dbo")
                .where("cnpj", cnpj)
                .limit(1)
                .then(async (rows) => {
                  console.log(">>>> Rows :", rows[0].status);
                  console.log(">>>> length: ", rows.length);
                  if (!rows || rows.length == 0)
                    return res
                      .status(500)
                      .send(responseForRequest("Falha no cadastro, CNPJ já está cadastrado no banco",false,true));
                  if (rows[0].status == "Ativa") {
                    return res.send(responseForRequest("Empresa já está cadastrada",false,true));
                  }
                  await knexPostgre("escritorios_tbl")
                    .withSchema("dbo")
                    .update(insertionObject)
                    .where("cnpj", cnpj)
                    .returning('id_escritorio')
                    .then(returned_id => returned_id[0])
                    .then(async (returned_id) => {
                      if (!returned_id) return res.status(200).send(responseForRequest("Falha ao atualizar o cadastro da Empresa",false,true));

                      var mailOptions = {
                        subject: "Email de Confirmação - Notas Entrada Mezzomo",
                        to: email,
                        from: "",
                      };

                      const htmlPage = "validacaoCadastroEscritorio.html";
                      const emailRedirectLink = `${reqHost}${emailRedirect.validacaoCadastroEscritorio}?hash=${validationHash}&email=${value.email}`;
                      const effieEndPoint =
                        "/effie/escritorio/enviar-email-confirmacao-escritorio";
                      const EffieResponse = await sender.emailReady(
                        mailOptions,
                        htmlPage,
                        emailRedirectLink,
                        effieEndPoint
                      );

                    /*   console.log('Alterando cadastro no no omie')
                      const cadastroEfetivoOmie = await omie.CadastroEfetivo(params, 'AlterarConta');
                      console.log('Resultado do cadastro ', cadastroEfetivoOmie); */
                      if (!EffieResponse) {
                        return res
                          .status(200)
                          .send(responseForRequest("Falha ao enviar email", false, true)); /*  */
                      }
                      return res
                        .status(200)
                        .send(responseForRequest("Empresa pré-cadastrada!",true,false));
                    })
                    .catch((error) => {
                      return res.send(error.message);
                    });
                })
                .catch(async (error) => {
                  console.log("Erro no update", error.msg);
                  return res.send(responseForRequest("Falha ao atualizar o CNPJ", false, true));
                });
            }
          });
      }
    } catch (error) {
      console.log(error);
      return res.send(responseForRequest("Erro interno do servidor!", false, true)
      );
    }
  },

  async hashAuthentication(req, res, next) {
    console.log(">>>> Entrou no hashAuthentication ", req.query);
    const { email, hash } = req.query;
    const exists = await mongoFunctions.findHashMongo(email, hash);

    if (!exists) {
      console.log(">>>> error_hash_expirado.html");
      return res.render("./Error/error_hash_expirado.html");
    }
    console.log(">>>> next()");
    return next();
  },

  async renderCadastrarSenhaAdmEscritorio(req, res) {
    if (!req.query?.email) return res.render("./Error/500");
    var { email } = req.query;
    console.log("Email no cad adm: ", email);
    const retornoQuery = await knexPostgre("escritorios_tbl")
      .withSchema("dbo")
      .select("id_escritorio")
      .where("email_responsavel", email)
      .limit(1)
      .then((rows) => {
        if (rows?.length > 0) {
          return rows[0];
        }
        return false;
      });

    console.log(
      ">>> renderCadastrarSenhaAdmEscritorio retorno query \n",
      retornoQuery
    );

    if (!retornoQuery) {
      console.log("Deu erro no retorno da query,", retornoQuery);
      return res.render("./Error/500");
    }
    var id_escritorio = retornoQuery.id_escritorio;
    return res.render("./_escritorio/Escritorio/cadastrar_adm_escritorio", {
      email_responsavel: email,
      id_escritorio: id_escritorio,
    });
  },

  async cadastrarAdmEscritorio(req, res) {
    var { cnpj, nome_usuario, senha, id_escritorio, email_responsavel } =
      req.body;
    va = {};

    console.log(">>>> Email ", email_responsavel);
    console.log(">>>> CNPJ   ", cnpj);


    var paramsParaContaOmie;
    var paramsParaContatoOmie;

    try {
      cnpj = formatacoes.removerMascara(cnpj);
      senha = await bcrypt.hash(senha, 12);
      const resultadoQueryEscritorio = await knexPostgre("escritorios_tbl")
        .withSchema("dbo")
        .where("cnpj", cnpj)
        .andWhere("email_responsavel", email_responsavel)
        .limit(1)
        .then(async (rows) => {
          //console.log(">>>> Row ", rows);
          if (!rows) return false;
          if (rows.length == 0) return false;

          console.log(">>>>> ROWS[0]!!!! ", rows[0]);
          //montar o objeto de inserção no omie

          //split do endereco
          let enderecoArray = rows[0].endereco.split("|");
          let endereco = enderecoArray[0].trim();
          let bairro = enderecoArray[1].trim();
          let municipio = enderecoArray[2].trim();
          let uf = enderecoArray[3].trim();
          let getdate = moment().format("YYYY-MM-DD HH:mm:ss.ms");
          let dddTelefone = rows[0].telefone.substring(1,3);
          let numTelefone = rows[0].telefone.substring(5);
          paramsParaContaOmie = {
            identificacao: {
              cCodInt: rows[0].id_escritorio,
              cNome: rows[0].razao_social,
              cDoc: rows[0].cnpj,
              cObs: "Conta adicionada via API",
              dDtReg: moment(getdate).format("DD/MM/YYYY"),
              dDtValid: moment(getdate).add(2, 'M').format("DD/MM/YYYY"),
            },
            endereco: {
              cEndereco: endereco,
              cBairro: bairro,
              cCEP: rows[0].cep,
              cCidade: municipio,
              cUF: uf,
              cPais: "Brasil",
            },
            telefone_email: {
              cDDDTel: dddTelefone,
              cNumTel: numTelefone,
              cEmail: rows[0].email_responsavel,
              cWebsite: rows[0].website || "",
            },
            tags: [
              {"tag": "Ativo"}
            ]

          };



          let nomeArray = rows[0].nome_responsavel.split(" ");
          let nomeContato= nomeArray[0];
          let sobrenomeContato = nomeArray.slice(1, nomeArray.length).join(' ');
          paramsParaContatoOmie = {
            identificacao: {
              cCodInt: rows[0].id_escritorio,
              cNome: nomeContato,
              cSobrenome: sobrenomeContato,
              cCargo: "Proprietário Administrativo"
            },
            endereco: {
              cEndereco: endereco,
              cBairro: bairro,
              cCEP: rows[0].cep,
              cCidade: municipio,
              cUF: uf,
              cPais: "Brasil",
            },
            telefone_email: {
              cDDDTel: dddTelefone,
              cNumTel: numTelefone,
              cEmail: rows[0].email_responsavel,
              cWebsite: rows[0].website || "",
            }
          };

          return true;
        });

      if (!resultadoQueryEscritorio) {
        return res.send(responseForRequest("CNPJ inválido!", false, true));
      }

      await knexPostgre("login_tbl")
        .withSchema("dbo")
        .insert({
          usuario: nome_usuario,
          senha: senha,
          email: email_responsavel,
          id_escritorio: id_escritorio,
          ativo: "SIM",
          administrador: "SIM",
          conta_escritorio: true
        })

        .then(async (rows) => {
          if (rows.rowCount > 0) {
            //atualizar status para Ativo em  empresas_tbl
            const updatedRows = await knexPostgre("escritorios_tbl")
              .withSchema("dbo")
              .update("status", "Ativa")
              .where("cnpj", cnpj);
            console.log("Retorno da query de updated Rows ", updatedRows);
            if (updatedRows > 0) {
              mongoFunctions.deleteHashMongo(email_responsavel);
            }
            //CADASTRO de Conta e Contato no omie
            omie.CadastroEfetivo(paramsParaContaOmie, 'IncluirConta');
            omie.cadastroContato(paramsParaContatoOmie);

            return res.send(responseForRequest("Cadastro realizado com sucesso!", true, false));
          } else {
            return res.send(responseForRequest("Falha no cadastro, CNPJ já está cadastrado no banco",false,true));
          }
        });
    } catch (error) {
      console.log("Err cadastrarAdmEscritorio: ", error);
      return res.send(responseForRequest("Falha no cadastro, CNPJ já está cadastrado no banco",false,true));
    }
  },
};
