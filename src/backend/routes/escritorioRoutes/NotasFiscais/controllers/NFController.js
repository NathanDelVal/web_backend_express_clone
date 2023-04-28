const moment = require('moment');
const xml2js = require('xml2js');
const { knexPostgre } = require("../../../../database/knex");
const DanfeWebView_Nfe = require('../../../../APIs/DANFE/webview_nfe');
const DanfeWebView_Nfce = require('../../../../APIs/DANFE/webview_nfce');
const { makePDF } = require('../../../../APIs/DANFE/createpdf');
const Suggestions = require("../../../helpers/suggestions");
const { redisClient, redisCache } = require('../../../../database/redis');
const { formatacoes } = require('../../../../APIs/DANFE/core/brasil/brazilian/brazilian');
const { saveNewSuggestionEtiquetaMongo, findAllColorEtiquetasMongo, deleteTagMongo } = require('../../../../database/mongoDB');
const { manifestarNota } = require("../../../helpers/pythonRunScript");

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
    210200: "Confirmada", 1: 210200,                //1
    210210: "Ciente", 2: 210210,                    //2
    210220: "Desconhecida", 3: 210220,              //3
    210240: "Operação não Realizada", 4: 210240     //4

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

module.exports = {

    async renderPage(req, res) {
        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData;
        try {
            return res.render("./_escritorio/NotasFiscais/notasfiscais", {
                usuario,
                nome_fantasia,
                administrador,
                root,
                suporte,
            });
        } catch (error) {
            return res.status(500).send({status: false, error: true, msg: error.message});
        }
    },


    async renderPageOperacoes(req, res) {
        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData
        try {
            res.render("./_escritorio/NotasFiscais/operacoesNotasFiscais", {
                usuario,
                nome_fantasia,
                administrador,
                root,
                suporte,
            });
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },


    async getNfeByChaveAcesso(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        var valores_cfops = {}

        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso);
        try {

            /*
            if(chave_de_acesso?.length){
                var tipoNota = chave.substr(20, 2);
            }
             */


            //busca banco de dados
            var queryResult = await knexPostgre.select("arquivo_xml")
                .from("xml_recebidos_processados_view")
                .withSchema('dbo')
                .where("chavedeacesso", chave_de_acesso)
                .andWhere('id_escritorio', id_escritorio).limit(1)
                .then(async (result) => {

                    if (result[0]) {
                        return result[0]
                    }
                    //Não encontrou na primeira , busca na segunda tabela
                    return await knexPostgre.select("arquivo_xml")
                        .withSchema('dbo')
                        .from("xml_recebidos_nfce_processados_view")
                        .where("chavedeacesso", chave_de_acesso)
                        .andWhere('id_escritorio', id_escritorio)
                        .limit(1)
                        .then((result) => {
                            //console.log("queryResult result", result)

                            if (result) {
                                return result[0]
                            }
                            return false
                        }).catch((error) => {
                            return false
                            console.log("APP --> ", error)
                        })
                })

            if (queryResult) {

                //aliquotas_interestaduais conseguir o tipo antecipado de arcordo com o estado p cada produto | ou nota?

                const queryExtraDataProdutos = await knexPostgre.select("id_item", "cnpj_emitente", "cnpj_destinatario", "tipo_antecipado", "cfop", "red_bc_icms_sai_pa", "mva_4", "mva_7", "mva_12", "descricao_item", "uf_origem", "uf_destino", "aliquota", "calculo_base", "valor_bruto", "calculo_valor_antecipado", "diferencial_de_aliquota", "modelo_doc")
                    .from("produtos_tbl_view").withSchema('dbo')
                    .where("chavedeacesso", chave_de_acesso)
                    .andWhere('id_escritorio', id_escritorio)
                    .catch((error) => {
                        console.log("APP --> ", error)
                    })

                //console.log("queryExtraDataProdutos ", queryExtraDataProdutos);
                //corrigir APP ===> TypeError: Cannot read property 'length' of undefined
                if (queryExtraDataProdutos) {
                    if (queryExtraDataProdutos.length > 0) {
                        //console.log("--- ", queryExtraDataProdutos)

                        queryResult.extra = queryExtraDataProdutos

                        //Relação CFOP x CFOP Entrada-----------------
                        var queryExtraDataRelacaoCfopEntrada

                        var cnpj_Nota = ''
                        if (queryExtraDataProdutos[0].modelo_doc == '55') {
                            cnpj_Nota = queryExtraDataProdutos[0].cnpj_destinatario
                            //console.log("modelo doc 55")
                            queryExtraDataRelacaoCfopEntrada = await knexPostgre.select("cfop", "cfop_entrada").from("cfops_relacionamento_tbl").withSchema('dbo').where("cnpj", cnpj_Nota).then((rows) => {
                                if (rows?.length == 0) {
                                    return false;
                                }
                                return rows;
                            }).catch((error) => { console.log("APP --> ", error) });

                            //Contorno auxiliado por Gabriel buscar relacao cfop com o cnpj do emitente quando não encontrar com o CNPJ do destinatário
                            if (!queryExtraDataRelacaoCfopEntrada) {
                                cnpj_Nota = queryExtraDataProdutos[0].cnpj_emitente;
                                queryExtraDataRelacaoCfopEntrada = await knexPostgre.select("cfop", "cfop_entrada").from("cfops_relacionamento_tbl").withSchema('dbo').where("cnpj", cnpj_Nota).then((rows) => {
                                    if (rows?.length == 0) {
                                        return false;
                                    }
                                    return rows;
                                }).catch((error) => { console.log("APP --> ", error) });
                            }

                            //console.log("queryExtraDataRelacaoCfopEntrada ", queryExtraDataRelacaoCfopEntrada)
                            if (queryExtraDataRelacaoCfopEntrada) {
                                queryExtraDataRelacaoCfopEntrada.forEach(function (el, idx) {
                                    //console.log('dados', el)
                                    valores_cfops[el.cfop] = el.cfop_entrada
                                })
                                queryResult.relacao_cfop = valores_cfops
                                //console.log("queryResult ", queryResult)
                            }
                        }

                        if (queryExtraDataProdutos[0].modelo_doc == '65') {
                            cnpj_Nota = queryExtraDataProdutos[0].cnpj_emitente
                            //console.log("modelo doc 65")
                            //console.log(" cnpjEmitente ", cnpjEmitente)
                            queryExtraDataRelacaoCfopEntrada = await knexPostgre.select("cfop", "cfop_entrada").from("cfops_relacionamento_tbl").withSchema('dbo').where("cnpj", cnpj_Nota).catch((error) => { console.log("APP --> ", error) })
                            //console.log("queryExtraDataRelacaoCfopEntrada ", queryExtraDataRelacaoCfopEntrada)
                            //console.log("size = ",queryExtraDataRelacaoCfopEntrada.length)
                            if (queryExtraDataRelacaoCfopEntrada) {
                                queryExtraDataRelacaoCfopEntrada.forEach(function (el, idx) {
                                    //console.log('dados', el)
                                    valores_cfops[el.cfop] = el.cfop_entrada
                                })
                                queryResult.relacao_cfop = valores_cfops
                                //console.log("queryResult ", queryResult)
                            }
                        }


                        //console.log(' inicio forEach ')



                        const startForEach = async (array) => {
                            await asyncForEach(array, async (item, indice) => {

                                var cfop_entrada = null;
                                if(queryResult.relacao_cfop){
                                    if(item.cfop){
                                    cfop_entrada = queryResult.relacao_cfop[item.cfop]
                                    }
                                }
                                if (!cfop_entrada || cfop_entrada == undefined || cfop_entrada == 'undefined') {
                                    cfop_entrada = ''
                                }
                                //_______SET____CFOP PADRÃO__________________________
                                if (cfop_entrada.length == 0) {
                                    let cfop_padrao = item.cfop
                                    let firstDigit = cfop_padrao.slice(0, 1)
                                    if (firstDigit == '6') {
                                        cfop_padrao = cfop_padrao.replace(/6/, "2");
                                    }
                                    if (firstDigit == '5') {
                                        cfop_padrao = cfop_padrao.replace(/5/, "1");
                                    }
                                    cfop_entrada = cfop_padrao
                                }
                                //___________________________________________________

                                //ADD cfop_entrada to item
                                cfop_entrada ? item.cfop_entrada = cfop_entrada : item.cfop_entrada = ''


                                var tipoantecipado = item.tipo_antecipado
                                var mva = null;
                                /*
                                else if(item.aliquota == 17){
                                    mva = null
                                }
                                */
                                /* MVA  */
                                if (item.aliquota == 12) {
                                    mva = item.mva_12
                                } else if (item.aliquota == 7) {
                                    mva = item.mva_7
                                }

                                /*BUSCA ACUMULADOR PARA CADA PRODUTO DA DANFE*/
                                var DataAcumulador = ""
                                if (cfop_entrada.length > 0) {
                                    DataAcumulador = await knexPostgre.select("acumulador")
                                        .from("cfop_acumulador_tbl").withSchema('dbo')
                                        .where("cnpj", cnpj_Nota)
                                        .andWhere('tipo_antecipado', tipoantecipado)
                                        .andWhere('cfop_entrada', cfop_entrada)
                                        .andWhere('mva', mva)
                                        .then(async (rows) => {
                                            //console.log("query 1 ", rows)
                                            if (rows) {
                                                if (rows.length == 0) {
                                                    return await knexPostgre.select("acumulador")
                                                        .from("cfop_acumulador_tbl").withSchema('dbo')
                                                        .where("cnpj", cnpj_Nota)
                                                        .andWhere('tipo_antecipado', tipoantecipado)
                                                        .andWhere('cfop_entrada', cfop_entrada).then(async (rows) => {
                                                            //console.log("query 2 ", rows)
                                                            if (rows.length == 0) {
                                                                return await knexPostgre.select("acumulador")
                                                                    .from("cfop_acumulador_tbl").withSchema('dbo')
                                                                    .where("cnpj", cnpj_Nota)
                                                                    .andWhere('cfop_entrada', cfop_entrada).then(async (rows) => {
                                                                        //console.log("query 3 ", rows)
                                                                        return rows
                                                                    }).catch((error) => { console.log("APP --> ", error) })
                                                            } else {
                                                                return rows
                                                            }
                                                        }).catch((error) => { console.log("APP --> ", error) })

                                                } else {
                                                    return rows;
                                                }
                                            } else {
                                                return rows;
                                            }
                                        }).catch((error) => { console.log("APP --> ", error) })

                                    if (DataAcumulador.length > 0) {
                                        //console.log("===== ", DataAcumulador)
                                        DataAcumulador[0].acumulador ? item.acumulador = DataAcumulador[0].acumulador : item.acumulador = ''
                                        //console.log('!!! item.acumulador',  DataAcumulador[0].acumulador)
                                    } else {
                                        item.acumulador = ''
                                    }

                                } else {
                                    item.acumulador = ''
                                }


                            });
                            //console.log('Done');
                            //console.log('queryResult.arquivo_xml ', queryResult.arquivo_xml);
                            //console.log('queryResult.extra ', queryResult.extra);
                            var danfe = DanfeWebView_Nfe.fromXML(queryResult.arquivo_xml, queryResult.extra)
                            if (danfe) {
                                var cnpjDestinatario=null;
                                if(queryExtraDataProdutos[0].cnpj_destinatario) cnpjDestinatario=queryExtraDataProdutos[0].cnpj_destinatario.toString();
                                var cnpjEmitente=null;
                                if(queryExtraDataProdutos[0].cnpj_destinatario) cnpjEmitente=queryExtraDataProdutos[0].cnpj_emitente.toString();

                                return res.send({ 'data': danfe.toHtml(), 'cnpj_emitente': cnpjEmitente, 'cnpj_destinatario': cnpjDestinatario });
                            } else {
                                return res.send("Nenhuma nota encontrada")
                            }
                        }
                        startForEach(queryResult.extra);
                        /* // promise all - vitão dia 12/07/2021

                        */

                        //console.log('dados do acumulador: ', queryResult.extra)

                        //-------------------------------------------
                    } else {
                        return res.send("Nenhuma nota encontrada")
                    }
                } else {
                    return res.send("Nenhuma nota encontrada")
                }
            } else {
                return res.send("Nenhuma nota encontrada")
            }
            //return res.send("recebemos esse chave == ", chave_de_acesso)

        } catch (error) {
            return res.status(500);
            console.log("APP ===>", error);
        }

    },














    //NFCE


    async getNfceByChaveAcesso(req, res) {
        var { id_escritorio } = req.session.userData;
        var { chave_de_acesso } = req.body;
        var valores_cfops = {};
        //console.log("cheguei getNfceByChaveAcesso", req.body)
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            var queryResult = await knexPostgre.select("arquivo_xml").withSchema('dbo').from("xml_recebidos_nfce_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                .then(async (result) => {
                    //console.log("queryResult result", result)
                    if (result[0]) {
                        return result[0]
                    }
                    //Não encontrou na primeira , busca na segunda tabela
                    return await knexPostgre.select("arquivo_xml").from("xml_recebidos_processados_view").withSchema('dbo').where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                        .then((result) => {
                            if (result) {
                                return result[0]
                            }
                            return false
                        }).catch((error) => {
                            return false
                        });


                }).catch((error) => {
                    console.log("APP --> ", error)
                })

            if (queryResult) {
                //OBTENDO FORMA DE PAGENTO DA NOTA USANDO O XML
                var parser = new xml2js.Parser();
                var arquivo_xml = queryResult.arquivo_xml
                var forma_pagamento = null
                if (arquivo_xml) {
                    parser.parseString(arquivo_xml, function (error, result) {
                        if (result?.nfeProc) {
                            if (result.nfeProc.NFe[0].infNFe[0].pag[0].detPag[0].tPag[0]) {
                                forma_pagamento = result.nfeProc.NFe[0].infNFe[0].pag[0].detPag[0].tPag[0];
                            }
                        }
                        if (!result?.nfeProc) {
                            if (result.NFe.infNFe[0].pag[0].detPag[0].tPag[0]) {
                                forma_pagamento = result.NFe.infNFe[0].pag[0].detPag[0].tPag[0];
                            }
                        }
                    });
                }
                //--------------------------------------------

                //aliquotas_interestaduais conseguir o tipo antecipado de arcordo com o estado p cada produto | ou nota?

                const queryExtraDataProdutos = await knexPostgre.select("id_item", "cnpj_emitente", "cnpj_destinatario", "tipo_antecipado", "cfop", "red_bc_icms_sai_pa", "mva_4", "mva_7", "mva_12", "descricao_item", "uf_origem", "uf_destino", "aliquota", "calculo_base", "valor_bruto", "calculo_valor_antecipado", "diferencial_de_aliquota", "modelo_doc")
                    .from("produtos_tbl_view").withSchema('dbo')
                    .where("chavedeacesso", chave_de_acesso)
                    .andWhere('id_escritorio', id_escritorio)
                    .catch((error) => { console.log("APP --> ", error) })

                //console.log("queryExtraDataProdutos ",queryExtraDataProdutos)
                if (queryExtraDataProdutos.length > 0) {
                    //console.log(' inicio forEach ')
                    var cnpj_Nota = queryExtraDataProdutos[0].cnpj_emitente

                    const startForEach = async (array) => {
                        await asyncForEach(array, async (item, indice) => {
                            var tipoantecipado = item.tipo_antecipado
                            var mva = null;

                            /* ATRIBUIÇÃO DO MVA ~ DENTRO DO ESTADO  */
                            if (item.aliquota == 12) {
                                mva = item.mva_12
                            } else if (item.aliquota == 7) {
                                mva = item.mva_7
                            } else if (item.aliquota == 17) {
                                mva = null
                            }

                            //console.log( "dados da query ", cnpj_Nota, mva, forma_pagamento)
                            /*BUSCA ACUMULADOR PARA CADA PRODUTO DA DANFE*/
                            var DataAcumulador = await knexPostgre.select("acumulador")
                                .from("cfop_acumulador_tbl").withSchema('dbo')
                                .where("cnpj", cnpj_Nota)
                                .andWhere('indicador_pag', forma_pagamento)
                                .andWhere('mva', mva)
                                .catch((error) => { console.log("APP --> NFController, linha 348", error) })
                            //console.log('quem é o data acumulador', DataAcumulador[0].acumulador)
                            if (DataAcumulador.length > 0) {
                                //console.log("===== ", DataAcumulador)
                                DataAcumulador[0].acumulador ? item.acumulador = DataAcumulador[0].acumulador : item.acumulador = ''
                                //console.log('!!! item.acumulador',  DataAcumulador[0].acumulador)
                            } else {
                                item.acumulador = ''
                            }
                            /*---------------------------*/
                        });
                        //console.log('Done');
                        //console.log('-> queryExtraDataProdutos[0].cnpj_emitente.toString() ==', queryExtraDataProdutos[0].cnpj_emitente.toString());
                        var danfe = DanfeWebView_Nfce.fromXML(queryResult.arquivo_xml, queryExtraDataProdutos)



                        if (danfe) {
                            res.send({ 'data': danfe.toHtml(), 'cnpj_emitente': queryExtraDataProdutos[0].cnpj_emitente.toString() })
                        } else {
                            res.send("Nenhuma nota encontrada")
                        }
                    }

                    startForEach(queryExtraDataProdutos);

                    //console.log('dados do acumulador: ', queryExtraDataProdutos)

                    //-------------------------------------------

                } else {
                    res.send("Nenhuma nota encontrada")
                }

            } else {
                res.send("Nenhuma nota encontrada")
            }
            //res.send("recebemos esse chave == ", chave_de_acesso)

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

            const queryResult = await knexPostgre.select("arquivo_xml").from("xml_recebidos_processados_view").withSchema('dbo').where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1).then((result) => { return result[0] })
            if (queryResult) {
                //var xml = queryResult.arquivo_xml  // fs.readFileSync('./    21210110353688000228550030001228771853945269.xml').toString();
                makePDF(queryResult.arquivo_xml, '', function (error, pdf) {
                    if (error) {
                        res.send({status: false, data: []});
                    } else {
                        /*
                        //SALVA PDF NO SERVIDOR
                        fs.writeFileSync(`${global.__basedir}/storage/PDFs/danfe.pdf`, pdf, {
                            encoding: 'binary'
                        });

                        */
                        res.send({status: true, data: pdf});
                    }
                })
            } else {
                return res.send({msg: "Arquivo não encontrado", status: false, data: []});

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
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso);
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.from('xml_recebidos_processados_view').withSchema('dbo')
                                                 .select('arquivo_xml')
                                                 .where('chavedeacesso', chave_de_acesso)
                                                 .andWhere('id_escritorio', id_escritorio).limit(1)
                                                 .then((result) => {
                                                     return result[0];
                                    })
            if (queryResult) {
                //res.writeHead(200, { 'Content-Type': 'application/xml' });
                //res.end(queryResult.arquivo_xml, 'binary');
                res.send({status: true, data: queryResult.arquivo_xml});
            } else {
                return res.send({msg: "Arquivo não encontrado", status: false, data: []});
            }
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },


    async downloadXMLZip(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body
        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml").from("xml_recebidos_processados_view").withSchema('dbo').where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                .then((result) => { return result[0] })
            if (queryResult) {
                res.end(queryResult.arquivo_xml, 'binary');
            } else {
                res.send("Arquivo não encontrado");
            }
        } catch (error) {
            res.status(500);
        }
    },




    async requestDados(req, res) {

        var { administrador, root, suporte, nome_fantasia, id_escritorio } = req.session.userData;
        var { datainicial, datafinal, nomeBuscadoNotas, radioNotas } = req.body;
        var { nf_status, nf_manifestacao, nf_origem, nf_valor_inicial, nf_valor_final, nf_mes_referencia, nf_etiquetas, nf_anotacoes } = req.body;

        const regexMoneyAdjust = async (value) => parseFloat(value.replace(/\s/g, '').replace(/\$/g, '').replace(/R/g, '').replace(/\./g, '').replace(/,/g, '.'))
        nf_valor_inicial = await regexMoneyAdjust(nf_valor_inicial);
        nf_valor_final = await regexMoneyAdjust(nf_valor_final);

        var datasend;

            try {
                //base xing
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

    async saveNewSuggestionsEtiquetas(req, res) {
        var { id_escritorio } = req.session.userData
        var { nome_etiqueta, cor_etiqueta } = req.body
        try {
            saveNewSuggestionEtiquetaMongo(id_escritorio, nome_etiqueta, cor_etiqueta).then(async (result) => {
                if (result) {

                    /*
                    result  {
                        _id: 60a3aa59a698d25358416cb2,
                        id_id_escritorio: '1',
                        nome_etiqueta: 'Write',
                        cor: '#eceadf',
                        created_at: 'Tue May 18 2021 08:51:53 GMT-0300 (Horário Padrão de Brasília)',
                        __v: 0
                    }
                    */
                    var response = {}
                    response.etiqueta = result.nome_etiqueta
                    response.cor = result.cor
                    response.msg = "Nova etiqueta inserida com sucesso"
                    //console.log("result ", result)
                    res.send(response)
                } else {
                    res.send("Erro ao inserir etiqueta")
                }
            })
        } catch (error) {
            res.status(500);
        }

    },

    async getSuggestionsEtiquetas(req, res) {
        var { id_escritorio } = req.session.userData
        if (id_escritorio) {
            try {
                //const Data = await findSuggestionsEtiquetasMongo(id_escritorio)//.then(async (result) => { return result })
                const EtiquetaJSON = await findAllColorEtiquetasMongo(id_escritorio)//.then(async (result) => { return result })
                //console.log("Data && EtiquetaJSON", Data, EtiquetaJSON)
                if (EtiquetaJSON) {
                    res.send(EtiquetaJSON)
                } else {
                    res.send("Nenhuma etiqueta encontrada.")
                }
            } catch (error) {
                res.status(500);
            }
        }
    },


    async atualizarEtiqueta(req, res) {
        var { id_escritorio } = req.session.userData
        var { tag, chave_de_acesso, id_chavedeacesso } = req.body

        if (tag && chave_de_acesso && id_chavedeacesso) {

            if (tag == "Selecionar") {
                tag = null
            }
            //ATUALIZA nf_devolvida
            if (tag == "DEVOLVIDA") {
                try {
                    let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                    var queryDevolvida = knexPostgre("notas_tbl").withSchema('dbo')
                    //console.log("chave_de_acesso: ", chave_de_acesso)
                    if (Array.isArray(id_chavedeacesso)) {
                        queryDevolvida.whereIn("id_chavedeacesso", id_chavedeacesso)
                    }
                    if (!Array.isArray(id_chavedeacesso)) {
                        queryDevolvida.where("id_chavedeacesso", id_chavedeacesso)
                    }
                    queryDevolvida.andWhere("id_escritorio", id_escritorio)
                    queryDevolvida.update('nf_devolvida', 1)
                        .then((rows) => {
                            var rowsAffected = rows;
                            if (rowsAffected == 1) {
                                console.log("Status Nota Fiscal Devolvida atualizado com sucesso!");
                            } else if (rowsAffected > 1) {
                                console.log("Status Notas Fiscais Devolvidas atualizados com sucesso!");
                            } else {
                                console.log("Erro ao gravar dados, tente novamente..");
                            }
                        })
                } catch (error) {
                    console.log("APP --> Erro ao setar nota como devolvida", error)
                }
            }

            //ATUALIZA tag
            try {
                updateJob = async () => {
                    var queryResult = null;
                    if (Array.isArray(id_chavedeacesso)) {
                        queryResult = await knexPostgre.from("notas_tbl").withSchema('dbo').update({ 'tag': tag })
                            .whereIn("id_chavedeacesso", id_chavedeacesso).then((result) => {
                                console.log(result)
                                return result
                            })

                    }

                    if (!Array.isArray(id_chavedeacesso)) {
                        queryResult = await knexPostgre.from("notas_tbl").withSchema('dbo').update({ 'tag': tag })
                            .where("id_chavedeacesso", id_chavedeacesso).then((result) => {
                                //console.log(result)
                                return result
                            })
                    }
                    return queryResult;
                }
                const response = await updateJob();
                if (response > 0) {
                    res.send("A etiqueta foi atualizada com sucesso!")
                } else {
                    res.send("Ocorreu um erro ao atualizar a etiqueta!")
                }
            } catch (error) {
                res.status(500);
            }

        }

    },


    async atualizarAnotacoes(req, res) {
        var { id_escritorio } = req.session.userData
        var { anotacoes, chavedeacesso, id_chavedeacesso } = req.body
        if (!anotacoes) { anotacoes = null }
        if (id_chavedeacesso) {
            try {
                //var getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
                await knexPostgre.from("notas_tbl").withSchema('dbo').update('anotacoes', anotacoes)
                    .where("id_chavedeacesso", id_chavedeacesso).then((rows) => {
                        if (rows > 0) {
                            res.send(true)
                        } else {
                            res.send(false)
                        }
                    }).catch((error) => {
                        console.log(error)
                    })

            } catch (error) {
                res.status(500);
            }

        } else {
            res.status(400)
        }

    },

    async removerEtiqueta(req, res) {
        var { id_escritorio } = req.session.userData
        var { etiqueta } = req.body

        if (id_escritorio && etiqueta) {
            try {

                const result = await deleteTagMongo(id_escritorio, etiqueta)//.then(async (result) => { return result })

                if (result) {
                    const queryResult = await knexPostgre.from("notas_tbl").withSchema('dbo').update({ tag: null }).where({ tag: etiqueta })
                    res.send("Etiqueta deletada com sucesso!")
                } else {
                    res.send("Erro ao excluir etiqueta!")
                }

            } catch (error) {
                res.status(500);
            }
        }
    },


    /* ------------------------------------------  ALIQUOTA ----------------------------------------------- */
    async updateDifAliquota(req, res) {

        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData
        var { chave_de_acesso, descricao, status_switch_aliquota } = req.body

        //console.log('red',  req.body)

        if (chave_de_acesso && descricao && status_switch_aliquota) {
            try {
                var rowsAffected = "";
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                // use stored procedure on-> update_diferencial_aliquota
                const updateDIF = await knexPostgre.transaction(trx => {
                    return knexPostgre.raw(
                        'Call dbo.update_diferencial_aliquota(?, ?, ?, ?, ?, ?)',
                        [
                            id_escritorio,
                            chave_de_acesso,
                            descricao,
                            usuario,
                            status_switch_aliquota,
                            'outmsg'
                        ]).then(res => res)
                }).then(res => res.rows[0]);

                if (updateDIF['outmsg']) {
                    return res.send("Diferêncial de Alíquota atualizado!");
                }

                return res.send("Erro ao gravar dados, tente novamente.").status(500);

            } catch (error) {
                console.log(error);
                res.send().status(500);
            }
        }
    },

    async updateDataEntrada(req, res) {
        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData

        var { id_chavedeacesso_alterar_data, chavedeacesso_alterar_data, nova_dataentrada } = req.body
        console.log("data de entrada upodate ", req.body)

        var resposta = {}

        var Data_Formato_Banco = ""; //yyyy/mm/dd

        if (nova_dataentrada != undefined && nova_dataentrada != "") {
            Data_Formato_Banco = moment(nova_dataentrada, "DD/MM/YYYY").format("YYYY-MM-DD");

            try {
                var arrayChavedeAcesso = new Array();
                arrayChavedeAcesso = chavedeacesso_alterar_data.split(",");

                var arrayIdChavedeAcesso = new Array();
                arrayIdChavedeAcesso = id_chavedeacesso_alterar_data.split(",");

                var rowsAffected = "";
                let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')

                knexPostgre("notas_tbl").withSchema('dbo')
                    //.whereIn("chavedeacesso", arrayChavedeAcesso)
                    .whereIn("id_chavedeacesso", arrayIdChavedeAcesso)
                    .andWhere("id_escritorio", id_escritorio)
                    .update({
                        'data_entrada': Data_Formato_Banco,         //--> data_competencia mudou para data_entrada Gabriel, Pedro, Fernando 27-10-2021
                        //'data_competencia': [Data_Formato_Banco]  //--> data_entrada mudou para data_competencia Gabriel 16-07-2021   append --> data_competencia será deletada 27-10-2021
                    })
                    .then((rows) => {
                        console.log("foi ? ", rows)
                        rowsAffected = rows;
                        //console.log("rowsAffected ---> ", rows)
                        rowsData = rows;

                        if (rowsAffected > 0) {
                            resposta.msg = "Data de Entrada atualizada!"
                            res.send(resposta);
                        } else {
                            resposta.msg = "Erro ao gravar dados, tente novamente."
                            res.send(resposta);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500);
                    });
            } catch (error) {
                console.log("erro ", error)
                res.status(500);
                res.render("/notas");
            }
        } else {
            resposta.msg = "Erro ao gravar dados, tente novamente."
            res.send(resposta);

        }
    },


    async requestSuggestions(req, res) {
        var { administrador, root, suporte, nome_fantasia, id_escritorio } = req.session.userData;
        try {
            Suggestions.suggestions(nome_fantasia).then(function (suggestions) {
                //console.log("rota - suggestions ", suggestions)
                res.send(suggestions)
            })
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },

    async requestSuggestionsAnotacoes(req, res) {
        var { administrador, root, suporte, nome_fantasia, id_escritorio } = req.session.userData;
        try {
            Suggestions.suggestionsAnotacoes(nome_fantasia, id_escritorio).then(async function (suggestions) {

                //REDIS (Gravar no Redis se estiver expirado)
                var target = `Suggestions:anotacoes:${nome_fantasia}`
                var expirationTIME = await redisClient.ttl(target);
                if (suggestions && expirationTIME < 0) { redisClient.set(target, JSON.stringify(suggestions), 'EX', 120); };

                //RESPONSE
                res.send(suggestions)
            })
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },

    async updateCFOPEntrada(req, res) {
        var { id_escritorio } = req.session.userData
        var { cnpj, cfop_input, cfop_entrada } = req.body

        //console.log('red',  req.body)
        try {
            if (cnpj && cfop_input && cfop_entrada) {
                const existe = await knexPostgre("cfops_relacionamento_tbl").withSchema('dbo')
                    .where("cnpj", cnpj)
                    .andWhere("cfop", cfop_input)
                    .then(async (rows) => {
                        if (rows.length > 0) {
                            //console.log("existe: ", rows);
                            return rows
                        }
                    })

                if (!existe) {
                    await knexPostgre("cfops_relacionamento_tbl").withSchema('dbo')
                        .insert({
                            cnpj: cnpj,
                            cfop: cfop_input,
                            cfop_entrada: cfop_entrada,
                        })
                        .returning("id")
                        .then(async function (id) {
                            /* inseriu com sucesso */
                            //console.log("inseriu id: ", id);
                            if (id.length > 0) {
                                res.send('Dados atualizados!');
                            } else {
                                res.send("Erro ao gravar dados, tente novamente.");
                            }
                        });
                } else {
                    //console.log('já existe')
                    await knexPostgre("cfops_relacionamento_tbl").withSchema('dbo')
                        .update("cfop_entrada", cfop_entrada)
                        .where("cnpj", cnpj)
                        .andWhere("cfop", cfop_input)
                        .then(async function (rows) {
                            /* update com sucesso */
                            //console.log('update: ', rows);
                            if (rows > 0) {
                                res.send('Dados atualizados!');
                            } else {
                                res.send("Erro ao gravar dados, tente novamente.");
                            }
                        });
                }

            } else {
                res.send("Erro ao gravar dados, tente novamente.");
            }
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }

    },


    async updateAcumuladorDanfeNfe(req, res) {
        var { id_escritorio } = req.session.userData
        var { acumulador_input, cfop, cnpj, tipo_antecipado, mva } = req.body
        //console.log('red',  req.body)
        try {
            if (!mva) {
                //console.log("MVA NULOOOOO !!!! ", mva)
                mva = null
                //console.log("AGORA O MVA É NUll --> ", mva)
            }
            var id_empresa = await knexPostgre("empresas_tbl").withSchema('dbo').select('id_empresa').where('cnpj', cnpj).then(async (rows) => {
                if (rows) {
                    return rows[0].id_empresa;
                }
                return false;
            })

            if (id_empresa) {

                var query = knexPostgre("cfop_acumulador_tbl").withSchema('dbo').select('id_cfop_ac')
                    //.where("cnpj", cnpj)
                    .where("id_empresa", id_empresa)
                    .andWhere("cfop_entrada", cfop)
                    .andWhere("tipo_antecipado", tipo_antecipado)
                    .andWhere("mva", mva)

                var existe = await query.then(async (rows) => {
                    if (rows.length > 0) {
                        return true
                    } else {
                        return false
                    }
                })

                if (!existe) {
                    console.log(" não existe, inserção será feita")
                    await knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                        .insert({
                            'cnpj': cnpj,
                            'cfop_entrada': cfop,
                            'tipo_antecipado': tipo_antecipado,
                            'mva': mva,
                            'acumulador': acumulador_input,
                        })
                        .returning("id_cfop_ac")
                        .then(async function (id_cfop_ac) {
                            /* inseriu com sucesso */
                            //console.log("inseriu id: ", id);
                            if (id_cfop_ac.length > 0) {
                                res.send("Dados atualizados!");
                            } else {
                                res.send("Erro ao gravar dados, tente novamente.");
                            }
                        }).catch((error) => {
                            console.log("NFController, linha 1000 ", error)
                            res.status(500)
                        });
                } else {
                    //console.log('já existe, update será feito')
                    var updateQuery = knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                        .update("acumulador", acumulador_input)
                        .where("cnpj", cnpj)
                        .andWhere("cfop_entrada", cfop)
                        .andWhere("tipo_antecipado", tipo_antecipado)
                    if (mva) {
                        query.andWhere("mva", mva)
                    }

                    await updateQuery.then(async function (rows) {
                        /* update com sucesso */
                        //console.log('update: ', rows);
                        if (rows > 0) {
                            res.send("Dados atualizados!");
                        } else {
                            res.send("Erro ao gravar dados, tente novamente.");
                        }
                    }).catch((error) => {
                        console.log("NFController, linha 1020 ", error)
                        res.status(500)
                    });
                }
            } else {
                res.send("Erro ao gravar dados, tente novamente.");
            }
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },


    async updateAcumuladorDanfeNfce(req, res) {
        var { id_escritorio } = req.session.userData
        var { acumulador_input, cfop_nfce, cnpj, formadepag, mva } = req.body

        try {

            var query = knexPostgre("cfop_acumulador_tbl").withSchema('dbo').select('id_cfop_ac')
                .where("cnpj", cnpj)
                .andWhere("cfop_nfce", cfop_nfce)
                .andWhere("indicador_pag", formadepag)
                .andWhere(function () {
                    this.whereNull('tipo_antecipado')
                })
                .andWhere(function () {
                    this.whereNull('mva')
                })
                .andWhere(function () {
                    this.whereNull('cfop_entrada')
                })

            var existe = await query.then(async (rows) => {
                //console.log("queryquery ",rows)
                if (rows.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }).catch((error) => {
                console.log("NFController, linha 1069 ", error);
                res.status(500);
            })

            if (!existe) {
                console.log(" não existe, inserção será feita")
                await knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                    .insert({
                        'cnpj': cnpj,
                        'cfop_nfce': cfop_nfce,
                        'indicador_pag': formadepag,
                        'acumulador': acumulador_input
                    })
                    .returning("id_cfop_ac")
                    .then(async function (id_cfop_ac) {
                        /* inseriu com sucesso */
                        //console.log("inseriu id: ", id);
                        if (id_cfop_ac.length > 0) {
                            res.send(true);
                        } else {
                            res.send(false);
                        }
                    }).catch((error) => {
                        console.log("NFController, linha 11092 ", error);
                        res.status(500);
                    })
            } else {
                //console.log('já existe, update será feito')
                var updateQuery = knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                    .update("acumulador", acumulador_input)
                    .where("cnpj", cnpj)
                    .andWhere("cfop_nfce", cfop_nfce)
                    .andWhere("indicador_pag", formadepag)
                    .andWhere(function () {
                        this.whereNull('tipo_antecipado')
                    })
                    .andWhere(function () {
                        this.whereNull('mva')
                    })
                    .andWhere(function () {
                        this.whereNull('cfop_entrada')
                    })

                await updateQuery.then(async function (rows) {
                    /* update com sucesso */
                    //console.log('update: ', rows);
                    if (rows > 0) {
                        res.send(true);
                    } else {
                        res.send(false);
                    }
                }).catch((error) => {
                    console.log("NFController, linha 1118 ", error)
                    res.status(500)
                })
            }

        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }

    },

    async updateManifestacaoNota(req, res) {
        var { id_escritorio } = req.session.userData
        var { manifestacao, dataParaManifestacao, chaveDeAcesso, idChaveDeAcesso } = req.body
        console.log('data to update NFce', req.body);
        try {
            var manifestacaoCodeSEFAZ = sefaManifestacaoStatusResumo[manifestacao];
            if (manifestacaoCodeSEFAZ && idChaveDeAcesso) {
                knexPostgre("chaves_de_acesso_tbl").withSchema('dbo')
                    .update("operacao_pendente", 0)
                    .update("status_manifestacao", manifestacaoCodeSEFAZ)
                    .whereIn("id_chavedeacesso", idChaveDeAcesso)
                    .then(async (rows) => {
                        if (rows > 0) {
                            //Python
                            manifestarNota(manifestacao, dataParaManifestacao);
                            return res.send(true);
                        } else {
                            return res.send(false);
                        }
                    })
            } else {
                return res.send(false)
            }
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }

    },


    async updateMva4DanfeNfce(req, res) {
        var { id_escritorio } = req.session.userData
        var { id_item, cnpj, mva_4_input, mva_4_raw } = req.body

        console.log('data to update updateMva4DanfeNfce NFce', req.body)
        try {
            if (!mva) {
                //console.log("MVA NULOOOOO !!!! ", mva)
                mva = null
                //console.log("AGORA O MVA É NUll --> ", mva)
            }

            //Ajustar o update quando essa funcionalidade for necessaria
            /*
                    var query = knexPostgre("cfop_acumulador_tbl").withSchema('dbo').select('id_cfop_ac')
                        .where("cnpj", cnpj)
                        .andWhere("cfop_nfce", cfop_nfce)
                        .andWhere("indicador_pag", formadepag)
                        .andWhere(function () {
                            this.whereNull('tipo_antecipado')
                        })
                        .andWhere(function () {
                            this.whereNull('mva')
                        })
                        .andWhere(function () {
                            this.whereNull('cfop_entrada')
                        })
                    //.andWhere("mva", mva)

                    var existe = await query.then(async (rows) => {
                        //console.log("queryquery ",rows)
                        if (rows.length > 0) {
                            return true
                        } else {
                            return false
                        }
                    }).catch((error) => {
                        console.log("NFController, linha 1069 ", error)
                        res.status(500)
                    })

                    if (!existe) {
                        console.log(" não existe, inserção será feita")
                        await knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                            .insert({
                                'cnpj': cnpj,
                                'cfop_nfce': cfop_nfce,
                                'indicador_pag': formadepag,
                                'acumulador': acumulador_input
                            })
                            .returning("id_cfop_ac")
                            .then(async function (id_cfop_ac) {

                                //console.log("inseriu id: ", id);
                                if (id_cfop_ac.length > 0) {
                                    res.send(true);
                                } else {
                                    res.send(false);
                                }
                            }).catch((error) => {
                                console.log("NFController, linha 11092 ", error)
                                res.status(500)
                            })
                    } else {
                        //console.log('já existe, update será feito')
                        var updateQuery = knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                            .update("acumulador", acumulador_input)
                            .where("cnpj", cnpj)
                            .andWhere("cfop_nfce", cfop_nfce)
                            .andWhere("indicador_pag", formadepag)
                            .andWhere(function () {
                                this.whereNull('tipo_antecipado')
                            })
                            .andWhere(function () {
                                this.whereNull('mva')
                            })
                            .andWhere(function () {
                                this.whereNull('cfop_entrada')
                            })

                        await updateQuery.then(async function (rows) {

                            //console.log('update: ', rows);
                            if (rows > 0) {
                                res.send(true);
                            } else {
                                res.send(false);
                            }
                        }).catch((error) => {
                            console.log("NFController, linha 1118 ", error)
                            res.status(500)
                        })
                    }
                    */
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }

    },


    async updateReducaoBaseIcmsSaidaDanfeNfce(req, res) {
        var { id_escritorio } = req.session.userData
        var { id_item, cnpj, red_bc_icms_sai_pa_input, red_bc_icms_sai_pa_raw } = req.body

        console.log('data to update updateReducaoBaseIcmsSaidaDanfeNfce NFce', req.body)
        try {
            if (!mva) {
                //console.log("MVA NULOOOOO !!!! ", mva)
                mva = null
                //console.log("AGORA O MVA É NUll --> ", mva)
            }


            //Ajustar o update quando essa funcionalidade for necessaria
            /*
            var query = knexPostgre("cfop_acumulador_tbl").withSchema('dbo').select('id_cfop_ac')
                .where("cnpj", cnpj)
                .andWhere("cfop_nfce", cfop_nfce)
                .andWhere("indicador_pag", formadepag)
                .andWhere(function () {
                    this.whereNull('tipo_antecipado')
                })
                .andWhere(function () {
                    this.whereNull('mva')
                })
                .andWhere(function () {
                    this.whereNull('cfop_entrada')
                })
            //.andWhere("mva", mva)

            var existe = await query.then(async (rows) => {
                //console.log("queryquery ",rows)
                if (rows.length > 0) {
                    return true
                } else {
                    return false
                }
            }).catch((error) => {
                console.log("NFController, linha 1069 ", error)
                res.status(500)
            })

            if (!existe) {
                console.log(" não existe, inserção será feita")
                await knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                    .insert({
                        'cnpj': cnpj,
                        'cfop_nfce': cfop_nfce,
                        'indicador_pag': formadepag,
                        'acumulador': acumulador_input
                    })
                    .returning("id_cfop_ac")
                    .then(async function (id_cfop_ac) {
                        //console.log("inseriu id: ", id);
                        if (id_cfop_ac.length > 0) {
                            res.send(true);
                        } else {
                            res.send(false);
                        }
                    }).catch((error) => {
                        console.log("NFController, linha 11092 ", error)
                        res.status(500)
                    })
            } else {
                //console.log('já existe, update será feito')
                var updateQuery = knexPostgre("cfop_acumulador_tbl").withSchema('dbo')
                    .update("acumulador", acumulador_input)
                    .where("cnpj", cnpj)
                    .andWhere("cfop_nfce", cfop_nfce)
                    .andWhere("indicador_pag", formadepag)
                    .andWhere(function () {
                        this.whereNull('tipo_antecipado')
                    })
                    .andWhere(function () {
                        this.whereNull('mva')
                    })
                    .andWhere(function () {
                        this.whereNull('cfop_entrada')
                    })

                await updateQuery.then(async function (rows) {
                    //console.log('update: ', rows);
                    if (rows > 0) {
                        res.send(true);
                    } else {
                        res.send(false);
                    }
                }).catch((error) => {
                    console.log("NFController, linha 1118 ", error)
                    res.status(500)
                })
            }

            */
        } catch (error) {
            res.status(500);
            console.log("APP ===>", error);
        }
    },




};
