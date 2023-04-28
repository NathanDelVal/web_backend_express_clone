//const { query } = require("express");
const { knexPostgre } = require("../../database/knex");
const moment = require('moment')


const dateRowsAdjustments = async (rows, column) => {
    return await rows.map(function (row) {
        if (row[column]) {
            row[column] = moment(row[column], "YYYY-MM-DD").format("DD/MM/YYYY");
        }
        return row
    });
}

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
            bi_dominio_vs_app
        } = req.session.userData
        /*
            'rf_notas_icms_sum',
             'rf_notas_piscofins_sum',
             'rf_notas_antecipados_sum',
             'rf_notas_erro_sum'
        */
        try {

           return res.render("./_escritorio/_Home/robo-fiscal", {
                administrador,
                root,
                suporte,
                email,
                nome_fantasia,
                bi_dominio_vs_app
            });
        } catch (error) {
            console.log("APP ===>", error);
           return res.status(404);
        }
    },

    async requestRoboFiscalNotas(req, res) {

        var {
            administrador,
            root,
            escritorio_id,
            nome_fantasia,
            suporte,
            usuario,
            email
        } = req.session.userData


        try {


            var contador;

            var actualDate = moment();
            var actualMonth = actualDate.format('MM');
            var actualYear = actualDate.format('YYYY');
            var lastYear = actualDate.subtract(1, 'years').format('YYYY')

            var query1 = knexPostgre('dbo.robofiscal_controle_notas_tbl_sum_mes_view')
                .select('rf_notas_icms_sum_mes',
                    'rf_notas_piscofins_sum_mes',
                    'rf_notas_antecipados_sum_mes',
                    'rf_notas_erro_sum_mes')
                .where('nome_fantasia', nome_fantasia)


            if (actualMonth != 12) {
                query1
                    .andWhere('rf_notas_data_sincronizacao_ano', actualYear)
            } else {
                query1
                    .andWhere('rf_notas_data_sincronizacao_ano', actualYear)
                    .orWhere(function () {
                        this.where('rf_notas_data_sincronizacao_ano', lastYear).andWhere('rf_notas_data_sincronizacao_mes', '12')
                    })
            }

            query1
                .then((rows) => {
                    if (rows.length > 0) {
                        contador = JSON.stringify(rows[0])

                        knexPostgre('dbo.robofiscal_controle_notas_tbl_view')
                            .select('rf_notas_id', 'rf_notas_cliente', 'cliente', 'rf_notas_icms', 'id_escritorio', 'nome_fantasia', 'rf_notas_piscofins', 'rf_notas_itens_atualizados', 'rf_notas_chave_de_acesso', 'rf_notas_tipo_nota', 'rf_notas_modelo_doc', 'rf_notas_antecipados', 'rf_notas_data_sincronizacao', 'rf_notas_erro', 'numero', 'nome_pj_emitente')
                            .where('nome_fantasia', nome_fantasia)
                            .andWhere('rf_notas_itens_atualizados', '>', '0')
                            .limit(2000)
                            .then(async (rows) => {
                                const data4Table = JSON.stringify(await dateRowsAdjustments(rows, "rf_notas_data_sincronizacao"));
                                if (data4Table) {
                                   return res.send({
                                        data4Table,
                                        contador
                                    });
                                } else {
                                   return res.status(204)
                                }


                            }).catch((error) => {
                                console.log("APP ===>", error);
                            })
                    }

                })

        } catch (error) {
           return res.status(500)
        }

    },

    async requestRoboFiscalNotasByMonth(req, res) {
        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario,
            email
        } = req.session.userData

        var { months } = req.body
        try {

            var contador;

            ////("antes no contador knexPostgre")
            knexPostgre('dbo.robofiscal_controle_notas_tbl_sum_mes_view')
                .select('rf_notas_icms_sum_mes',
                    'rf_notas_piscofins_sum_mes',
                    'rf_notas_antecipados_sum_mes',
                    'rf_notas_erro_sum_mes')
                .where('nome_fantasia', nome_fantasia)
                .andWhere('rf_notas_itens_atualizados_sum_mes', '>', '0')
                .whereIn('rf_notas_data_sincronizacao_mes', months)
                .limit(4)
                .then((rows) => {
                    if (rows) {
                        contador = JSON.stringify(rows[0])

                        knexPostgre('dbo.robofiscal_controle_notas_tbl_view')
                            .select('rf_notas_id', 'rf_notas_cliente', 'cliente', 'rf_notas_icms', 'id_escritorio', 'nome_fantasia', 'rf_notas_piscofins', 'rf_notas_itens_atualizados', 'rf_notas_chave_de_acesso', 'rf_notas_tipo_nota', 'rf_notas_modelo_doc', 'rf_notas_antecipados', 'rf_notas_data_sincronizacao', 'rf_notas_erro', 'numero', 'nome_pj_emitente')
                            .where('nome_fantasia', nome_fantasia)
                            .andWhere('rf_notas_itens_atualizados', '>', '0')
                            .whereIn('rf_notas_data_sincronizacao_mes', months)
                            .limit(4)
                            .then(async(rows) => {
                                const data4Table = JSON.stringify(await dateRowsAdjustments(rows, "rf_notas_data_sincronizacao"));
                                if (data4Table) {
                                   return res.send({
                                        data4Table,
                                        contador
                                    });
                                } else {
                                   return res.status(204)
                                }
                            }).catch((error) => {
                                console.log("APP ===>", error);
                            })

                    }

                })

        } catch (error) {
           return res.status(500)
        }

    },

    async requestRoboFiscalProdutos(req, res) {

        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario,
            email
        } = req.session.userData
        try {
            var dataTable
            knexPostgre('dbo.robofiscal_controle_produtos_tbl_view')
                .select('rf_prod_id', 'rf_prod_cliente', 'cliente', 'rf_prod_icms', 'rf_prod_pisconfis', 'rf_prod_itens_atualizados', 'rf_prod_escritorio', 'rf_prod_erp', 'rf_prod_database', 'rf_prod_tipo_sincronizacao', 'rf_prod_erro', 'rf_prod_data_sincronizacao')
                .where('nome_fantasia', nome_fantasia)
                .andWhere('rf_prod_itens_atualizados', '>', 0)
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
