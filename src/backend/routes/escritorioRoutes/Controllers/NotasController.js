const moment = require("moment");
const { knexPostgre } = require("../../database/knex");
var localVariables = require("../localVariables");
const { request } = require("./RecuperarSenhaController");
const socket = require("../../server/serverSocket");
const VerifyBadgeSuporteMSG = require("../../routes/VerifyBadgeSupporteMSG");
const { suggestions } = require("../helpers/suggestions");
const { renderPage } = require("./RegrasController");

const { formatacoes } = require('../../APIs/DANFE/core/brasil/brazilian/brazilian')
const DanfeWebViewNfe = require('../../APIs/DANFE/webview_nfe');
const { makePDF } = require('../../APIs/DANFE/createpdf');

module.exports = {
    async renderPage(req, res, next) {

        var {
            administrador,
            root,
            nome_fantasia,
            email,
            suporte,
            plano
        } = req.session.userData;

        //QUERY DO SUGGESTIONS
        try {
            VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
            return res.render("./_escritorio/_EndUser/notas", {
                administrador,
                root,
                suporte,
                admuser: administrador,
                email,
                plano
            });
        } catch (error) {
            console.log("APP ===>", error);
            return res.render("acesso", { erro: error });
        }
    },

    async requestOnlySuggestions(req, res) {
        var { administrador, root, suporte, nome_fantasia, id_escritorio } = req.session.userData;
        const suggestions_nomepj = JSON.stringify(await suggestions(nome_fantasia));
        return res.send(suggestions_nomepj)
    },

    async request(req, res) {
        var { administrador, root, suporte, nome_fantasia, id_escritorio } = req.session.userData;
        var { datainicial, datafinal, nomeBuscadoNotas, radioNotas } = req.body;
        var datasend;
        if (req.method == "POST") {

            function formatDate(date) {
                var d = new Date(date),
                    month = '' + (d.getUTCMonth() + 1),
                    day = '' + d.getUTCDate(),
                    year = d.getUTCFullYear();
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                return [year, month, day].join('-');
            }

            dateRowsAdjustments = async (rows) => {
                return dataok = await rows.map(function (row) {
                    row.data_emissao = moment(formatDate(row.data_emissao), "YYYY-MM-DD").format("DD/MM/YYYY");
                    row.data_entrada = moment(formatDate(row.data_entrada), "YYYY-MM-DD").format("DD/MM/YYYY");
                    // MEMO  =>> .add(1, 'days') adicionar um dia
                    return row
                });
            }
            buscaTabelaNotas = async (rOption, datainicial, datafinal) => {
                var query = knexPostgre("produtos_tbl").withSchema("dbo").limit(2000).select("id_produto", "nome_pj_emitente", "cnpj_emitente", "destinatario", "cnpj_destinatario", "data_emissao", "data_entrada", "numero", "uf_origem", "descricao_item", "ean", "ncm", "cest", "cfop", "unidade", "valor_bruto", "mva_7", "mva_12", "tipo_antecipado", "cst_icms", "csosn_icms", "cst_piscofins_saida", "cst_piscofins_entrada", "natureza_receita_monofasico_aliqzero", "diferencial_de_aliquota", "nf_devolvida").where("id_escritorio", id_escritorio);

                if (datainicial && datafinal) {
                    //FORMATAR DATA
                    //.add(1, "days")
                    var datade_formatado = await moment(datainicial, "DD/MM/YYYY").format("YYYY-MM-DD");
                    var dataate_formatado = await moment(datafinal, "DD/MM/YYYY").format("YYYY-MM-DD");

                    query.andWhere(function () {
                        this.where(
                            "data_emissao",
                            ">=",
                            datade_formatado + "T00:00:00.000Z"
                        ).andWhere("data_emissao", "<=", dataate_formatado);
                    })
                }
                if (rOption == "entrada") {
                    //console.log("rOption entrada ", rOption)
                    query.andWhere(function () {
                        this.where("destinatario", nomeBuscadoNotas)
                            .orWhere("cnpj_destinatario", nomeBuscadoNotas)
                    })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok)
                                return res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    nome_fantasia
                                })
                            })

                        });
                } else if (rOption == "saida") {
                    //console.log("rOption saida ", rOption)
                    query.andWhere(function () {
                        this.where("nome_pj_emitente", nomeBuscadoNotas)
                            .orWhere("cnpj_emitente", nomeBuscadoNotas)
                    })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok)
                                return res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    nome_fantasia,
                                    nomepjexistente
                                })
                            })
                        });
                } else if (rOption == "servico") {
                    //console.log("rOption servico ", rOption)
                    query.andWhere(function () {
                        this.where("nome_pj_emitente", nomeBuscadoNotas)
                            .orWhere("cnpj_destinatario", nomeBuscadoNotas)
                    })
                        .then((rows) => {
                            dateRowsAdjustments(rows).then((dataok) => {
                                datasend = JSON.stringify(dataok)
                                return res.send({
                                    datasend,
                                    administrador,
                                    root,
                                    suporte,
                                    nomeBuscadoNotas,
                                    nome_fantasia,
                                    nomepjexistente
                                })
                            })
                        });
                }
            };
            buscaTabelaNotas(radioNotas, datainicial, datafinal)
        }

    },

    async updateDataEntrada(req, res) {
        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData
        var ids_selecionados = req.body.marcados_alterar_data;
        var nova_data = req.body.dataentrada; //dd/mm/yyyy
        var Data_Formato_Banco = ""; //yyyy/mm/dd
        if (req.method == "POST") {

            if (nova_data != undefined && nova_data != "") {
                Data_Formato_Banco = moment(nova_data, "DD/MM/YYYY").format("YYYY-MM-DD");

                var arrayId = new Array();
                arrayId = ids_selecionados.split(",");

                try {
                    var rowsAffected = "";
                    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                    knexPostgre("produtos_tbl").withSchema("dbo")
                        .whereIn("id_produto", arrayId)
                        .andWhere("id_escritorio", id_escritorio)
                        .update({
                            data_entrada: [Data_Formato_Banco],
                            usuario: usuario,
                            modificado: getdate,
                        })
                        .then((rows) => {
                            console.log("foi ? ", rows)
                            rowsAffected = rows;
                            rowsData = rows;

                            if (rowsAffected > 0) {
                                return res.send("Data de Entrada atualizada!");
                            } else {
                                return res.send("Erro ao gravar dados, tente novamente.");
                            }
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            return res.status(500);
                        });
                } catch (error) {
                    console.log("APP ===>", error)
                    return res.status(500).render("/notas");
                }
            } else {
                return res.send("Erro ao gravar dados, tente novamente.");
            }
        } else {
            return res.status(400);
        }
    },

    async updateDifAliquota(req, res) {

        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData

        var ids_selecionados = req.body.marcados_alterar_aliq;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var aliquota = req.body.aliquotadiferenciada; //dd/mm/yyyy

        if (aliquota !== undefined && aliquota !== "") {
            try {
                var rowsAffected = "";
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                knexPostgre("produtos_tbl").withSchema("dbo")
                    .whereIn("id_produto", arrayId)
                    .andWhere("id_escritorio", id_escritorio)
                    .update({
                        Diferêncial_de_Alíquota: aliquota,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        rowsAffected = rows;

                        if (rowsAffected == 1) {
                            return res.send("Diferêncial de Alíquota atualizado!");
                        } else if (rowsAffected > 1) {
                            return res.send("Diferênciais de Alíquota atualizados!");
                        } else {
                            return res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log("APP ===>", error);
                        return res.status(500).res.send("Erro ao gravar dados, tente novamente.");
                    });
            } catch (error) {
                return res.status(500).res.render("/notas");
            }
        }
    },

    async updateNotasDevolvidas(req, res) {

        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData

        var ids_selecionados = req.body.marcados_nota_devolvida;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var devolvida = req.body.nfdevolvida;

        if (devolvida !== undefined && devolvida !== "") {
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                knexPostgre("produtos_tbl").withSchema("dbo")
                    .whereIn("id_produto", arrayId)
                    .andWhere("id_escritorio", id_escritorio)
                    .update({
                        NF_Devolvida: devolvida,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        var rowsAffected = rows;

                        if (rowsAffected == 1) {
                            return res.send("Status Nota Fiscal Devolvida atualizado com sucesso!");
                        } else if (rowsAffected > 1) {
                            return res.send("Status Notas Fiscais Devolvidas atualizados com sucesso!");
                        } else {
                            return res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).send("Erro ao gravar dados, tente novamente.");
                    });
            } catch (error) {
                //res.status(500)
                return res.render("/notas");
            }
        } else {
            return res.render("/notas");
        }
    },

    async updateRetornaAprovacao(req, res) {

        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData

        var ids_selecionados = req.body.marcados_nota_aprovacao;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var pendente_flag_null = "NULL";

        if (ids_selecionados !== undefined && ids_selecionados != "") {
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                knexPostgre("produtos_tbl").withSchema("dbo")
                    .whereIn("id_produto", arrayId)
                    .andWhere("id_escritorio", id_escritorio)
                    .update({
                        pendente: pendente_flag_null,
                        usuario: usuario,
                        modificado: getdate,
                    })
                    .then((rows) => {
                        var rowsAffected = rows;
                        if (rowsAffected == 1) {
                            return res.send("Nota eviada para aprovação com sucesso!");
                        } else if (rowsAffected > 1) {
                            return res.send("Notas eviadas para aprovação com sucesso!");
                        } else {
                            return res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log("APP ===>", error.message);
                        return res.status(500);
                    });
            } catch (error) {
                console.log("APP ===>", error.message)
                return res.status(500).send("Erro ao gravar dados, tente novamente.");
            }
        }
    },


    async VisualizarNota(req, res) {
        var { id_escritorio } = req.session.userData
        var { numero_nota, cliente } = req.body
        numero_nota = formatacoes.removerMascara(numero_nota)

        try {
            const queryResult = await knexPostgre.select("arquivo_xml", "chavedeacesso")
                .from("xml_recebidos_tbl_view")
                .where("numero_nota", numero_nota)
                .andWhere("destinatario", cliente)
                .andWhere('id_escritorio', id_escritorio)
                .limit(1)
                .then((result) => { return result[0] });
            if (queryResult) {
                var danfe = DanfeWebViewNfe.fromXML(queryResult.arquivo_xml)
                if (danfe) {
                    return res.send({ danfe: danfe.toHtml(), chave_de_acesso: queryResult.chavedeacesso })
                } else {
                    return res.send({ danfe: "Nenhuma nota encontrada" })
                }
            } else {
                return res.send({ danfe: "Nenhuma nota encontrada" })
            }


        } catch (error) {
            console.log("APP ===>", error);
            return res.status(500);
        }


    },

    async downloadPDF(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml").from("xml_recebidos_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1).then((result) => { return result[0] })
            if (queryResult) {
                makePDF(queryResult.arquivo_xml, '', function (error, pdf) {
                    if (error) {
                        return res.status(500);
                    } else {
                        return res.writeHead(200, { 'Content-Type': 'application/pdf' }).end(pdf, 'binary');
                    }
                })
            } else {
                return res.send("Arquivo não encontrado");
            }
        } catch (error) {
            return res.status(500);
            console.log("APP ===>", error);
        }

    },

    async downloadXML(req, res) {
        var { id_escritorio } = req.session.userData;
        var { chave_de_acesso } = req.body;
        try {
            chave_de_acesso = formatacoes.removerMascara(chave_de_acesso);
            const queryResult = await knexPostgre.select("arquivo_xml")
                .limit(1)
                .from("xml_recebidos_processados_view")
                .where("chavedeacesso", formatacoes.removerMascara(chave_de_acesso))
                .andWhere('id_escritorio', id_escritorio)
                .then((result) => { return result[0] });

            if (queryResult) {
                return res.end(queryResult.arquivo_xml, 'binary'); //res.writeHead(200, { 'Content-Type': 'application/xml' });
            } else {
                return res.send("Arquivo não encontrado");
            }
        } catch (error) {
            console.log("APP ===>", error);
            return res.status(500);
        }
    },


};
