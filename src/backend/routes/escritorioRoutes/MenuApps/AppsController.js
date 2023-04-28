const moment = require("moment");
const {knexPostgre} = require("../../../database/knex");
const helper = require("../../helpers/suggestions");

module.exports = {
    async renderPage(req, res, next) {
        var { id_login, administrador, root, id_escritorio, suporte, email, plano, prod1, prod2, prod3, prod4, conta_escritorio, conta_empresa } = req.session.userData;

        try {
            return res.render("./_escritorio/_Home/menu-apps", {
                administrador,
                root,
                suporte,
                email,
                id_escritorio,
                prod1,
                prod2,
                prod3,
                prod4,
                plano,
                conta_escritorio,
                conta_empresa
            });
        } catch (error) {
            console.log(error);
            return res.render("acesso", { erro: error });
        }
    },

    async request(req, res) {
        var { administrador, root, suporte, escritorio } = req.session.userData[0];
        var { datainicial, datafinal, nomeBuscadoNotas, radioNotas } = req.body;
        var datasend;
        if (req.method == "POST") {
            var nomepjexistente = await helper.suggestions(escritorio);
            dateRowsAdjustments = async(rows) => {
                return (dataok = await rows.map(function(row) {
                    row.data_emissao = moment(row.data_emissao, "YYYY-MM-DD")
                        .add(1, "days")
                        .format("DD/MM/YYYY");
                    row.data_entrada = moment(row.data_entrada, "YYYY-MM-DD")
                        .add(1, "days")
                        .format("DD/MM/YYYY");
                    // MEMO  =>> .add(1, 'days') adicionar um dia
                    return row;
                }));
            };
            buscaTabelaNotas = async(rOption, datainicial, datafinal) => {
                var query = knexPostgre("dbo.produtos_tbl_view")
                    .limit(2000)
                    .select(
                        "id_produto",
                        "nome_pj_emitente",
                        "cnpj_emitente",
                        "destinatario",
                        "cnpj_destinatario",
                        "data_emissao",
                        "data_entrada",
                        "numero",
                        "uf_origem",
                        "descricao_item",
                        "ean",
                        "ncm",
                        "cest",
                        "cfop",
                        "unidade",
                        "valor_bruto",
                        "mva_7",
                        "mva_12",
                        "tipo_antecipado",
                        "cst_icms",
                        "csosn_icms",
                        "cst_piscofins_saida",
                        "cst_piscofins_entrada",
                        "natureza_receita_monofasico_aliqzero",
                        "diferencial_de_aliquota",
                        "nf_devolvida"
                    )
                    .where("escritorio", escritorio);

                if (datainicial && datafinal) {
                    //FORMATAR DATA
                    //.add(1, "days")
                    var datade_formatado = await moment(datainicial, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                    );
                    var dataate_formatado = await moment(datafinal, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                    );

                    query.andWhere(function() {
                        this.where(
                            "data_emissao",
                            ">=",
                            datade_formatado + "T00:00:00.000Z"
                        ).andWhere("data_emissao", "<=", dataate_formatado);
                    });
                }
                if (rOption == "entrada") {
                    //console.log("rOption entrada ", rOption)
                    query
                        .andWhere(function() {
                            this.where("destinatario", nomeBuscadoNotas).orWhere(
                                "cnpj_destinatario",
                                nomeBuscadoNotas
                            );
                        })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok);
                                res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    escritorio,
                                    nomepjexistente,
                                });
                            });
                        });
                } else if (rOption == "saida") {
                    //console.log("rOption saida ", rOption)
                    query
                        .andWhere(function() {
                            this.where("nome_pj_emitente", nomeBuscadoNotas).orWhere(
                                "cnpj_emitente",
                                nomeBuscadoNotas
                            );
                        })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok);
                                res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    escritorio,
                                    nomepjexistente,
                                });
                            });
                        });
                } else if (rOption == "servico") {
                    //console.log("rOption servico ", rOption)
                    query
                        .andWhere(function() {
                            this.where("nome_pj_emitente", nomeBuscadoNotas).orWhere(
                                "cnpj_destinatario",
                                nomeBuscadoNotas
                            );
                        })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok);
                                res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    escritorio,
                                    nomepjexistente,
                                });
                            });
                        });
                }
                //return saida;
            };
            buscaTabelaNotas(radioNotas, datainicial, datafinal);
        }
    },

    async updateDataEntrada(req, res) {

        var {
            administrador,
            root,
            escritorio,
            suporte,
            usuario
        } = req.session.userData

        var ids_selecionados = req.body.marcados_alterar_data;
        var nova_data = req.body.dataentrada; //dd/mm/yyyy
        var Data_Formato_Banco = ""; //yyyy/mm/dd
        if (req.method == "POST") {
            if (nova_data != undefined && nova_data != "") {
                Data_Formato_Banco = moment(nova_data, "DD/MM/YYYY").format(
                    "YYYY-MM-DD"
                );

                var arrayId = new Array();
                arrayId = ids_selecionados.split(",");

                try {
                    var rowsAffected = "";
                    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                    knexPostgre("dbo.produtos_tbl_view")
                        .whereIn("id_produto", arrayId)
                        .andWhere("escritorio", escritorio)
                        .update({
                            data_entrada: [Data_Formato_Banco],
                            usuario: usuario,
                            modificado: getdate,
                        })
                        .then((rows) => {
                            rowsAffected = rows;
                            //console.log("rowsAffected ---> ", rows)
                            rowsData = rows;

                            if (rowsAffected > 0) {
                                res.send("Data de Entrada atualizada!");
                            } else {
                                res.send("Erro ao gravar dados, tente novamente.");
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500);
                        });
                } catch (error) {
                    res.status(500);
                    res.render("/notas");
                }
            } else {
                res.send("Erro ao gravar dados, tente novamente.");
            }
        } else {
            res.status(400);
        }
    },

    async updateDifAliquota(req, res) {

        var {
            administrador,
            root,
            escritorio,
            suporte,
            usuario
        } = req.session.userData

        var ids_selecionados = req.body.marcados_alterar_aliq;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var aliquota = req.body.aliquotadiferenciada; //dd/mm/yyyy

        if (aliquota !== undefined && aliquota !== "") {
            try {
                var rowsAffected = "";
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                knexPostgre("dbo.produtos_tbl_view")
                    .whereIn("id_produto", arrayId)
                    .andWhere("escritorio", escritorio)
                    .update({
                        Diferêncial_de_Alíquota: aliquota,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        rowsAffected = rows;
                        //console.log("Linhas afetadas = ", rowsAffected)

                        if (rowsAffected == 1) {
                            res.send("Diferêncial de Alíquota atualizado!");
                        } else if (rowsAffected > 1) {
                            res.send("Diferênciais de Alíquota atualizados!");
                        } else {
                            res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        res.send("Erro ao gravar dados, tente novamente.");
                        console.log(error);
                        res.status(500);
                    });
            } catch (error) {
                res.status(500);
                res.render("/notas");
            }
        }
    },

    async updateNotasDevolvidas(req, res) {

        var {
            administrador,
            root,
            escritorio,
            suporte,
            usuario
        } = req.session.userData

        var ids_selecionados = req.body.marcados_nota_devolvida;
        var arrayChavedeAcesso = new Array();
        arrayChavedeAcesso = ids_selecionados.split(",");

        var {nfdevolvida} = req.body

        if (nfdevolvida !== undefined && nfdevolvida !== "") {
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                knexPostgre("dbo.produtos_tbl_view")
                    .whereIn("chavedeacesso", arrayChavedeAcesso)
                    .andWhere("escritorio", escritorio)
                    .update({
                        'nf_devolvida': nfdevolvida,
                        'usuario': usuario,
                        'modificado': getdate,
                    })
                    .then((rows) => {
                        var rowsAffected = rows;
                        //console.log("result devolvidas : ", rows)

                        if (rowsAffected == 1) {
                            res.send("Status Nota Fiscal Devolvida atualizado com sucesso!");
                        } else if (rowsAffected > 1) {
                            res.send(
                                "Status Notas Fiscais Devolvidas atualizados com sucesso!"
                            );
                        } else {
                            res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        res.send("Erro ao gravar dados, tente novamente.");
                        console.log(error);
                        res.status(500);
                    });
            } catch (error) {
                //res.status(500)
                res.render("/notas");
            }
        } else {
            res.render("/notas");
        }
    },

    async updateRetornaAprovacao(req, res) {
        var {
            administrador,
            root,
            escritorio,
            suporte,
            usuario
        } = req.session.userData

        var ids_selecionados = req.body.marcados_nota_aprovacao;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var pendente_flag_null = "NULL";

        if (ids_selecionados !== undefined && ids_selecionados != "") {
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                knexPostgre("dbo.produtos_tbl_view")
                    .whereIn("id_produto", arrayId)
                    .andWhere("escritorio", escritorio)
                    .update({
                        pendente: pendente_flag_null,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        var rowsAffected = rows;
                        if (rowsAffected == 1) {
                            res.send("Nota eviada para aprovação com sucesso!");
                        } else if (rowsAffected > 1) {
                            res.send("Notas eviadas para aprovação com sucesso!");
                        } else {
                            res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500);
                    });
            } catch (error) {
                res.status(500);
                res.render("/notas");
            }
        }
    },
};
