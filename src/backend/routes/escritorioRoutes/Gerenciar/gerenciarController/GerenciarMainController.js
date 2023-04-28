const moment = require('moment');
const { knexPostgre } = require('../../../../database/knex');
const VerifyBadgeSuporteMSG = require('../../../escritorioRoutes/VerifyBadgeSupporteMSG');

module.exports = {

    async renderPage(req, res) {
        var { administrador, root, nome_fantasia, email, suporte, bi } = req.session.userData;

        try {
            res.redirect("/gerenciar/consumo");
        } catch (error) {
            //res.status(500)
            res.redirect("/");
        }
    },

    async renderPageConsumo(req, res) {
        //console.log("cheguei na rota")
        var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        try {
            //console.log("cheguei no try")
            res.render("./_escritorio/_EndUser/consumo", { administrador, root, suporte, nome_fantasia, email, bi, plano });
            //console.log("passei no render")
        } catch (error) {
            //res.status(500)
            //console.log("cheguei no error", error)
            res.redirect("/");
        }

    },

    async requestGraficoConsumo(req, res) {

        var { id_escritorio } = req.session.userData

        const dateRowsAdjustments = async(data) => {

            var check = moment();
            var month = check.format('M');
            var year = check.format('YYYY');
            var mes_atual = year + '-' + month + '-' + '1';

            var x = await data.map(function(new_data) {
                new_data.inserido = moment(new_data.inserido, "YYYY-MM-DD").valueOf()
                new_data.mes_atual = moment(mes_atual, "YYYY-MM-DD").valueOf();
                return new_data
            })
            if (x) {
                res.send({ x })
            }
        }

        //tem como colocar nesse select aqui um sum(sum_notas) e por numa variavel e mandar pra pagina?
        knexPostgre.from('consumo_notas_view').withSchema('dbo')
            .select('sum_notas', 'inserido')
            .where({ 'id_escritorio': id_escritorio })
            .orderBy('inserido', 'ASC')
            .then((rows) => {
                //console.log("nova data ======> ", row)
                if (rows) {
                    dateRowsAdjustments(rows)
                } else {
                    res.status(204)
                }
            })
    },


    async requestGraficoConsumoTotal(req, res) {
        //criando mês atual
        var data = moment();
        var mes = data.format('MM');
        var ano = data.format('YYYY');
        var mes_atual = ano + '-' + mes + '-' + '01';
        var { administrador, root, id_escritorio, plano } = req.session.userData
        try {
            knexPostgre.withSchema('dbo').from('notas_tbl')
                .count('id_nota', { as: 'consumo'})
                .where('id_escritorio', id_escritorio)
                .then((rows) => {
                    try {
                        var consumo_total = rows[0].consumo;
                        knexPostgre.withSchema('dbo').from('notas_tbl')
                            .count('id_nota', { as: 'consumo'})
                            .where('id_escritorio', id_escritorio)
                            .andWhere('inserido', '>=', mes_atual)
                            .then((rows) => {
                                var consumo_mensal = rows[0].consumo;
                                try {
                                    res.send({
                                        'consumo_total': consumo_total,
                                        'consumo_mensal': consumo_mensal,
                                        'plano': plano

                                    });
                                } catch (error) {
                                    console.log(error);
                                    res.status(500);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500);
                            });
                    } catch (error) {
                        console.log(error);
                        res.status(500);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500);
                });
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    },


    async requestGraficoConsumo(req, res) {
        var { id_escritorio } = req.session.userData
        const dateRowsAdjustments = async (data) => {
            var check = moment();
            var month = check.format('MM');
            var year = check.format('YYYY');
            //console.log("dados do dia atual ===> ", month, day, year)
            var mes_atual = year + '-' + month + '-' + '01';
            //console.log("compondo o nome ======>", mes_atual)
            var x = await data.map(function (new_data) {
                new_data.inserido = moment(new_data.inserido, "YYYY-MM-DD").valueOf()
                new_data.mes_atual = moment(mes_atual, "YYYY-MM-DD").valueOf();
                return new_data
            })
            if (x) {
                res.send({ x })
            }
        }
        //tem como colocar nesse select aqui um sum(sum_notas) e por numa variavel e mandar pra pagina?
        knexPostgre.from('consumo_notas_view').withSchema('dbo')
            .select('sum_notas', 'inserido')
            .where({ 'id_escritorio': id_escritorio })
            .orderBy('inserido', 'asc')
            .then((rows) => {
                //console.log("nova data ======> ", row)
                if (rows) {
                    dateRowsAdjustments(rows)
                }
                else {
                    res.status(204)
                }
            })
    },
/*
    async requestGraficoConsumoTotal(req, res) {
        //criando mês atual
        var data = moment();
        var mes = data.format('MM');
        var ano = data.format('YYYY');
        var mes_atual = ano + '-' + mes + '-' + '01';
        var { administrador, root, id_escritorio } = req.session.userData
        try {
            knexPostgre('dbo.notas_tbl')
                .count('id_nota' , { as: 'consumo'})
                .where('id_escritorio', id_escritorio)
                .then((rows) => {
                    //dataTable = JSON.stringify(rows);
                    try {
                        var consumo_total = rows[0].consumo;
                        console.log("dados do consumo total ===>", consumo_total)
                        knexPostgre('notas_tbl')
                            .count('id_nota', { as: 'consumo'})
                            .where('id_escritorio', id_escritorio)
                            .andWhere('Inserido', '>=', mes_atual)
                            .then((rows) => {
                                var consumo_mensal = rows[0].consumo;
                                console.log("dados do consumo mensal ===>", consumo_mensal)
                                try {
                                    res.send({
                                        'consumo_total': consumo_total,
                                        'consumo_mensal': consumo_mensal
                                    });
                                } catch (error) {
                                    res.status(500);
                                    console.log(error);
                                    res.status(500);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500);
                            });
                    } catch (error) {
                        res.status(500);
                        console.log(error);
                        res.status(500);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500);
                });
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    },
*/

    async requestGraficoConsumoMensal(req, res) {
        //criando mês atual
        var data = moment();
        var mes = data.format('MM');
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
                        for (const [key, value] of Object.entries(rows[0])) { consumo_mensal = `${value}`; }
                        //console.log("dados do consumo total ===>", consumo_mensal)
                        try {
                            res.send({ consumo_mensal });
                        } catch (error) {
                            res.status(500);
                            console.log(error);
                            res.status(500);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500);
                    });
            } catch (error) {
                console.log(error);
            }
        } else {
            res.redirect("/acesso");
        }
    },



    async renderPagePendencias(req, res) {
        //console.log("cheguei na rota renderPagePendencias")
        var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        //console.log("ok")
        try {
            //console.log("cheguei no try")
            res.render("./_escritorio/_InternalUser/pendencias", { administrador, root, suporte, nome_fantasia, email, bi, plano });
            //console.log("passei no render")
        } catch (error) {
            //res.status(500)
            //console.log("cheguei no error", error)
            res.redirect("/");
        }

    },


}

