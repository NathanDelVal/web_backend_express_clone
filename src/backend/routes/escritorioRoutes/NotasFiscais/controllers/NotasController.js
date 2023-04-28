const moment = require("moment");
const { knexPostgre } = require("../../../../database/knex");
const socket = require("../../../../server/serverSocket");
const VerifyBadgeSuporteMSG = require("../../VerifyBadgeSupporteMSG");
const { formatacoes } = require('../../../../APIs/DANFE/core/brasil/brazilian/brazilian')
const DanfeWebViewNfe = require('../../../../APIs/DANFE/webview_nfe');
const { makePDF } = require('../../../../APIs/DANFE/createpdf');

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
            res.render("./_escritorio/_EndUser/notas", {
                administrador,
                root,
                suporte,
                admuser: administrador,
                email,
                plano
            });
            //res.send(nomepjexistente);
        } catch (error) {
            console.log(error);
            res.render("acesso", { erro: error });
        }
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

            async function dateRowsAdjustments(rows){
                return await rows.map(function (row) {
                    row.data_emissao = moment(formatDate(row.data_emissao), "YYYY-MM-DD").format("DD/MM/YYYY");
                    row.data_entrada = moment(formatDate(row.data_entrada), "YYYY-MM-DD").format("DD/MM/YYYY");
                    // MEMO  =>> .add(1, 'days') adicionar um dia
                    return row
                });
            }
            buscaTabelaNotas = async (rOption, datainicial, datafinal) => {
                var query = knexPostgre("dbo.produtos_tbl").select("id_produto", "nome_pj_emitente", "cnpj_emitente", "destinatario", "cnpj_destinatario", "data_emissao", "data_entrada", "numero", "uf_origem", "descricao_item", "ean", "ncm", "cest", "cfop", "unidade", "valor_bruto", "mva_7", "mva_12", "tipo_antecipado", "cst_icms", "csosn_icms", "cst_piscofins_saida", "cst_piscofins_entrada", "natureza_receita_monofasico_aliqzero", "diferencial_de_aliquota", "nf_devolvida").where("id_escritorio", id_escritorio);

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
                }else{
                    query.limit(2000);
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
                                res.send({
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
                                res.send({
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
                                res.send({
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
                //return saida;
            };
            buscaTabelaNotas(radioNotas, datainicial, datafinal)
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


        var {nfdevolvida, marcados_nota_devolvida} = req.body


        var ids_selecionados = marcados_nota_devolvida;
        var arrayChavedeAcesso = new Array();
        arrayChavedeAcesso = ids_selecionados.split(",");

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

        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData

        var ids_selecionados = req.body.marcados_nota_aprovacao;
        var arrayId = new Array();
        arrayId = ids_selecionados.split(",");

        var pendente_flag_null = "NULL";

        if (ids_selecionados !== undefined && ids_selecionados != "") {
            try {
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                knexPostgre("dbo.produtos_tbl")
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
                            res.send("Nota eviada para aprovação com sucesso!");
                        } else if (rowsAffected > 1) {
                            res.send("Notas eviadas para aprovação com sucesso!");
                        } else {
                            res.send("Erro ao gravar dados, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log(error);

                    });
            } catch (error) {
                res.status(500);
                res.render("/notas");
            }
        }
    },


    async VisualizarNota(req, res) {
        var { id_escritorio } = req.session.userData
        var { numero_nota, cliente } = req.body

        numero_nota = formatacoes.removerMascara(numero_nota)

        //console.log('dadosssss: ', id_escritorio, numero_nota, cliente)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml", "chavedeacesso").from("xml_recebidos_processados_view").where("numero_nota", numero_nota).andWhere("destinatario", cliente).andWhere('id_escritorio', id_escritorio).limit(1)
                .then((result) => {
                    return result[0]
                })
            if (queryResult) {
                var danfe = DanfeWebViewNfe.fromXML(queryResult.arquivo_xml)
                if (danfe) {
                    res.send({danfe: danfe.toHtml(), chave_de_acesso: queryResult.chavedeacesso})
                } else {
                    res.send({danfe: "Nenhuma nota encontrada"})
                }
            } else {
                res.send({danfe: "Nenhuma nota encontrada"})
            }


        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }


    },

    async downloadPDF(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml").from("dbo.xml_recebidos_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1).then((result) => { return result[0] })
            if (queryResult) {
                makePDF(queryResult.arquivo_xml, '', function (error, pdf) {
                    if (error) {

                    } else {

                        res.writeHead(200, { 'Content-Type': 'application/pdf' });
                        res.end(pdf, 'binary');
                    }
                })
            } else {
                res.send("Arquivo não encontrado");
            }
            //res.send("recebemos esse chave == ", chave_de_acesso)

        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }

    },

    async downloadXML(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml").from("dbo.xml_recebidos_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                .then((result) => { return result[0] })
            if (queryResult) {
                //res.writeHead(200, { 'Content-Type': 'application/xml' });
                res.end(queryResult.arquivo_xml, 'binary');
            } else {
                res.send("Arquivo não encontrado");
            }
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },


    async reenviarNota(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        var arrayChavedeAcesso = new Array();
        arrayChavedeAcesso = chave_de_acesso.split(",");

        var response = {
            msg:''
        }
        try {
          knexPostgre("dbo.notas_tbl")
            .whereIn("chavedeacesso", arrayChavedeAcesso)
            .andWhere("id_escritorio", id_escritorio)
            .update({'situacao': 'REPROCESSAR', 'tag':'REPROCESSAR'})
            .then((rows) => {
                var rowsAffected = rows;
                response.msg = "Nota Fiscal reenviada para aprovação com sucesso!"
                if (rowsAffected > 1) {
                    response.msg = "Notas Fiscais reenviadas para aprovação com sucesso!"
                }
                else if(rowsAffected == 0) {
                    response.msg = "Erro ao gravar dados, tente novamente."
                }
                res.send(response)
            })
            .catch((error) => {
                res.send("Erro ao gravar dados, tente novamente.");
                console.log("APP ===>", error);
            });
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    }




};
