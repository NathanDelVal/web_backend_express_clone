const express = require("express");
const router = express.Router();
var fs = require("fs");
const util = require("util");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { knexPostgre } = require("../../../database/knex");
const VerifyBadgeSuporteMSG = require("../../../routes/escritorioRoutes/VerifyBadgeSupporteMSG");
const { schemaCriarAcumulador } = require('../../../workers/JOI/schemas');
const { formatacoes } = require("../../../APIs/DANFE/core/brasil/brazilian/brazilian");
const { responseForRequest } = require("../../../routes/helpers/responseToRequest");

async function dateRowsAdjustments(rows) {
  return await rows.map(function (row) {
    if (row.expiration_date) {
      row.expiration_date = moment(row.expiration_date, "YYYY-MM-DD").format(
        "DD/MM/YYYY"
      );
    }
    return row;
  });
}

async function RowsAdjustments(rows) {
  if (rows) {
    if (rows.length > 0) {
      return await rows.map(function (row) {
        if (row.title != "cfop_entrada") {
          //Text Capitalize
          row.originaltitle = row.title;
          row.originalvalue = row.value;
          if (row.title) {
            row.title = row.title
              .replace(/_/g, " ")
              .toLowerCase()
              .trim()
              .toLowerCase()
              .replace(/\w\S*/g, (w) =>
                w.replace(/^\w/, (c) => c.toUpperCase())
              );
          }

          if (row.value) {
            var aux = row.value.replace(/,/g, "."); //ex: "1,5432" -> "1,5432"
            row.value = `${(parseFloat(aux) * 100).toFixed(2)}%`; //ex: "1,5432" -> "154.32%"
          }
        }
        if (row.title == "cfop entrada") {
          if (row.value) {
            row.title = row.title.replace(/_/g, " ").toLowerCase();
          }
        }
        return row;
      });
    } else {
      return []
    }
  } else {
    return []
  }

};

