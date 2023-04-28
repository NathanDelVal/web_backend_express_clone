const fs = require('fs');
const crypto = require('crypto');
const moment = require('moment');
const { knexPostgre } = require('../../../../database/knex');
const VerifyBadgeSuporteMSG = require('../../../escritorioRoutes/VerifyBadgeSupporteMSG');

module.exports = {
  async renderPageOld(req, res) {
    var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
    VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
    try {
        return res.render("_escritorio/NotasFiscais/graficos", { administrador, root, suporte, nome_fantasia, email, bi, plano });
    } catch (error) {
        //res.status(500)
        res.redirect("/");
    }
},
    async renderPage(req, res) {
        var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        try {
          return res.render("relatorios/antecipados", { administrador, root, suporte, nome_fantasia, email, bi, plano });
        } catch (error) {
            //res.status(500)
            res.redirect("/");
        }
    },

    async getAntecipadosData(req, res){
      try {

        const {start_date, end_date, federation, status, cfop_list, cnpj_list } = req.body

        //const start_date ='2021-02-28'
        //const end_date = '2021-12-05'
        //const federation = 'PA'
        //const status = 'Autorizada'
        //const cfop_list =['2201', '2202', '2411']
        //const cnpj_list =['11350171000167', '03245445000120']

        /*
        .where('data_entrada', '>', start_date)
        .where('data_entrada', '<', end_date)
        */

        var query = await knexPostgre("relatorio_antecipados_view")
        .withSchema('dbo')
        .select('*')
        .whereBetween('data_entrada', [start_date, end_date])
        .where('uf_origem', federation)
        .whereIn('cfop', cfop_list)
        .where('status', status)
        .whereIn('cnpj_destinatario', cnpj_list)
        .where(function() {
          this.whereNull('nf_devolvida')
          .orWhere('nf_devolvida', '0')
        }) //.then((result) => result);

        return res.send(query)

       } catch (error) {
        console.log("eeror ", error)
          //res.status(500)
          return res.redirect('/');
      }

    }

}

