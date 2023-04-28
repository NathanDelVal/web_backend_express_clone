//const { query } = require("express");
const moment = require('moment')
const { knexPostgre } = require("../../../database/knex");
const { formatacoes } = require('../../../APIs/DANFE/core/brasil/brazilian/brazilian')
const DanfeWebViewNfe = require('../../../APIs/DANFE/webview_nfe');
const { makePDF } = require('../../../APIs/DANFE/createpdf');

async function dateRowsAdjustments (rows, column){
    return await rows.map(function (row) {
        if(row[column]){
            row[column] = moment(row[column], "YYYY-MM-DD").format("DD/MM/YYYY");
        }
    return row
    });
}

async function mergeArrays(arrays, prop) {
    const merged = {};
    if(arrays){
        arrays.forEach(arr => {
            if(arr){
                arr.forEach(item => {
                    if(item){
                    merged[item[prop]] = Object.assign({}, merged[item[prop]], item);
                    }
                });
            }
        });
        return Object.values(merged);
    }else{
        return merged
    }
}


module.exports = {

    async renderRoboFiscal(req, res) {
        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario,
            email,
            bi_controladoria,
            bi_dominio_vs_app
        } = req.session.userData
            /*
                'rf_notas_icms_sum',
                 'rf_notas_piscofins_sum',
                 'rf_notas_antecipados_sum',
                 'rf_notas_erro_sum'
            */
        try {
            res.render("./_escritorio/RoboFiscal/robo-fiscal", {
                administrador,
                root,
                suporte,
                email,
                nome_fantasia,
                bi_controladoria,
                bi_dominio_vs_app
            });
        } catch (error) {
            console.log(error)
            res.status(404)
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

            //console.log("actualMonth", actualMonth)
            //console.log("actualYear", actualYear)
            //console.log("lastYear", lastYear)

            var query1 = knexPostgre('dbo.robofiscal_controle_notas_tbl_sum_mes_view')
                .select('rf_notas_icms_sum_mes',
                    'rf_notas_piscofins_sum_mes',
                    'rf_notas_antecipados_sum_mes',
                    'rf_notas_erro_sum_mes')
                .where('nome_fantasia', nome_fantasia)


            if (actualMonth != 12) {
                query1.andWhere('rf_notas_data_sincronizacao_ano', actualYear)
                .andWhere('rf_notas_data_sincronizacao_mes', actualMonth)
                    //.whereIn('rf_notas_data_sincronizacao_mes', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            } else {
                query1.andWhere('rf_notas_data_sincronizacao_ano', actualYear)
                .orWhere(function() {
                        this.where('rf_notas_data_sincronizacao_ano', lastYear).andWhere('rf_notas_data_sincronizacao_mes', '12')
                    })
            }

            query1.then((rows) => {
                    //console.log("wwwww ", rows)
                    if (rows.length > 0) {
                        contador = JSON.stringify(rows[0])
                        knexPostgre('dbo.robofiscal_controle_notas_tbl_view')
                            .select('rf_notas_id', 'rf_notas_cliente', 'cliente', 'rf_notas_icms', 'id_escritorio', 'nome_fantasia', 'rf_notas_piscofins', 'rf_notas_itens_atualizados', 'rf_notas_chave_de_acesso', 'rf_notas_tipo_nota', 'rf_notas_modelo_doc', 'rf_notas_antecipados', 'rf_notas_data_sincronizacao', 'rf_notas_erro', 'numero', 'nome_pj_emitente')
                            .where('nome_fantasia', nome_fantasia)
                            //.andWhere('rf_notas_itens_atualizados', '>', '0')
                            //.orderBy('cliente', 'asc')
                            .limit(2000)
                            .then(async (rows) => {
                                //console.log('dados da query: ', rows)
                                const data4Table = JSON.stringify(await dateRowsAdjustments(rows, 'rf_notas_data_sincronizacao'));
                                if (data4Table) {
                                    res.send({
                                        data4Table,
                                        contador
                                    });
                                } else {
                                    res.status(204)
                                }
                            }).catch((error) => {
                                console.log(error)
                            })
                    }else{
                        var data4Table = []
                        res.send({
                            data4Table,
                            contador
                        });
                    }

                })

        } catch (error) {
            res.status(500)
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

        var { months, year } = req.body


        //console.log('tenho o mes e o ano:', months, year)
        try {

            var contador;

            knexPostgre('dbo.robofiscal_controle_notas_tbl_sum_mes_view')
                .select('rf_notas_icms_sum_mes',
                    'rf_notas_piscofins_sum_mes',
                    'rf_notas_antecipados_sum_mes',
                    'rf_notas_erro_sum_mes')
                .where('nome_fantasia', nome_fantasia)
                //.andWhere('rf_notas_itens_atualizados_sum_mes', '>', '0')
                .andWhere('rf_notas_data_sincronizacao_mes', months)
                .andWhere("rf_notas_data_sincronizacao_ano", year)
                .then((rows) => {
                    //console.log("rowsrows sum mes ", rows)
                    if (rows) {

                        contador = JSON.stringify(rows[0])

                        knexPostgre('robofiscal_controle_notas_tbl_view').withSchema('dbo')
                            .select('rf_notas_id', 'rf_notas_cliente', 'cliente', 'rf_notas_icms', 'id_escritorio', 'nome_fantasia', 'rf_notas_piscofins', 'rf_notas_itens_atualizados', 'rf_notas_chave_de_acesso', 'rf_notas_tipo_nota', 'rf_notas_modelo_doc', 'rf_notas_antecipados', 'rf_notas_data_sincronizacao', 'rf_notas_erro', 'numero', 'nome_pj_emitente')
                            //.where('nome_fantasia', nome_fantasia)
                            .where('id_escritorio', id_escritorio)
                            .andWhere('rf_notas_itens_atualizados', '>', '0')
                            .andWhere('rf_notas_data_sincronizacao_mes', months)
                            .andWhere(knexPostgre.raw('YEAR("rf_notas_data_sincronizacao")'), year)
                            .then(async (rows) => {

                                const data4Table = JSON.stringify(await dateRowsAdjustments(rows, 'rf_notas_data_sincronizacao'));

                                if (data4Table) {
                                    res.send({
                                        data4Table,
                                        contador
                                    });
                                } else {
                                    res.status(204)
                                }
                                //console.log('DADOS DA ROW:', data4Table)

                            }).catch((error) => {
                                console.log(error)
                            })
                    }

                })

        } catch (error) {
            res.status(500)
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
                //.where('nome_fantasia', nome_fantasia)
                .where('id_escritorio', id_escritorio)
                .andWhere('rf_prod_itens_atualizados', '>', 0)
                .then((rows) => {
                    dataTable = JSON.stringify(rows)
                    if (rows) {
                        try {
                            res.send({
                                dataTable
                            });

                        } catch (error) {
                            //res.status(500)
                            res.render("acesso", { erro: error });
                        }
                    } else {
                        res.status(204)
                    }
                })

        } catch (error) {
            console.log(error)
        }
    },


    async getPDFByChaveAcesso(req, res) {
        var { id_escritorio } = req.session.userData
        var { chave_de_acesso } = req.body

        chave_de_acesso = formatacoes.removerMascara(chave_de_acesso)
        try {
            //busca banco de dados
            const queryResult = await knexPostgre.select("arquivo_xml").from("dbo.xml_recebidos_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                .then((result) => { return result[0] })
            if (queryResult) {
                var danfe = DanfeWebViewNfe.fromXML(queryResult.arquivo_xml)
                if (danfe) {
                    res.send(danfe.toHtml())
                } else {
                    res.send("Nenhuma nota encontrada")
                }
            } else {
                res.send("Nenhuma nota encontrada")
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
                //var xml = queryResult.arquivo_xml  // fs.readFileSync('./    21210110353688000228550030001228771853945269.xml').toString();
                makePDF(queryResult.arquivo_xml, '', function (error, pdf) {


                    if (error) {
                        res.status(500);
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
            const queryResult = await knexPostgre.select("arquivo_xml")
            .from("dbo.xml_recebidos_processados_view")
            .where("chavedeacesso", chave_de_acesso)
            .andWhere('id_escritorio', id_escritorio)
            .limit(1)
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




    async countNotasEntradaSaida(req, res){
        const { administrador, root, id_escritorio } = req.session.userData;

        var { months, year } = req.body;

          try{
            //A view "notas_tbl_emitente_view" relaciona o cnpj_emitente da nota INNER JOIN ON empresas_tbl.cnpj para obtermos a "situacao" AS "situacao_empresa"
            //A view "notas_tbl_destinatario_view" relaciona o cnpj_destinatario da nota INNER JOIN ON empresas_tbl.cnpj para obtermos a "situacao" AS "situacao_empresa"
            var QUERY_fantasiasunicasDestinatario = await knexPostgre('notas_tbl_destinatario_view').withSchema('dbo')
            .distinct('destinatario as fantasia')
            .where("id_escritorio", id_escritorio)
            .andWhere('situacao_empresa','Ativa')

            var QUERY_fantasiasunicasEmitente = await knexPostgre('notas_tbl_emitente_view').withSchema('dbo')
            .distinct('emitente as fantasia')
            .where("id_escritorio", id_escritorio)
            .andWhere('situacao_empresa','Ativa')

            //console.log("QUERY_fantasiasunicasDestinatario ", QUERY_fantasiasunicasDestinatario)
            //console.log("QUERY_fantasiasunicasEmitente ", QUERY_fantasiasunicasEmitente)

            var QUERY_notasDestinatario = knexPostgre('notas_tbl_destinatario_view')
            .withSchema('dbo')
            .select('destinatario as fantasia')
            .count('chavedeacesso', {'as': 'qtd_entrada'})
            .where("modelo_doc", '55')
            .andWhere("id_escritorio", id_escritorio)
            .andWhere('situacao_empresa','Ativa')

            var QUERY_notasDestinatarioLancadas = knexPostgre("dbo.notas_tbl_destinatario_view")
            .select('destinatario as fantasia')
            .count('chavedeacesso', {'as': 'qtd_entrada_lancadas'})
            .where("modelo_doc", '55')
            .andWhere('tag', 'LANÇADAS')
            .andWhere("id_escritorio", id_escritorio).andWhere('situacao_empresa','Ativa')

            var QUERY_notasEmitente = knexPostgre('notas_tbl_emitente_view')
            .withSchema('dbo')
            .select('emitente as fantasia')
            .count('id_chavedeacesso', {'as': 'qtd_saida'})
            //.where("modelo_doc", '65')
            .andWhere('tipo_nota', 'like', '%saida')  //culpa do Gabrel 15/12/2021
            .andWhere("id_escritorio", id_escritorio)
            .andWhere('situacao_empresa','Ativa')

            /*
            .orWhere(function() {
                        this.where('rf_notas_data_sincronizacao_ano', lastYear).andWhere('rf_notas_data_sincronizacao_mes', '12')
                    })
            */

            var QUERY_notasEmitenteLancadas = knexPostgre('notas_tbl_emitente_view')
            .withSchema('dbo')
            .select('emitente as fantasia')
            .count('id_chavedeacesso', {'as': 'qtd_saida_lancadas'})
            //.where("modelo_doc", '65')
            .andWhere('tipo_nota', 'like', '%saida') //culpa do Gabrel 15/12/2021
            .andWhere('tag', 'LANÇADAS')
            .andWhere("id_escritorio", id_escritorio).andWhere('situacao_empresa','Ativa')


            if(months && year){
                QUERY_notasDestinatario.andWhere('mes_data_entrada', months).andWhere('ano_data_entrada', year)
                QUERY_notasDestinatarioLancadas.andWhere('mes_data_entrada', months).andWhere('ano_data_entrada', year)
                QUERY_notasEmitente.andWhere('mes_data_entrada', months).andWhere('ano_data_entrada', year)
                QUERY_notasEmitenteLancadas.andWhere('mes_data_entrada', months).andWhere('ano_data_entrada', year)
            }

            QUERY_notasDestinatario.groupBy('destinatario')
            QUERY_notasDestinatarioLancadas.groupBy('destinatario')
            QUERY_notasEmitente.groupBy('emitente')
            QUERY_notasEmitenteLancadas.groupBy('emitente')


            //console.log("QUERY 1 " , QUERY_notasEmitente.toSQL().toNative())
            //console.log("QUERY 2 " , QUERY_notasEmitenteLancadas.toSQL().toNative())


            const notasDestinatario = await QUERY_notasDestinatario.catch((error)=>{
                console.log("APP --> ", error)
                //res.status(500)
            }); //.then((rows)=>{console.log("ffffffffff" , rows); return rows;})

            const notasDestinatarioLancadas = await QUERY_notasDestinatarioLancadas.catch((error)=>{
                console.log("APP --> ", error);
                //res.status(500);
            }); //.then((rows)=>{console.log("ffffffffff" , rows); return rows;})

            const notasEmitente = await QUERY_notasEmitente.catch((error)=>{
                console.log("APP --> ", error);
                //res.status(500);
            }); //.then((rows)=>{console.log("ffffffffff" , rows); return rows;})

            const notasEmitenteLancadas = await QUERY_notasEmitenteLancadas.catch((error)=>{
                console.log("APP --> ", error);
                //res.status(500);
            }); //.then((rows)=>{console.log("ffffffffff" , rows); return rows;})




            const SomaTotalEntradasSaidas = async(input)=>{
                var total = {
                  total_qtd_entrada:0,
                  total_qtd_entrada_lancadas:0,
                  total_qtd_saida:0,
                  total_qtd_saida_lancadas:0
                 };
                  var newArray = input.map(function(obj){
                        if(obj.qtd_entrada){total['total_qtd_entrada'] +=  parseInt(obj.qtd_entrada)};
                        if(obj.qtd_entrada_lancadas){total['total_qtd_entrada_lancadas'] += parseInt(obj.qtd_entrada_lancadas)};
                        if(obj.qtd_saida){total['total_qtd_saida'] += parseInt(obj.qtd_saida)};
                        if(obj.qtd_saida_lancadas){total['total_qtd_saida_lancadas'] += parseInt(obj.qtd_saida_lancadas)};
                    return;
                  });
                  //console.log("total ", total);
                  return total;
              }



            var ArrayObj = await mergeArrays([QUERY_fantasiasunicasDestinatario, QUERY_fantasiasunicasEmitente, notasDestinatario, notasDestinatarioLancadas, notasEmitente, notasEmitenteLancadas], 'fantasia');
            var Totais = await SomaTotalEntradasSaidas(ArrayObj);
            //console.log("Totais gabriel ", Totais)
            var DATA = {
                        "data4Table": ArrayObj,
                        "total":Totais
                    };

            res.send(JSON.stringify(DATA));
          }
          catch(error){
          console.log('APP -->', error);
          res.status(500);
          }

      }



}