module.exports = {

  async renderPage(req, res) {
    var { administrador, root, nome_fantasia, suporte, email, plano, erp } = req.session.userData;
    if (administrador == "SIM" || root == "SIM") {
      VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
      try {
        return res.render("./_escritorio/_EndUser/empresas",
          {
            administrador,
            root,
            suporte,
            email,
            nome_fantasia,
            plano
          });

      } catch (error) {
        console.log(" ClienteController, linha 100 ", error);
        return res.send().status(500);
      }
    } else {
      return res.redirect("/acesso");
    }
  },

  async requestCreate(req, res) {
    var { usuario, administrador, root, nome_fantasia, suporte, erp } = req.session.userData;
    if (administrador == "SIM" || root == "SIM") {
      try {
        var dataTable;
        knexPostgre("dbo.empresas_tbl_view")
          .select(
            "id_empresa",
            "cliente",
            "cnpj",
            "situacao",
            "fone",
            "email_empresa",
            "regime_tributario",
            "unidade",
            "nome_fantasia",
            "expiration_date",
            "erp"
          )
          .where("nome_fantasia", nome_fantasia)
          .orderBy("cliente", "asc")
          .then((rows) => {
            dateRowsAdjustments(rows).then((dataok) => {
              dataTable = JSON.stringify(dataok)
              return res.send({ dataTable });
            });

          });
      } catch (error) {
        console.log("APP ===>", error);
        return res.send().status(500)
      }
    } else {
      return res.redirect("/acesso");
    }
  },

  async updateSingle(req, res) {
    console.log("updateSingle cliente ")
    try{
      var { nome_fantasia, id_escritorio } = req.session.userData;
            var { id_item, cliente, cnpj, unidade, regime, email_empresa, fone, situacao, senha_empresa, senhaCertificado, fileName } = req.body;
            console.log("fileName @@@@@@@@@@@@@@@  ",fileName);
            const updateKnex = async (fileName) => {
                /*  O update do banco está sendo feito aqui pois somente depois
                 de atualizar os dados no banco que devemos gravar os dados no S3  */
                 console.log("updateKnex okokok")
                 if(!fileName) console.log("Update sem fileName");
                try {
                    var obj2Update = {};
                    if (cliente) obj2Update.cliente = cliente;
                    //if (cnpj) obj2Update.cnpj = cnpj   //não permitimos atualizar o CNPJ;
                    if (unidade) obj2Update.unidade = unidade;
                    if (regime) obj2Update.regime_tributario = regime;
                    if (email_empresa) obj2Update.email_empresa = email_empresa;
                    if (fone) obj2Update.fone = fone;
                    if (situacao) obj2Update.situacao = situacao;
                    if (senhaCertificado) obj2Update.senhacertificado = senhaCertificado.trim(); //.replace(/\s/g, "")
                    if (fileName) obj2Update.nomecertificado = fileName.replace(/\.pfx/g, ''); //Gravar no banco sem ".pfx"
                    if (senha_empresa) obj2Update.senha_de_acesso = await bcrypt.hash(senha_empresa, 12);

                    if (Object.entries(obj2Update).length == 0) return false;
                    return await knexPostgre('empresas_tbl').withSchema('dbo')
                        .where('id_empresa', id_item)
                        .update(obj2Update)
                        .returning('id_empresa')
                        .into('empresas_tbl')
                        .then((id_empresa) => {
                            console.log("multer id_empresa -> ",id_empresa)
                            if (!id_empresa || id_empresa == 0) return false;
                            if (id_empresa > 0) return true;
                        }).catch((error) => {
                          console.log(error.message)
                          throw new Error(error.message);
                        });
                } catch (error) {
                  console.log(error.message)
                  throw new Error(error.message);
                }

            }

            if (!Array.isArray(cliente)) {
              const isUpdated = await updateKnex(fileName);
                if (!isUpdated) return res.send("Erro ao gravar novos dados!");
                if (isUpdated) return res.send("Dados atualizados!");

            }else{
              throw new Error("Param 'cliente' é um Array")
            }
          }catch(error){
            console.log("APP====>", error.message)
          }
  },

  /* rota para atualizar tributações */
  async updateTributacoes(req, res) {
    var { administrador, root, nome_fantasia, id_escritorio } = req.session.userData;
    var {
      acumuladores_antecipado_entrada,
      acumuladores_antecipado_especial,
      acumuladores_cesta_basica,
      acumuladores_credito_presumido,
      acumuladores_isento,
      acumuladores_medicamento,
    } = req.body;

    var objectTributacoesUpdate = {};

    if (acumuladores_antecipado_entrada) {
      objectTributacoesUpdate.acumuladores_antecipado_entrada =
        acumuladores_antecipado_entrada;
    }

    if (acumuladores_antecipado_especial) {
      objectTributacoesUpdate.acumuladores_antecipado_especial =
        acumuladores_antecipado_especial;
    }

    if (acumuladores_cesta_basica) {
      objectTributacoesUpdate.acumuladores_cesta_basica_tributario =
        acumuladores_cesta_basica;
    }

    if (acumuladores_credito_presumido) {
      objectTributacoesUpdate.acumuladores_credito_presumido =
        acumuladores_credito_presumido;
    }

    if (acumuladores_isento) {
      objectTributacoesUpdate.acumuladores_isento = acumuladores_isento;
    }

    if (acumuladores_medicamento) {
      objectTributacoesUpdate.acumuladores_medicamento =
        acumuladores_medicamento;
    }

    try {
      /*
      knexPostgre('empresas_tbl')
      .where('id_empresa', id_item)
      .update(obj2Update)
      .returning('id_empresa')
      .into('empresas_tbl')
      .then((id_empresa) => {
        console.log("id_empresa linha afetada $ ", id_empresa)
        if (id_empresa > 0) {
          return res.send("Dados atualizados!")
        } else {
          return res.send("Erro ao gravar novos dados!")
        }
      }).catch((error) => {
        console.log(error);
      });

      */
    } catch (error) {
      console.log("APP ===>", error);
    }
  },

  async updateMulti(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario } = req.session.userData;

    if (req.method == "POST") {
      if (administrador == "SIM") {
        var { ids_multiplos, situacao, regime } = req.body;
        //console.log(formdados)
        //var ids_multiplos = formdados.ids_multiplos
        let arrayId = new Array();
        arrayId = ids_multiplos.split(",");
        //var situacao = formdados.situacao
        //var regime = formdados.regime
        //var form_unidade = formdados.unidade
        if (ids_multiplos) {
          var obj2Update = {};
          if (situacao) {
            obj2Update.situacao = situacao;
          }
          if (regime) {
            obj2Update.regime_tributario = regime;
          }
          if (Object.entries(obj2Update).length !== 0) {
            try {
              knexPostgre("empresas_tbl_view").withSchema('dbo')
                .whereIn("id_empresa", arrayId)
                .andWhere("nome_fantasia", nome_fantasia)
                .update(obj2Update)
                .then((rows) => {
                  if (rows > 0) {
                    return res.send("Dados atualizados!");
                  } else {
                    return res.send("Erro ao gravar novos dados!");
                  }
                })
                .catch((error) => {
                  console.log("ClientesController, linha 352 ", error);
                  return res.send().status(500)
                });
            } catch (error) {
              console.log("APP ===>", error);
            }
          } else {
            return res.send("Erro ao gravar novos dados!");
          }
        }
      } else {
        return res.send("Você não possui as permissões necessárias!");
      }
    } else {
      return res.redirect("/acesso");
    }
  },

  async efetuarCadastroEmpresa(req, res) {
    /* var { administrador, root, nome_fantasia } = req.session.userData;
    var { cnpj, cliente, senhacert, unidade, regime, email_empresa, fone, situacao } = req.body; */
    console.log("SAIU DO MULTER -> finally endpoit");

    var { EmpresasExistentes, EmpresasInseridas } = req;
    if (!EmpresasExistentes && !EmpresasInseridas) return res.send(responseForRequest("Erro ao inserir novo(s) cliente(s). Tente novamente!", false, true))
    var response = responseForRequest("Clientes inseridos com sucesso!", true, false, {
      "EmpresasExistentes": EmpresasExistentes,
      "EmpresasInseridas": EmpresasInseridas
    });
    console.log('>>>> finally endpoint response: ', response);
    if (EmpresasExistentes.length > 0 && EmpresasInseridas.length == 0) response.msg = 'Clientes não inseridos';
    return res.status(200).send(response);

  /*   if (!EmpresasExistentes && !EmpresasInseridas) {
      response.msg ="Erro ao inserir novo(s) cliente(s). Tente novamente!";
      return res.send(response);
    }
    if (EmpresasExistentes.length > 0 && EmpresasInseridas.length == 0) {
      response.msg ="Não foi possível inserir, cliente(s) já existem!";
      return res.send(response);
    }

    if (EmpresasExistentes.length > 0 || EmpresasInseridas.length > 0) {
      if (QuantidadeItens == 0) {
        response.msg = "Cliente inserido com sucesso!";
        return res.send(response);
      }
      if (QuantidadeItens > 0) {
        response.msg = "Clientes inseridos com sucesso!"
        return res.send(response);
      }
    }

    */
  },

  async filterAcumuladores(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario, cnpj } = req.session.userData;

    if (req.method == "POST") {
      if (administrador == "SIM") {
        //console.log("body ", req.body)
        var { cnpj_cliente } = req.body;

        var targetTable = 'cfop_acumulador_tbl_view'

        const data = await RowsAdjustments(
          await knexPostgre.withSchema('dbo')
            .distinct(knexPostgre.raw(`'cfop_entrada' as title`), "cfop_entrada as value")
            .from(targetTable)
            .where("cnpj", cnpj_cliente)
            .union(function () {
              this.distinct("tipo_antecipado", "mva")
                .from(targetTable).withSchema('dbo')
                .where("cnpj", cnpj_cliente);
            })
        ).catch((error) => {
          console.log("APP --> ", error)
          return res.send().status(500)
        });

        var obj = {};
        obj.tipo_antecipado = [];
        obj.cfop_entrada = [];

        data.forEach((element, index) => {
          if (element.title == "cfop_entrada") {
            if (element.value) {
              obj.cfop_entrada.push([`${element.value}`]);
            }
          }
          if (element.title != "cfop_entrada") {
            if (element.value) {
              obj.tipo_antecipado.push([
                `${element.title} ${element.value}`,
                `${element.originaltitle}`,
                `${element.originalvalue}`,
              ]);
            } else {
              obj.tipo_antecipado.push([`${element.title}`]);
            }
          }
        });


        return res.send(JSON.stringify(obj));

      } else {
        return res.send("Você não possui as permissões necessárias!");
      }
    } else {
      return res.redirect("/acesso");
    }
  },

  async dataAcumuladores(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario, cnpj } = req.session.userData;

    if (administrador == "SIM") {
      /*
      categoria: String,
      cfop: Array,
      antecipado: Array
      */
      var targetTable = 'cfop_acumulador_tbl_view'
      var { cfop, antecipado, cnpj } = req.body;
      //JOI Xing

      if (targetTable && cfop.length > 0 && antecipado.length > 0) {
        if (cfop.length > 0 && antecipado.length > 0) {
          const data_filtrada = knexPostgre.from(targetTable).where("cnpj", cnpj);

          /* --------- Query para mva e tipo antecipado ---------- */
          data_filtrada.andWhere(function () {
            this.whereIn("cfop_entrada", cfop);
          });

          data_filtrada.andWhere(function () {
            antecipado.forEach((element, index) => {

              var antecipado_elem_splited = element.split("!");
              //element = ["antecidpado!0,2"]
              if (antecipado_elem_splited[1] == "null") {

                antecipado_elem_splited[0] = antecipado_elem_splited[0].toUpperCase().replace(/\s/g, "_")

                //console.log('antecipado_elem_splited[1]: ', antecipado_elem_splited[0])

                if (index == 0) {
                  this.where(function () {
                    this.where(
                      "tipo_antecipado",
                      antecipado_elem_splited[0]
                    ).andWhere("mva", null);
                  });
                }
                if (index > 0) {
                  this.orWhere(function () {
                    this.where(
                      "tipo_antecipado",
                      antecipado_elem_splited[0]
                    ).andWhere("mva", null);
                  });
                }

              } else {

                if (index == 0) {
                  this.where(function () {
                    this.where(
                      "tipo_antecipado",
                      antecipado_elem_splited[0]
                    ).andWhere("mva", antecipado_elem_splited[1]);
                  });
                }
                if (index > 0) {
                  this.orWhere(function () {
                    this.where(
                      "tipo_antecipado",
                      antecipado_elem_splited[0]
                    ).andWhere("mva", antecipado_elem_splited[1]);
                  });
                }

              }

            });
          });

          const tableRows = await data_filtrada.then((rows) => {
            return res.send(JSON.stringify(rows))
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          })

        } else {
          return res.send([]);
        }
      } else {
        return res.send([]);
      }

    } else {
      return res.send("Você não possui as permissões necessárias!");
    }

  },

  async updateAcumulador(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario, cnpj } =
      req.session.userData;



    if (req.method == "POST") {
      if (administrador == "SIM") {

        var { cnpj, mva, cfops, tipo_antecipado, new_acumulador } = req.body;

        var targetTable = 'cfop_acumulador_tbl_view'

        if (cnpj.length > 0 && cfops.length > 0) {

          if (!mva) { mva = null }

          const result = await knexPostgre(targetTable)
            .whereIn("cfop_entrada", cfops)
            .andWhere("mva", mva)
            .andWhere("tipo_antecipado", tipo_antecipado)
            .andWhere("cnpj", cnpj)
            .update("acumulador", new_acumulador).catch((error) => {
              console.log("APP --> ", error)
              return res.send().status(500)
            })
          if (result) {
            return res.send(true);
          } else {
            return res.send(false);
          }
        }
      } else {
        return res.send("Você não possui as permissões necessárias!");
      }
    } else {
      return res.redirect("/acesso");
    }
  },

  async downloadTemplateXLSX(req, res) {
    var { administrador, id_escritorio } = req.session.userData;


    var rootPath = global.__basedir;
    // Convert fs.readFile into Promise version of same
    const readFile = util.promisify(fs.readFile);

    function getStuff() {
      return readFile(
        `${rootPath}/storage/excel_download/InserirClientes.xlsx`
      );
    }

    getStuff().then((data) => {
      return res.writeHead(200, { "Content-Type": "application/xlsx" }).end(data, "binary");
    });

  },
  async downloadTemplateAcumuladoresXLSX(req, res) {
    var { administrador, id_escritorio } = req.session.userData;

    if (administrador == "SIM") {
      var rootPath = global.__basedir;
      // Convert fs.readFile into Promise version of same
      const readFile = util.promisify(fs.readFile);

      function getStuff() {
        return readFile(`${rootPath}/storage/excel_download/InserirAcumuladores.xlsx`);
      }

      getStuff().then((data) => {
        return res.writeHead(200, { "Content-Type": "application/xlsx" }).end(data, "binary");
      });
    } else {
      return res.redirect("/acesso");
    }
  },

  async insertClientesXLSX(req, res) {
    var { administrador, id_escritorio } = req.session.userData;

    const { clientesXLSX } = req.body;

    var clientesInseridos = {
      clientes_inseridos: [],
      clientes_nao_inseridos: [],
      msg: "",
    };

    var count = 0;
    var exists = "";
    var qtdRecebidos = clientesXLSX.length;

    if (administrador == "SIM") {
      try {
        clientesXLSX.forEach(async function (cliente, index) {
          count++;

          exists = await knexPostgre("dbo.empresas_tbl")
            .select("id_empresa")
            .where("cnpj", cliente.cnpj)
            .then(async (rows) => {
              if (rows.length == 0) {
                rows = false;
              }
              if (rows.length > 0) {
                rows = true;
              }
              return rows;
            }).catch((error) => {
              console.log("APP --> ", error)
              return res.send().status(500)
            })

          if (!exists) {
            try {
              knexPostgre("empresas_tbl").withSchema('dbo')
                .insert({
                  id_escritorio: id_escritorio,
                  cnpj: cliente.cnpj,
                  cliente: cliente.nome,
                  regime_tributario: cliente.tributacao,
                  unidade: cliente.unidade,
                })
                .returning("id_empresa")
                .into("empresas_tbl")
                .then(async (id_empresa) => {
                  if (id_empresa) {
                    clientesInseridos.clientes_inseridos.push(cliente.nome);
                  } else {
                    clientesInseridos.msg =
                      "Ocorreu algum erro, tente novamente.";
                  }

                }).catch((error) => {
                  clientesInseridos.msg = "Ocorreu algum erro, tente novamente.";
                  console.log("knexPostgre ==> ", error.originalError);
                  return res.send().status(500)
                });
            } catch (error) {
              console.log("APP --> ", error);
              return res.send().status(500)
            }
          } else {
            clientesInseridos.clientes_nao_inseridos.push(cliente.nome);
          }

          if (count == qtdRecebidos) {
            return res.send(clientesInseridos);
          }
        });
      } catch (error) {
        console.log("APP --> ", error);
        return res.send().status(500)
      }
    } else {
      console.log("APP --> ", error);
      return res.send().status(500)
    }
  },

  async insertAcumuladoresXLSX(req, res) {
    var { administrador, id_escritorio } = req.session.userData;

    var { acumuladoresXLSX } = req.body;

    acumuladoresXLSX = JSON.parse(acumuladoresXLSX);

    var resposta = {
      msg: "",
      inseridos: "",
      nao_inseridos: [],
      atualizados: [],
      erro: [],
      cnpjnaoexistente: [],
    };

    var count = 0;
    var count_inseridos = 0;
    var exists = "";
    var qtdRecebidos = acumuladoresXLSX.length;

    if (administrador == "SIM") {
      try {
        const SQLtablesCategoriadeAcumuladores = {
          "Fora do Estado": "operacoes_fora_do_estado_antecipado_view]",
          "Dentro do Estado": "operacoes_dentro_do_estado_antecipado_view]",
          "Substituição Tributária": "operacoes_substituicao_tributaria_view]",
          "CFOP Específico": "operacoes_cfop_especifico_view]",
        };

        const waitFor = (ms) => new Promise(r => setTimeout(r, ms))


        const asyncForEach = async (array_acumuladores, callback) => {

          for (let index = 0; index < array_acumuladores.length; index++) {

            var targetTable = 'cfop_acumulador_tbl_view'

            array_acumuladores[index].data.forEach(async function (dataRow, ind) {
              var { nome_pj, cnpj, antecipado, mva, cfop, acumulador } = dataRow;

              var db_format_antecipados = {
                "Antecipado de Entrada": "ANTECIPADO_DE_ENTRADAS",
                "Antecipado Especial": "ANTECIPADO_ESPECIAL",
                "Cesta Básica": "CESTA_BASICA",
                "Medicamentos": "MEDICAMENTOS",
                "Crédito Presumido": "CREDITO_PRESUMIDO",
                "Isento": "ISENTO",
              };

              if (db_format_antecipados[antecipado]) {
                antecipado = db_format_antecipados[antecipado];
              }
              const statusCFOP = await knexPostgre("dbo.cfops_tbl")
                .where("cfop", cfop)
                .then(async (rows) => {
                  if (rows.length > 0) {
                    //CFOP exite não precisamos criar
                    //console.log("cfops table CFOP exite! Não precisamos criar")
                    return true;
                  } else {
                    //CFOP NÃO EXISTE precisamos criar!
                    //console.log("cfops table CFOP não exite, precisamos criar")
                    return await knexPostgre("dbo.cfops_tbl")
                      .insert({ cfop: cfop })
                      .then(async (rows) => {
                        console.log("rows ", rows);
                        if (rows > 0) {
                          return true;
                        } else {
                          return false;
                        }
                      }).catch((error) => {
                        console.log("APP --> ", error)
                        return res.send().status(500)
                      })
                  }
                }).catch((error) => {
                  console.log("APP --> ", error)
                  return res.send().status(500)
                })

              if (statusCFOP) {
                await knexPostgre("dbo.empresas_tbl")
                  .where("id_escritorio", id_escritorio)
                  .andWhere("cnpj", cnpj)
                  .then(async (rows) => {
                    if (rows.length > 0) {
                      knexPostgre(targetTable)
                        .where("id_escritorio", id_escritorio)
                        .andWhere("cnpj", cnpj)
                        .andWhere("cfop", cfop)
                        .andWhere("tipo_antecipado", antecipado)
                        .andWhere("mva", mva)
                        .then(async (rows) => {
                          if (rows.length > 0) {
                            knexPostgre(targetTable)
                              .where("id_escritorio", id_escritorio)
                              .andWhere("cnpj", cnpj)
                              .andWhere("cfop", cfop)
                              .andWhere("tipo_antecipado", antecipado)
                              .andWhere("mva", mva)
                              .update({
                                tipo_antecipado: antecipado,
                                cfop: cfop,
                                mva: mva,
                                acumulador: acumulador,
                              })
                              .then(async (affectedRows) => {
                                //console.log("linhas afetadas: ",affectedRows);
                                if (affectedRows > 0) {

                                  count_inseridos++
                                  /*
                                  resposta.atualizados.push({
                                    cnpj: cnpj,
                                    antecipado: antecipado,
                                    cfop: cfop,
                                    mva: mva,
                                    acumulador: acumulador,
                                  });
                                  */
                                } else {

                                  resposta.erro.push({
                                    cnpj: cnpj,
                                    antecipado: antecipado,
                                    cfop: cfop,
                                    mva: mva,
                                    acumulador: acumulador,
                                  });

                                }
                              }).catch((error) => {
                                console.log("APP --> ", error)
                                return res.send().status(500)
                              });
                          } else {
                            //acumulador não existe -> insert
                            console.log(
                              "acumulador não existe, insert -----"
                            );
                            await knexPostgre(targetTable).withSchema('dbo')
                              .insert({
                                cnpj: cnpj,
                                tipo_antecipado: antecipado,
                                mva: mva,
                                cfop: cfop,
                                acumulador: acumulador,
                              })
                              .returning("acumulador")
                              .then(async (acumulador) => {
                                //console.log("inseri o acumulador: ",acumulador);
                                if (acumulador > 0) {
                                  count_inseridos++

                                } else {
                                  resposta.nao_inseridos.push({
                                    cnpj: cnpj,
                                    antecipado: antecipado,
                                    cfop: cfop,
                                    mva: mva,
                                    acumulador: acumulador,
                                  });
                                }
                              }).catch((error) => {
                                console.log("APP --> ", error)
                                return res.send().status(500)
                              });
                          }
                        }).catch((error) => {
                          console.log("APP --> ", error)
                          return res.send().status(500)
                        });
                    } else {

                      console.log("cnpj não existente, push no objeto -----");

                      resposta.nao_inseridos.push({
                        cnpj: cnpj,
                        antecipado: antecipado,
                        cfop: cfop,
                        mva: mva,
                        acumulador: acumulador,
                        msg: `Empresa não está cadastrada no seu escritorio, acumulador não inserido!`,
                      });

                      resposta.cnpjnaoexistente.push(cnpj);

                      //console.log('resposta cnpj -----> ', resposta)
                    }

                    if (resposta.nao_inseridos.length > 0) {
                      resposta.msg = `As empresas com os seguintes CNPJs, não foram inseridas pois não estão cadastradas`;
                    } else {
                      resposta.msg = `Acumuladores inseridos com sucesso!`
                    }

                    //exibir em tabela no front o resposta.cnpjnaoexistente
                  }).catch((error) => {
                    console.log("APP --> ", error)
                    return res.send().status(500)
                  });
              } else {
                console.log(
                  "APP --> Erro ao inserir novo CFOP na tabela 'cfops_tbl'"
                );

                resposta.nao_inseridos.push({
                  cnpj: cnpj,
                  antecipado: antecipado,
                  cfop: cfop,
                  mva: mva,
                  acumulador: acumulador,
                });
              }
            }); //final do foreach
            resposta.inseridos = count_inseridos
            await callback(resposta)
          }
        }

        const start = async () => {
          var resposta = []
          await asyncForEach(acumuladoresXLSX, async (array_acumuladores) => {
            await waitFor(acumuladoresXLSX.length * 250)
            resposta = await array_acumuladores
          })

          return res.send(resposta);
        }

        start()

      } catch (error) {
        console.log("APP ===>", error);
      }

    } else {
      //não tem permissão pois não é administrador | criar mensagem
    }
  },

  async insertAcumulador(req, res) {
    const { administrador, root, id_escritorio } = req.session.userData;
    var { cfop, select_new_antecipado_acumulador, mva, acumulador, select_new_categoria_acumulador, cnpj_novo_acumulador } = req.body;
    var resposta = { data: [], inseridos: [] }
    var aux_count = 0
    var acumulador_igual = false

    if (administrador == "SIM" && root == "SIM") {

      if (!Array.isArray(select_new_antecipado_acumulador)) {
        var temp = select_new_antecipado_acumulador
        select_new_antecipado_acumulador = new Array()
        select_new_antecipado_acumulador = temp.split(",")
      }
      //validation data with joi
      const { error, value } = schemaCriarAcumulador.validate(req.body)

      if (error) {
        console.log("APP --> ", error.details[0].message);
        return res.send(error.details[0].message)
      }

      if (!error && value) {

        const targetTable = 'cfop_acumulador_tbl_view'
        /*
        SQL TABLE CONTAINS
          [cnpj]
          ,[tipo_antecipado]
          ,[mva]
          ,[cfop_entrada]
          ,[acumulador]
          ,[indicador_pag]
          ,[cfop_nfce]
       */
        console.log("select_new_antecipado_acumulador ", select_new_antecipado_acumulador)

        try {

          const porcento = parseFloat((mva.replace(/\%/g, "").replace(/s/g, "")) / 100).toFixed(4).toString().replace(/\./g, ",");

          //VERIFICANDO SE O CFOP EXISTE
          const CFOPSexists = await knexPostgre("dbo.cfops_tbl")
            .where("cfop", cfop)
            .then(async (rows) => {
              if (rows.length > 0) {
                rows = true;
              } else {
                rows = false;
              }
              return rows;
            }).catch((error) => {
              console.log("APP --> ", error)
              return res.send().status(500);
            });

          if (!CFOPSexists) {
            //Criar CFOP na tablea dbo.cfops
            await knexPostgre("dbo.cfops_tbl").insert({ cfop: cfop });
          }


          select_new_antecipado_acumulador.forEach(async function (el_antecipado_acumulador, idx) {

            const exists = await knexPostgre(targetTable)
              .where("id_escritorio", id_escritorio)
              .andWhere("cnpj", cnpj_novo_acumulador)
              .andWhere("cfop_entrada", cfop)
              .andWhere("tipo_antecipado", el_antecipado_acumulador)
              .andWhere("mva", porcento)
              .then(async (rows) => {

                aux_count++
                if (rows[0]) {
                  if (rows[0].acumulador == acumulador) {
                    acumulador_igual = true
                  }
                }

                if (rows.length == 1) {
                  rows[0].antecipado = rows[0].tipo_antecipado.replace(/_/g, " ");
                  //let aux_porcetagem = rows[0].mva.replace(/,/g, ".")
                  rows[0].mva_porcentagem = `${(parseFloat(rows[0].mva.replace(/,/g, ".")) * 100).toFixed(2)}%`;
                  rows[0].categoria = el_antecipado_acumulador;

                }

                if (rows.length > 1) {
                  console.log("APP --> Existe acumuladores repetidos", rows);
                }
                return rows;
              }).catch((error) => {
                console.log("APP --> ", error)
                return res.send().status(500);
              });

            if (exists.length == 0 && !acumulador_igual) {
              const insertion = await knexPostgre(targetTable)
                .insert({
                  'cnpj': cnpj_novo_acumulador,
                  'tipo_antecipado': el_antecipado_acumulador,
                  'mva': porcento,
                  'cfop_entrada': cfop,
                  'acumulador': acumulador,
                })
                .returning("acumulador").catch((error) => {
                  console.log("APP --> ", error)
                  return res.send().status(500);
                });
              if (insertion.length > 0) {
                resposta.inseridos.push(insertion);
              }
            } else {

              if (!acumulador_igual) {
                resposta.data.push(exists);
              }

            }

            if (select_new_antecipado_acumulador.length == aux_count) {
              if (resposta.data.length > 0) {
                resposta.msg = "Acumulador existente, deseja atualizar?"
                return res.send(resposta);
              } else {
                resposta.msg = "Acumulador inserido com sucesso!"
                return res.send(resposta);
              }
            }

          }) //fim foreach

        } catch (error) {
          console.log("APP -> Erro ClientesController, linha 1428", error);
          return res.send(resposta).status(500);
        }
      }


    }

    if (error) {
      resposta.msg = "Erro ao inserir acumulador, tente novamente!";
      return res.send(resposta).status(500);
    }

  },



  async updateNewAcumulador(req, res) {
    const { administrador, root, id_escritorio } = req.session.userData;
    const { objUpdatesAcumuladores } = req.body;

    var count_update = 0


    try {
      const SQLtablesCategoriadeAcumuladores = {
        "Fora do Estado": "[dbo].[operacoes_fora_do_estado_antecipado_view]",
        "Dentro do Estado":
          "[dbo].[operacoes_dentro_do_estado_antecipado_view]",
        "Substituição Tributária":
          "[dbo].[operacoes_substituicao_tributaria_view]",
        "Específico": "[dbo].[operacoes_cfop_especifico_view]",
      };



      objUpdatesAcumuladores.forEach(async function (acumulador_da_vez) {

        targetTable = SQLtablesCategoriadeAcumuladores[acumulador_da_vez.select_new_categoria_acumulador];

        var UpdateQuery = await knexPostgre(targetTable)
          .update("acumulador", acumulador_da_vez.acumulador)
          .where("id_escritorio", id_escritorio)
          .andWhere("cnpj", acumulador_da_vez.cnpj_novo_acumulador)
          .andWhere("cfop_entrada", acumulador_da_vez.cfop)
          .andWhere("mva", acumulador_da_vez.mva)
          .andWhere("tipo_antecipado", acumulador_da_vez.select_new_antecipado_acumulador)
          .then((affectRows) => {

            if (affectRows) {
              count_update += affectRows
            }

          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          });

        if (objUpdatesAcumuladores.length == count_update) {
          if (count_update == 0) {
            return res.send("Acumulador Não Atualizado!");
          }
          if (count_update == 1) {
            return res.send("Acumulador Atualizado!");
          }
          if (count_update > 1) {
            return res.send("Acumuladores Atualizados!");
          }
        }

      }) //final for

    } catch (error) {
      console.log("APP ===>", error);
      return res.send().status(500)
    }

  },

  /* continuar daqui | montar tabela frontend | devolver os dados | 07-06 */
  async insertAcumuladorMultiplos(req, res) {
    const { administrador, root, id_escritorio } = req.session.userData;
    const {
      mva_multiplo,
      cfop_multiplo,
      acumulador_multiplo,
      select_new_antecipado_acumulador_multiplo,
      select_new_categoria_acumulador_multiplo,
      cnpjs,
    } = req.body;


    if (administrador == "SIM" && root == "SIM") {
      const SQLtablesCategoriadeAcumuladores = {
        "Fora do Estado": "[dbo].[operacoes_fora_do_estado_antecipado_view]",
        "Dentro do Estado":
          "[dbo].[operacoes_dentro_do_estado_antecipado_view]",
        "Substituição Tributária":
          "[dbo].[operacoes_substituicao_tributaria_view]",
        "Específico": "[dbo].[operacoes_cfop_especifico_view]",
      };

      var resposta = { inseridos: "", nao_inseridos: [], msg: "" };
      var count_inseridos = 0;
      var count = 0;

      const targetTable =
        SQLtablesCategoriadeAcumuladores[
        select_new_categoria_acumulador_multiplo
        ];

      if (
        mva_multiplo.length > 0 &&
        cfop_multiplo.length > 0 &&
        acumulador_multiplo.length > 0 &&
        select_new_antecipado_acumulador_multiplo.length > 0 &&
        select_new_categoria_acumulador_multiplo.length > 0 &&
        cnpjs.length > 0
      ) {
        /* verificar se cfop já existe */
        const CFOPSexists = await knexPostgre("dbo.cfops_tbl")
          .where("cfop", cfop_multiplo)
          .then(async (rows) => {
            if (rows.length > 0) {
              rows = true;
            } else {
              rows = false;
            }
            return rows;
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          });

        if (!CFOPSexists) {
          await knexPostgre("dbo.cfops_tbl").insert({ cfop: cfop_multiplo }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          });
          console.log(
            `APP --> Novo CFOP ${cfop_multiplo} criado na tabela dbo.cfops`
          );
        }

        const porcento = parseFloat(mva_multiplo / 100)
          .toFixed(4)
          .toString()
          .replace(/\./g, ",");

        try {
          /* insert para cada cnpj único */
          cnpjs.forEach(async function (cnpj_da_vez, indice) {


            select_new_antecipado_acumulador_multiplo.forEach(async function (acumulador_da_vez, idx) {

              /* select para ver se o objeto já existe */
              const exists = await knexPostgre(targetTable)
                .where("cnpj", cnpj_da_vez)
                .andWhere("tipo_antecipado", acumulador_da_vez)
                .andWhere("cfop", cfop_multiplo)
                .andWhere("mva", porcento)
                .andWhere("id_escritorio", id_escritorio)
                .then(async (rows) => {
                  count++

                  if (rows.length > 0) {
                    //existe
                    resposta.nao_inseridos.push(rows[0]);
                    resposta.msg = "Cfop(s) já existentente(s), deseja atualizar?";

                    rows = true;
                  } else {
                    rows = false;
                  }
                  return rows;
                }).catch((error) => {
                  console.log("APP --> ", error)
                  return res.send().status(500)
                });

              if (!exists) {
                const insertion = await knexPostgre(targetTable)
                  .insert({
                    cnpj: cnpj_da_vez,
                    tipo_antecipado: acumulador_da_vez, // 'ANTECIPADO_DE_ENTRADAS', 'ANTECIPADO_ESPECIAL'
                    mva: porcento,
                    cfop: cfop_multiplo,
                    acumulador: acumulador_multiplo,
                  })
                  .returning("acumulador")
                  .then(async function (rows) {
                    /* inseriu com sucesso */
                    if (rows.length > 0) {
                      count_inseridos++;
                    }
                  }).catch((error) => {
                    console.log("APP --> ", error)
                    return res.send().status(500)
                  });
              }

              /* se a quantidade dos dados for igual ao tamanho do for */
              if (count == cnpjs.length * select_new_antecipado_acumulador_multiplo.length) {
                resposta.inseridos = count_inseridos;
                return res.send(resposta);
              }

            })



          });
        } catch (error) {
          console.log("APP ===>", error);
          resposta.msg = "Ocorreu algum erro, tente novamente";
          return res.send(resposta).status(500);
        }
      }
    } else {
      console.log("Ocorreu algum erro, tente novamente");
      resposta.msg = "Ocorreu algum erro, tente novamente";
      return res.send(resposta).status(500);
    }
  },


  async getCFOPSbycnpj(req, res) {
    var { usuario, administrador, root, nome_fantasia, suporte, erp } = req.session.userData;
    var { cnpj_req } = req.body;

    try {
      if (cnpj_req) {
        const CFOPs_rows = await knexPostgre("dbo.cfops_relacionamento_tbl")
          .select("cfop", "cfop_entrada")
          //.where("id_escritorio", id_escritorio)
          .where("cnpj", cnpj_req).then(function (rows) {
            return res.send(rows);
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          })


      } else {
        return res.send("Tabela não encontrada");
      }
    } catch (error) {
      console.log("APP ===>", error);
    }
  },

  async relacionarCFOP(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario, cnpj } = req.session.userData;

    if (administrador == "SIM") {

      var { cnpj, cfop, cfop_entrada } = req.body;

      //console.log('dados da requisição', req.body);

      try {
        const existe = await knexPostgre("dbo.cfops_relacionamento_tbl")
          .where("cnpj", cnpj)
          .andWhere("cfop", cfop)
          .andWhere("cfop_entrada", cfop_entrada).then(async (rows) => {
            if (rows.length > 0) {
              console.log("existe: ", rows);
              return rows
            }
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          })

        if (!existe) {
          await knexPostgre("dbo.cfops_relacionamento_tbl")
            .insert({
              cnpj: cnpj,
              cfop: cfop,
              cfop_entrada: cfop_entrada,
            })
            .returning("id")
            .then(async function (id) {
              /* inseriu com sucesso */
              if (id.length > 0) {
                return res.send(true);
              } else {
                return res.send(false);
              }
            }).catch((error) => {
              console.log("APP --> ", error)
              return res.send().status(500)
            })

        } else {
          return res.send(true);
        }
      } catch (error) {
        console.log("APP ===>", error);
        return res.send(false);
      }

    } else {
      return res.redirect("/acesso");
    }
  },


  async updateRelacionarCFOP(req, res) {
    var { administrador, root, nome_fantasia, suporte, usuario, cnpj } = req.session.userData;

    if (administrador == "SIM") {

      //console.log('dados do update: ', req.body)

      /*
        cfop: '0008',
        newValue: '0008',
        oldValue: '0000',
        campo: 'cfop',
        cnpj: '02529286000122'
      */

      var { cfop, newValue, oldValue, campo, cnpj } = req.body;


      try {

        var UpdateQuery = knexPostgre("dbo.cfops_relacionamento_tbl") // update cfop_entrada = 0008 where cnpj = cnpj and cfop entrada = 0000
          .update(campo, newValue)
          .where("cnpj", cnpj)
          .andWhere(campo, oldValue)

        if (campo == "cfop_entrada") {

          UpdateQuery.andWhere("cfop", cfop).then(async (rows) => {
            if (rows) {
              //console.log("update result: ", rows);
              return true
            }
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          })

        } else {

          UpdateQuery.then(async (rows) => {
            if (rows) {
              //console.log("update result: ", rows);
              return true
            }
          }).catch((error) => {
            console.log("APP --> ", error)
            return res.send().status(500)
          })

        }


        if (UpdateQuery) {
          return res.send(true)
        } else {
          return res.send(false)
        }

      } catch (error) {
        console.log("APP ===>", error);
        return res.send(false);
      }


    } else {
      return res.redirect("/acesso");
    }
  }
}


