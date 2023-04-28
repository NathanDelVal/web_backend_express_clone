const fs = require('fs');
const crypto = require('crypto');
const hbs = require('hbs')
const { knexPostgre } = require('../../database/knex');
const VerifyBadgeSuporteMSG = require('../../routes/VerifyBadgeSupporteMSG');
var localVariables = require('../localVariables');
const moment = require('moment');

module.exports = {

    async renderPage(req, res) {
        var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        try {
           return res.render("./_escritorio/_EndUser/graficos", { administrador, root, suporte, nome_fantasia, email, bi, plano });
        } catch (error) {
            return res.redirect("/");
        }
    },


    async requestGraficoConsumo(req, res) {
        var { id_escritorio } = req.session.userData
        const dateRowsAdjustments = async (data) => {
            var check = moment();
            var month = check.format('MM');
            var year = check.format('YYYY');
            var mes_atual = year + '-' + month + '-' + '01';
            var x = await data.map(function (new_data) {
                new_data.inserido = moment(new_data.inserido, "YYYY-MM-DD").valueOf()
                new_data.mes_atual = moment(mes_atual, "YYYY-MM-DD").valueOf();
                return new_data
            })
            if (x) {
               return res.send({ x })
            }
        }
        knexPostgre.from('consumo_notas_view').withSchema('dbo')
            .select('sum_notas', 'inserido')
            .where({ 'id_escritorio': id_escritorio })
            .orderBy('inserido', 'ASC')
            .then((rows) => {
                console.log("nova data ======> ", row)
                if (rows) {
                    dateRowsAdjustments(rows);
                }
                else {
                   return res.status(204);
                }
            })
    },

    async requestGraficoConsumoTotal(req, res) {
        var data = moment();
        var mes = data.format('M');
        var ano = data.format('YYYY');
        var mes_atual = ano + '-' + mes + '-' + '1';
        var { administrador, root, id_escritorio } = req.session.userData
        console.log(" sss ", id_escritorio, "mes" , mes_atual );
        try {
            knexPostgre('dbo.notas_tbl')
                .count('id_nota' , { as: 'consumo'})
                .where('id_escritorio', id_escritorio)
                .then((rows) => {
                    try {
                        console.log("aquiii")
                        var consumo_total = rows[0].consumo;
                        console.log("dados do consumo total ===>", consumo_total)
                        knexPostgre('notas_tbl')
                            .count('id_nota', { as: 'consumo'})
                            .where('id_escritorio', id_escritorio)
                            .andWhere('inserido', '>=', mes_atual)
                            .then((rows) => {
                                var consumo_mensal = rows[0].consumo;
                                console.log("dados do consumo mensal ===>", consumo_mensal)
                                try {
                                   return res.send({
                                        'consumo_total': consumo_total,
                                        'consumo_mensal': consumo_mensal
                                    });
                                } catch (error) {
                                    console.log("APP ===>", error);
                                    return res.status(500);
                                }
                            })
                            .catch((error) => {
                                console.log("APP ===>", error);
                                return res.status(500);
                            });
                    } catch (error) {
                        console.log("APP ===>", error);
                        return res.status(500);
                    }
                })
                .catch((error) => {
                    console.log("APP ===>", error);
                    return res.status(500);
                });
        } catch (error) {
            console.log("APP ===>", error);
            return res.status(500);
        }
    },


    async requestGraficoConsumoMensal(req, res) {
        //criando mês atual
        var data = moment();
        var mes = data.format('M');
        var ano = data.format('YYYY');
        var mes_atual = ano + '-' + mes + '-' + '1';
        var { administrador, root, id_escritorio } = req.session.userData
        if (administrador == "SIM" || root == "SIM") {
            try {
                knexPostgre('notas_tbl')
                    .count('id_nota')
                    .where('id_escritorio', id_escritorio)
                    .andWhere('Inserido', '>=', mes_atual)
                    .then((rows) => {
                        var consumo_mensal;
                        for (const [key, value] of Object.entries(rows[0])) {
                             consumo_mensal = `${value}`;
                        }
                        try {
                           return res.send({ consumo_mensal });
                        } catch (error) {
                            console.log("APP ===>", error);
                            return res.status(500);
                        }
                    })
                    .catch((error) => {
                        console.log("APP ===>", error);
                        return res.status(500);
                    });
            } catch (error) {
                console.log("APP ===>", error);
            }
        } else {
           return res.redirect("/acesso");
        }
    },

}

