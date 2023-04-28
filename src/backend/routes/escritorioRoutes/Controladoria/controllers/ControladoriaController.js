//const { query } = require("express");
const { forEach } = require("async");
var fs = require("fs");
const { knexPostgre } = require("../../../../database/knex");
const { schemaControleObrigacoes } = require("../../../../workers/JOI/schemas");

module.exports = {
  async renderPage(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
      bi_controladoria,
      bi_dominio_vs_app,
      bi_entrada_impostos,
      bi_custo_mercadoria,
      bi_credito_presumido_icms,
    } = req.session.userData;

    try {
      var objPowerBi = {
        bi_controladoria,
        bi_dominio_vs_app,
        bi_entrada_impostos,
        bi_custo_mercadoria,
        bi_credito_presumido_icms
      };

      return res.render("./_escritorio/Controladoria/controladoria", {
        administrador,
        root,
        suporte,
        email,
        nome_fantasia,
        objPowerBi,
      });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  },
};
