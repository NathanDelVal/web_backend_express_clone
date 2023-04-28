const moment = require("moment");
const { knexPostgre } = require("../../../../database/knex");

module.exports = {
  async renderPage(req, res) {
    var { usuario, administrador, root, escritorio, suporte } = req.session.userData
    if (root == "SIM") {
      try {
        return res.render("./_escritorio/_InternalUser/alterar-regras", {
          administrador,
          root,
          suporte,
          escritorio,
        });
      } catch (error) {
        return res.status(404);
      }
    } else {
      return res.status(500).send("Acesso Negado");
    }
  },

  async getRegras(req, res) {
    var { usuario, administrador, root, escritorio, suporte } = req.session.userData
    if (root == "SIM") {
      try {
        knexPostgre("regras_tbl").withSchema("dbo")
          .select(
            "id_regra",
            "descricao",
            "data_inicio",
            "numero_decreto",
            "mva_7",
            "mva_12",
            "tipo_antecipado",
            "status"
          )
          .limit(1000)
          .whereNot("id_regra", 0) //Regra zero não deve carregar
          .orderBy("id_regra", "desc")
          .then((rows) => {
            if (rows.length != 0) {
              return res.send(rows);
            } else {
              return res.status(500);
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } catch (error) {
        return res.status(404);
      }
    } else {
      return res.status(500).send("Acesso Negado");
    }
  },

  async getItensRegra(req, res) {

    var {
      administrador,
      root,
      escritorio
    } = req.session.userData


    const id_regra = req.body.id_regra;

    if (administrador == "SIM" && root == "SIM") {
      try {
        knexPostgre("dbo.produtos_tbl_view")
          .select(
            "id_produto",
            "descricao_item",
            "ncm",
            "mva_7",
            "mva_12",
            "tipo_antecipado"
          )
          .limit(2500)
          .where("nome_regra", id_regra)
          .then((rows) => {
            dataTable = rows;
            return res.send(dataTable);
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } catch (error) {
        return res.status(404);
      }
    } else {
      return res.status(500).send("Acesso Negado");
    }
  },

  async insert(req, res) {
    var {
      administrador,
      root,
      escritorio
    } = req.session.userData


    if (req.method == "POST") {
      if (root == "SIM") {
        const descricao_item = req.body.descricao_item;
        const numero_decreto = req.body.numero_decreto;
        const data_inicio = req.body.data_inicio;
        const mva_7_antigo = req.body.mva_7_antigo;
        const mva_7_novo = req.body.mva_7_novo;
        const mva_12_antigo = req.body.mva_12_antigo;
        const mva_12_novo = req.body.mva_12_novo;
        const tipo_antecipado_antigo = req.body.tipo_antecipado_antigo;
        const tipo_antecipado_novo = req.body.tipo_antecipado_novo;
        const status = req.body.status;

        return knexPostgre("dbo.regras_tbl")
          .select()
          .where({
            descricao: descricao_item,
            numero_decreto: numero_decreto,
            data_inicio: data_inicio,
            mva_7_antigo: mva_7_antigo,
            mva_7_novo: mva_7_novo,
            mva_12_antigo: mva_12_antigo,
            mva_12_novo: mva_12_novo,
            tipo_antecipado_antigo: tipo_antecipado_antigo,
            tipo_antecipado_novo: tipo_antecipado_novo,
            status: status,
          })
          .then(function (rows) {
            //console.log("como vem o row 1 ? = ", rows);
            if (rows.length === 0) {
              knexPostgre("dbo.regras_tbl")
                .insert({
                  descricao: descricao_item,
                  numero_decreto: numero_decreto,
                  data_inicio: data_inicio,
                  mva_7_antigo: mva_7_antigo,
                  mva_7_novo: mva_7_novo,
                  mva_12_antigo: mva_12_antigo,
                  mva_12_novo: mva_12_novo,
                  tipo_antecipado_antigo: tipo_antecipado_antigo,
                  tipo_antecipado_novo: tipo_antecipado_novo,
                  status: status,
                })
                .then((rows) => {
                  if (rows.length == 1) {
                    return res.send("Regra criada com sucesso!");
                  } else {
                    return res.send("Erro ao criar regra, tente novamente.");
                  }
                })
                .catch((error) => {
                  console.log("APP ===>", error);
                  return res.status(500);
                });
            } else {
              return res.send("Regra já criada anteriormente.");
            }
          });
      } else {
        return res.send("Você não tem permissão para executar essa função.");
      }
    }
  },

  async updateSingle(req, res) {
    var administrador = req.session.userData.administrador;
    var root = req.session.userData.root;
    var escritorio = req.session.userData.escritorio;

    if (req.method == "POST") {
      if (root == "SIM") {

        var { id_regra,
          descricao_item,
          numero_decreto,
          data_inicio,
          mva_7_antigo,
          mva_7_novo,
          mva_12_antigo,
          mva_12_novo,
          tipo_antecipado_antigo,
          tipo_antecipado_novo,
          status } = req.body

        return knexPostgre("dbo.regras_tbl")
          .where("id_regra", id_regra)
          .update({
            descricao: descricao_item,
            numero_decreto: numero_decreto,
            data_inicio: data_inicio,
            mva_7_antigo: mva_7_antigo,
            mva_7_novo: mva_7_novo,
            mva_12_antigo: mva_12_antigo,
            mva_12_novo: mva_12_novo,
            tipo_antecipado_antigo: tipo_antecipado_antigo,
            tipo_antecipado_novo: tipo_antecipado_novo,
            status: status,
          })
          .then((rows) => {
            rowsAffected = rows;
            if (rowsAffected > 0) {
              return res.send("Regra atualizada com sucesso!");
            } else {
              return res.send("Erro ao atualizar regra, tente novamente.");
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      }
    } else {
      return res.send("Você não possui as permissões necessárias!");
    }
  },

  async deleteItemRegra(req, res) {
    var administrador = req.session.userData.administrador;
    var root = req.session.userData.root;

    if (req.method == "POST") {
      if (root == "SIM") {
        const id_item_regra = req.body.id_item_regra;

        let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

        return knexPostgre("dbo.produtos_tbl_view")
          .where("id_produto", id_item_regra)
          .update({
            nome_regra: null,
            modificado: getdate,
          })
          .then((rows) => {
            rowsAffected = rows;
            console.log("Delete is update ", rows);
            if (rowsAffected > 0) {
              return res.send("Item removido da regra com sucesso!");
            } else {
              return res.send("Erro ao remover item da regra, tente novamente.");
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } else {
        return res.send("Você não possui as permissões necessárias!");
      }
    } else {
      return res.sendStatus(405);
    }
  },

  async deleteItensRegra(req, res) {
    var {
      administrador,
      root,
      escritorio
    } = req.session.userData

    if (req.method == "POST") {
      if (root == "SIM") {
        const ids_atribuidos = req.body.selecionados_atribuidos;

        console.log(" Tucurui Pará ", ids_atribuidos);

        let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

        return knexPostgre("dbo.produtos_tbl_view")
          .update({
            nome_regra: null,
            modificado: getdate,
          })
          .whereIn("id_produto", ids_atribuidos)
          .then((rows) => {
            rowsAffected = rows;
            console.log("update dos itens :  ", rows, ids_atribuidos);
            if (rowsAffected > 0) {
              return res.send("Itens removidos da regra com sucesso!");
            } else {
              return res.send("Erro ao remover itens da regra, tente novamente.");
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } else {
        return res.send("Você não possui as permissões necessárias!");
      }
    } else {
      return res.sendStatus(405);
    }
  },

  async updateMulti(req, res) { },

  async getAtribuirRegra(req, res) {

    var {
      administrador,
      root,
      suporte,
      escritorio
    } = req.session.userData

    var { descricao, tipo_antecipado, ncm, ean } = req.body;

    if (root == "SIM") {
      var query = knexPostgre("dbo.produtos_tbl_view")
        .select(
          "id_produto",
          "descricao_item",
          "ncm",
          "mva_7",
          "mva_12",
          "tipo_antecipado",
          "cst_icms", "csosn_icms", "cst_piscofins_entrada", "cst_piscofins_saida", "natureza_receita_monofasico_aliqzero"
        )
        .where("descricao_item", "like", "%" + [descricao] + "%")
        .limit(2500);

      if (tipo_antecipado != null && tipo_antecipado != "") {
        query.andWhere("tipo_antecipado", tipo_antecipado);
      }
      if (ncm != null && ncm != "") {
        query.andWhere("ncm", "like", `%${ncm}%`);
      }
      if (ean != null && ean != "") {
        query.andWhere("ean", "like", `%${ean}%`);
      }

      try {
        query
          .then((rows) => {
            dataTable = rows;
            if (dataTable.length != 0) {
              return res.send(dataTable);
            } else {
              return res.status(500);
            }
          })
          .catch((error) => {
            console.log("APP ===>", error);
            return res.status(500);
          });
      } catch (error) {
        return res.status(404);
      }
    } else {
      return res.status(500).send("Acesso Negado");
    }
  },

  async atribuirItemRegra(req, res) {
    var {
      administrador,
      root,
      escritorio } = req.session.userData

    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

    if (req.method == "POST") {
      if (root == "SIM") {
        console.log("Atribuir item", req.body);
        var ids = req.body.ids;
        var regra = req.body.regra;
        if (regra & ids) {
          return knexPostgre("dbo.produtos_tbl_view")
            .whereIn("id_produto", ids)
            .update({
              nome_regra: regra,
              modificado: getdate,
            })
            .then((rows) => {
              rowsAffected = rows;
              if (rowsAffected > 0) {
                //console.log("Multiplos update ", rowsAffected, " item(s)")
                return res.send("Regra atualizada com sucesso!");
              } else {
                return res.send("Erro ao atribuir regra a itens, tente novamente.");
              }
            })
            .catch((error) => {
              console.log("APP ===>", error);
              return res.status(500);
            });
        }
      } else {
        console.log("ids ou regra undefined");
      }
    } else {
      return res.send("Você não possui as permissões necessárias!");
    }
  },
};