/*
async updateNewAcumulador(req, res) {
    const { administrador, root, id_escritorio } = req.session.userData;
    const {
      cfop,
      select_new_antecipado_acumulador,
      mva,
      acumulador,
      select_new_categoria_acumulador,
      cnpj_novo_acumulador,
    } = req.body;

    try {
      const SQLtablesCategoriadeAcumuladores = {
        "Fora do Estado": "[dbo].[operacoes_fora_do_estado_antecipado_view]",
        "Dentro do Estado":
          "[dbo].[operacoes_dentro_do_estado_antecipado_view]",
        "Substituição Tributária":
          "[dbo].[operacoes_substituicao_tributaria_view]",
        Específico: "[dbo].[operacoes_cfop_especifico_view]",
      };
      const targetTable =
        SQLtablesCategoriadeAcumuladores[select_new_categoria_acumulador];

      var UpdateQuery = knexPostgre(targetTable)
        .update("acumulador", acumulador)
        .where("id_escritorio", id_escritorio)
        .andWhere("cfop", cfop)
        .andWhere("mva", mva)
        .andWhere("tipo_antecipado", select_new_antecipado_acumulador);

      var cnpjs = "";
      if (!Array.isArray(cnpj_novo_acumulador)) {
        cnpjs = cnpj_novo_acumulador.split(",");
        UpdateQuery.whereIn("cnpj", cnpjs);
      } else {
        cnpjs = cnpj_novo_acumulador;
        UpdateQuery.whereIn("cnpj", cnpj_novo_acumulador);
      }
      console.log("req  ", req.body);
      console.log("ffffffffff ", cnpjs);

      UpdateQuery.then((affectRows) => {
        console.log("affectRows ", affectRows);
        if (affectRows == 0) {
          return res.send("Acumulador Não Atualizado!");
        }
        if (affectRows == 1) {
          return res.send("Acumulador Atualizado!");
        }
        if (affectRows > 1) {
          return res.send("Acumuladores Atualizados!");
        }
      }).catch((error) => {
       console.log("APP ===>", error);
      });
    } catch (error) {
     console.log("APP ===>", error);
    }

  }

*/
