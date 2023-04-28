const {knexPostgre} = require("../../database");


module.exports = {

  async renderPage(req, res) {

    var {
      administrador,
      root,
      escritorio,
      suporte,
      usuario,
      email
    } = req.session.userData

    /*
        'rf_notas_icms_sum',
         'rf_notas_piscofins_sum',
         'rf_notas_antecipados_sum',
         'rf_notas_erro_sum'
    */
    try {
      var rf_notas_sum;
      knexPostgre('dbo.robofiscal_controle_notas_tbl_sum_view')
        .select('rf_notas_icms_sum',
          'rf_notas_piscofins_sum',
          'rf_notas_antecipados_sum',
          'rf_notas_erro_sum')
        .where('nome_fantasia', escritorio)
        //.andWhere('rf_notas_itens_atualizados', '>', '0')
        .limit(2000)
        .then((rows) => {
          rf_notas_sum = rows[0];
          if (rf_notas_sum) {
            try {
             return res.render("./dashboard", {
                administrador,
                root,
                suporte,
                email,
                rf_notas_sum,
                escritorio,
              });
              /return/res.send(nomepjexistente);
            } catch (error) {
             return res.status(404);
            }
          } else {
           return res.status(204)
          }
        })

    } catch (error) {
      console.log("APP ===>", error);
    }
  },

  async requestRoboFiscalNotas(req, res) {
    var {
      administrador,
      root,
      escritorio,
      suporte,
      usuario,
      email
    } = req.session.userData


    try {
      var dataTable = '';
      knexPostgre('dbo.robofiscal_controle_notas_tbl_view')
        .select('rf_notas_id', 'rf_notas_cliente', 'cliente', 'rf_notas_icms', 'rf_notas_escritorio', 'nome_fantasia', 'rf_notas_piscofins', 'rf_notas_itens_atualizados', 'rf_notas_escritorio', 'rf_notas_chave_de_acesso', 'rf_notas_tipo_nota', 'rf_notas_modelo_doc', 'rf_notas_antecipados', 'rf_notas_data_sincronizacao', 'rf_notas_erro')
        .where('nome_fantasia', escritorio)
        .andWhere('rf_notas_itens_atualizados', '>', '0')
        .limit(2000)
        .then((rows) => {
          dataTable = JSON.stringify(rows);
          if (dataTable) {
           return res.send({ dataTable });
          } else {
           return res.status(204);
          }
        }).catch((error) => {
          console.log("APP ===>", error);
        })

    } catch (error) {
     return res.status(500);
    }

  },


  async requestRoboFiscalProdutos(req, res) {

    var {
      administrador,
      root,
      escritorio,
      suporte,
      usuario,
      email
    } = req.session.userData
    try {
      var dataTable
      knexPostgre('dbo.robofiscal_controle_produtos_tbl_view')
        .select('rf_prod_id', 'rf_prod_cliente', 'rf_prod_icms', 'rf_prod_pisconfis', 'rf_prod_itens_atualizados', 'rf_prod_escritorio', 'rf_prod_erp', 'rf_prod_database', 'rf_prod_tipo_sincronizacao', 'rf_prod_erro', 'rf_prod_data_sincronizacao')
        .where('nome_fantasia', escritorio)
        .then((rows) => {
          dataTable = JSON.stringify(rows)
          if (rows) {
            try {
             return res.send({
                dataTable
              });

            } catch (error) {
             return res.render("acesso", { erro: error });
            }
          } else {
           return res.status(204)
          }
        })

    } catch (error) {
      console.log("APP ===>", error);
    }
  }

}


