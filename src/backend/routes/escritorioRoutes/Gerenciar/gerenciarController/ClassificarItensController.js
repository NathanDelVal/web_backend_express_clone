const moment = require('moment');
const { knexPostgre } = require("../../../../database/knex");

module.exports = {
    async renderPage(req, res) {

        var {
            usuario,
            administrador,
            root,
            nome_fantasia,
            suporte
        } = req.session.userData


        if (root == "SIM") {
            try {
               return res.render("./_escritorio/_InternalUser/classificar-itens", {
                    usuario,
                    nome_fantasia,
                    administrador,
                    root,
                    suporte,
                });
            } catch (error) {
               return res.status(500);
                console.log("APP ===>", error);
            }
        } else {
           return res.redirect("/acesso");
        }
    },

    async requestSearch(req, res) {
        var { administrador, root, nome_fantasia } = req.session.userData;
        var { buscadoclassificaritens, classificarRadios, ncmclassificaritens, eanclassificaritens } = req.body;
        if (root == "SIM") {
            var query = knexPostgre("dbo.produtos_tbl_view")
            .select("id_produto", "descricao_item", "ncm", "ean", "grupo", "subgrupo")
            .limit(2000)

            if (classificarRadios == "inicia") {
                try {
                    query.where(
                        function () {
                            this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`, [`${buscadoclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                        }
                    )

                    if (ncmclassificaritens) {
                        query.andWhere(
                            function () {
                                this.whereRaw(`unaccent(ncm) ILIKE unaccent(?)`, [`${ncmclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                            }
                        )
                    }
                    if (eanclassificaritens) {
                        query.andWhere(
                            function () {
                                this.whereRaw(`unaccent(ean) ILIKE unaccent(?)`, [`${eanclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                            }
                        )
                    }
                    query.then((rows) => {
                            var dataTable = JSON.stringify(rows);
                            if (dataTable.length != 0) {
                               return res.send({
                                    dataTable,
                                    buscadoclassificaritens,
                                });
                            } else {
                               return res.send({
                                    dataTable,
                                    buscadoclassificaritens,
                                });
                            }
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            throw error;
                        });
                } catch (error) {
                   return res.status(500);
                    console.log("APP ===>", error);
                    throw error;
                }
            } else if (classificarRadios == "contem") {
                try {
                    query.where(function() {

                        this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`, [`%${buscadoclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()

                        .orWhere(
                            function() {
                                this.whereRaw(`unaccent(ncm) ILIKE unaccent(?)`, [`%${buscadoclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                            }
                        )

                    })


                    if (ncmclassificaritens) {
                        query.andWhere(
                            function() {
                                this.whereRaw(`unaccent(ncm) ILIKE unaccent(?)`, [`%${ncmclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                            }
                        )
                    }
                    if (eanclassificaritens) {
                        query.andWhere(
                            function() {
                                this.whereRaw(`unaccent(ean) ILIKE unaccent(?)`, [`%${eanclassificaritens}%`]) //Postgre (case sensitive) Solved with unaccent()
                            }
                        )
                    }


                    query.then((rows) => {
                            var dataTable = JSON.stringify(rows);
                            if (dataTable.length != 0) {
                               return res.send({
                                    dataTable,
                                    buscadoclassificaritens,
                                });
                            } else {
                               return res.send({
                                    dataTable,
                                    buscadoclassificaritens,
                                });
                            }
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            throw error;
                        });
                } catch (error) {
                   return res.status(500);
                    console.log("APP ===>", error);
                    throw error;
                }
            } else {
               return res.status(405)
            }
        } else {
           return res.redirect("/acesso");
        }

    },

    async updateSingle(req, res) {

        var {
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData

        let flag0_pendente = 0;
        let flag1_pendente = 1;

        var id_item_modal = req.body.id_item_modal;
        var mva7 = req.body.mva7;
        var mva12 = req.body.mva12;
        var tipoantecipado = req.body.tipoantecipado;
        var descricao = req.body.descricao;
        var validei_flag = req.body.valido;

        var id_linha_validei = req.body.id_linha_validei; // nesse caso não foi preciso'transformar' em array pois a mesma já foi convertida em array no front end
        //var arrayId = new Array();
        //arrayId = id_linha_validei.split(",");
        //console.log("arrayId::", arrayId)

        if (
            id_item_modal != undefined &&
            mva7 != undefined &&
            mva12 != undefined &&
            tipoantecipado != undefined
        ) {
            if (
                id_item_modal.length > 0 &&
                mva7.length > 0 &&
                mva12.length > 0 &&
                tipoantecipado.length > 0
            ) {
                try {
                    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                    knexPostgre("dbo.produtos_tbl_view")
                        .where("descricao_item", descricao)
                        .andWhere("nome_fantasia", nome_fantasia)
                        .update({
                            mva_7: mva7,
                            mva_12: mva12,
                            tipo_antecipado: tipoantecipado,
                            pendente: flag1_pendente,
                            usuario: usuario,
                            modificado: getdate,
                        })
                        .then((rows) => {
                            let rowsAffected = rows;
                            console.log("result UPDATE : ", rows);
                            if (rowsAffected > 0) {
                               return res.send("Dados atualizados!");
                            } else {
                               return res.send("Erro ao gravar novos dados!");
                            }
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            throw error;
                        });
                } catch (error) {
                   return res.status(500).res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador, root });
                }
            }
        }

        if (id_linha_validei != undefined && validei_flag != undefined) {
            if (id_linha_validei.length > 0 && validei_flag == "validado") {
                //Converte se o id_linha_validei se o mesmo não for um ARRAY
                if (!Array.isArray(id_linha_validei)) {
                    var arrayId = new Array();
                    arrayId = id_linha_validei.split(",");
                } else {
                    arrayId = id_linha_validei;
                }

                try {
                    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                    knexPostgre("dbo.produtos_tbl_view")
                        .whereIn("id_produto", arrayId)
                        .andWhere("nome_fantasia", nome_fantasia)
                        .update({
                            pendente: flag0_pendente,
                            usuario: usuario,
                            modificado: getdate,
                        })
                        .then((rows) => {
                            let rowsAffected = rows;
                            if (rowsAffected == 1) {
                               return res.send("Linha Validada!");
                            } else if (rowsAffected > 1) {
                               return res.send("Linhas Validadas!");
                            } else {
                               return res.send("Erro ao validar!");
                            }
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            throw error;
                        });
                } catch (error) {
                    console.log("ERRO AO VALIDAR VÁRIAS LINHAS: ", error);
                   return res.status(500).res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador, root });
                }
            }
        }
    },

    async updateMulti(req, res) {

        var {
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData

        let flag0_pendente = 0;
        let flag1_pendente = 1;

        //ZERA VARIÁVEIS
        var ids_multiplos = "";
        var mva7 = "";
        var mva12 = "";
        var tipoantecipado = "";

        //ATUALIZA DADOS MODAL
        ids_multiplos = req.body.ids_multiplos;
        mva7 = req.body.mva7_multiplos;
        console.log("mva7", mva7);
        mva12 = req.body.mva12_multiplos;
        tipoantecipado = req.body.tipoantecipado_multiplos;

        //console.log("DESCRIÇÃO: ", descricao)

        if (
            ids_multiplos != undefined &&
            mva7 != undefined &&
            mva12 != undefined &&
            tipoantecipado != undefined
        ) {
            //console.log("to aqui")

            if (
                ids_multiplos.length > 0 &&
                mva7.length > 0 &&
                mva12.length > 0 &&
                tipoantecipado.length > 0
            ) {
                if (
                    ids_multiplos != " " &&
                    mva7 != " " &&
                    mva12 != " " &&
                    tipoantecipado != " "
                ) {
                    console.log("to aqui tmb aaaa");
                    try {
                        var arrayId = new Array();
                        arrayId = ids_multiplos.split(",");
                        let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                        knexPostgre("dbo.produtos_tbl_view")
                            .whereIn("id_produto", arrayId)
                            .andWhere("nome_fantasia", nome_fantasia)
                            .update({
                                mva_7: mva7,
                                mva_12: mva12,
                                tipo_antecipado: tipoantecipado,
                                pendente: flag1_pendente,
                                Usuario: usuario,
                                Modificado: getdate,
                            })
                            .then((rows) => {
                                let rowsAffected = rows;

                                if (rowsAffected > 0) {
                                   return res.send("Dados atualizados!");
                                } else {
                                   return res.send("Erro ao gravar novos dados!");
                                }
                            })
                            .catch((error) => {
                                console.log("APP ===>", error);
                                throw error;
                            });
                    } catch (error) {
                       return res.status(500).res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador });
                    }
                }
            }
        }

        if (
            ids_multiplos.length > 0 &&
            mva7 == " " &&
            mva12 == " " &&
            tipoantecipado.length > 0
        ) {

            //console.log("Só validei")
            var arrayId = new Array();
            arrayId = ids_multiplos.split(",");
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                knexPostgre("dbo.produtos_tbl_view")
                    .whereIn("id_produto", arrayId)
                    .andWhere("nome_fantasia", nome_fantasia)
                    .update({
                        tipo_antecipado: tipoantecipado,
                        pendente: flag1_pendente,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        let rowsAffected = rows;
                        if (rowsAffected > 0) {
                           return res.send(
                                "Tipo Antecipado das linhas selecionadas foram atualizado!"
                            );
                        } else {
                           return res.send("Erro ao atualizar Tipo Antecipado!");
                        }
                    })
                    .catch((error) => {
                        console.log("APP ===>", error);
                        throw error;
                    });
            } catch (error) {
               return res.status(500);
            }
        }
    },
};
