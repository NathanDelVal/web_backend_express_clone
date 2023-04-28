const moment = require('moment');
const xml2js = require('xml2js');
const { knexPostgre } = require("../../../database/knex");
const DanfeWebView_Nfe = require('../../../APIs/DANFE/webview_nfe');
const DanfeWebView_Nfce = require('../../../APIs/DANFE/webview_nfce');
const { makePDF } = require('../../../APIs/DANFE/createpdf');
const Suggestions = require("../../helpers/suggestions");
const { redisClient, redisCache } = require('../../../database/redis');
const { formatacoes } = require('../../../APIs/DANFE/core/brasil/brazilian/brazilian');
const { saveNewSuggestionEtiquetaMongo, findAllColorEtiquetasMongo, deleteTagMongo } = require('../../../database/mongoDB');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const sefaManifestacaoStatusResumidaOriginal = {
    "Confirmação de Operação pelo Destinatário": 210200,
    "Ciência da Operação pelo Destinatário": 210210,
    "Desconhecimento da Operação pelo Destinatário": 210220,
    "Operação não Realizada": 210240
}
const sefaManifestacaoStatusOriginalInverse = {
    "Confirmação de Operação pelo Destinatário": 210200,
    "Ciência da Operação pelo Destinatário": 210210,
    "Desconhecimento da Operação pelo Destinatário": 210220,
    "Operação não Realizada": 210240
}

const sefaManifestacaoStatusResumo = {
    "210200": "Confirmada", "1": 210200,                //1
    "210210": "Ciente", "2": 210210,                    //2
    "210220": "Desconhecida", "3": 210220,              //3
    "210240": "Operação não Realizada", "4": 210240     //4

}

async function dateRowsAdjustments(rows) {
    return await rows.map(function (row) {
        //.startOf('day').add(1, 'day').startOf('day').subtract(1, 'millisecond')
        if (row.data_emissao) {
            row.data_emissao = moment(formatDate(row.data_emissao), "YYYY-MM-DD").format("DD/MM/YYYY");
        }
        if (row.data_entrada) {
            row.data_entrada = moment(formatDate(row.data_entrada), "YYYY-MM-DD").format("DD/MM/YYYY");
        }
        // MEMO  =>> .add(1, 'days') adicionar um dia

        //Victor Anotacoes //sort ASC Anotacoes data array
        row.anotacoes ? row.anotacoes = row.anotacoes.split(',').sort((a, b) => a.length - b.length) : row.anotacoes = '';

        //row.status_manifestacao = 114;
        if (row.status_manifestacao) {
            row.status_manifestacao_resumo = sefaManifestacaoStatusResumo[row.status_manifestacao];
        } else {
            row.status_manifestacao = '210210'; //Ciente
            row.status_manifestacao_resumo = sefaManifestacaoStatusResumo[row.status_manifestacao];
        }

        return row;
    });
}

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

module.exports={

    async buscarNotas(req, res) {
        var { administrador, root, suporte, nome_fantasia, id_escritorio, cliente } = req.session.userData;
        var { datainicial, datafinal, nomeBuscadoNotas, radioNotas } = req.body;
        var { nf_status, nf_manifestacao, nf_origem, nf_valor_inicial, nf_valor_final, nf_mes_referencia, nf_etiquetas, nf_anotacoes } = req.body;

        if(!nomeBuscadoNotas || nomeBuscadoNotas != cliente)  {
            return res.send([]);
        }

        const regexMoneyAdjust = async (value) => parseFloat(value.replace(/\s/g, '').replace(/\$/g, '').replace(/R/g, '').replace(/\./g, '').replace(/,/g, '.'))
        nf_valor_inicial = await regexMoneyAdjust(nf_valor_inicial);
        nf_valor_final = await regexMoneyAdjust(nf_valor_final);
        var datasend;
            try {
                async function buscaTabelaNotas(rOption, datainicial, datafinal) {
                    //, "status_manifestacao"
                    var query = knexPostgre("notas_view").withSchema('dbo')
                        .distinct("id_chavedeacesso", "id_empresa", "chavedeacesso", "id_nota", "numero_nota", "emitente", "cnpj_emitente", "destinatario", "cnpj_destinatario", "valor_nf", "data_emissao", "data_entrada", "status", "tag", "anotacoes", "chavedeacesso", "inscricao_estadual_emitente", "origem", "modelo_doc", "serie_nota", "uf_origem", "uf_destino", "protocolada", "erp", "operacao_pendente", "status_manifestacao")
                        .where("id_escritorio", id_escritorio)

                    if (nf_status) {
                        query.andWhere("status", nf_status)
                    }
                    if (nf_etiquetas) {
                        query.andWhere("tag", nf_etiquetas)
                    }
                    if (nf_anotacoes) {
                        query.andWhere("anotacoes", nf_anotacoes)
                    }
                    if (nf_manifestacao) {
                        query.andWhere("manifestacao", nf_status)
                    }
                    if (nf_origem) {
                        query.andWhere("origem", nf_origem)
                    }
                    if (nf_valor_inicial) {
                        query.andWhere(knexPostgre.raw('CAST(valor_nf as float)'), ">=", nf_valor_inicial)
                    }
                    if (nf_valor_final > nf_valor_inicial) {
                        query.andWhere(knexPostgre.raw('CAST(valor_nf as float)'), "<=", nf_valor_final)
                    }
                    if (nf_mes_referencia) {
                        let mesRef = moment(nf_mes_referencia, 'mm/yyyy').format('mm')
                        let anoRef = moment(nf_mes_referencia, 'mm/yyyy').format('yyyy')
                        query.andWhere('ano_data_entrada', anoRef)
                        query.andWhere('mes_data_entrada', mesRef)
                    }
                    if (datainicial && datafinal) {
                        var datade_formatado = await moment(datainicial, "DD/MM/YYYY").format("YYYY-MM-DD");
                        var dataate_formatado = await moment(datafinal, "DD/MM/YYYY").format("YYYY-MM-DD");
                        query.andWhere(function () {
                            this.where(
                                "data_entrada",
                                ">=",
                                datade_formatado + "T00:00:00.000Z"
                            ).andWhere("data_entrada", "<=", dataate_formatado);
                        })
                    }else{
                        query.limit(2000)
                    }
                    if (rOption == "entrada") {

                    //Retirando produtos do estoque, consumo próprio
                    query.andWhere("cnpj_emitente", "<>", knexPostgre.ref("cnpj_destinatario"))
                    //or   <>  alias  !=
                    //query.andWhere("cnpj_emitente", "!=>", knexPostgre.ref("cnpj_destinatario"))


                        query.andWhere('modelo_doc', '55') //GABZ edit
                        query.andWhere(function () {
                            this.where("destinatario", nomeBuscadoNotas).orWhere("cnpj_destinatario", nomeBuscadoNotas).orWhere("numero_nota", nomeBuscadoNotas)
                        }).then((rows) => {
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
                        query.andWhere(function () { this.where("emitente", nomeBuscadoNotas).orWhere("cnpj_emitente", nomeBuscadoNotas).orWhere("numero_nota", nomeBuscadoNotas) })
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
                    } else if (rOption == "servico") {
                        //console.log("rOption servico ", rOption)
                        query.andWhere(function () { this.where("emitente", nomeBuscadoNotas).orWhere("cnpj_destinatario", nomeBuscadoNotas) })
                            .then(async (rows) => {
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
                    }
                };
                buscaTabelaNotas(radioNotas, datainicial, datafinal);

            } catch (error) {
                console.log(error)
            }



    },
}
