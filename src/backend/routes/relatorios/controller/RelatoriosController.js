// QUERIES

/*
    NCM:

    SELECT ncm, grupo AS "grupo", subgrupo AS "sub-grupo" 
    FROM dbo.ncm_tbl
*/

/*
    Produtos Entrada:

    SELECT id_empresa AS "cod_empresa", CAST(id_empresa AS VARCHAR) || '|' || 
    CAST(Id_produto_empresa AS VARCHAR) AS "cod_empresa_produto", data_movimento AS "data_entrada", quantidade AS quantidade, valor_unitario AS "valor_unitario", valor_total AS "valor_total" 
    FROM dbo.produtos_movimento WHERE operacao = 'E'
*/

/* 
    Produtos Saída:

    SELECT id_empresa AS "cod_empresa", CAST(id_empresa AS VARCHAR) || '|' || 
    CAST(Id_produto_empresa AS VARCHAR) AS "cod_empresa_produto", data_movimento AS "data_saida", quantidade AS quantidade, valor_unitario AS "valor_unitario", valor_total AS "valor_total", valor_total_custo_venda/quantidade AS "custo unitario", valor_total_custo_venda AS "custo total"
    FROM dbo.produtos_movimento 
    WHERE operacao = 'S' AND quantidade != 0
*/
const { knexPostgre } = require("../../../database/knex");
const moment = require('moment');

module.exports = {
    async getNCM(req, res) {
        try {
            const ncm = knexPostgre("ncm_tbl")
                .withSchema("dbo")
                .select("ncm", "grupo", "subgrupo")
                .limit(100)
                .then((rows) => {
                    res.send(rows);
                })

        } catch (error) {
            res.send({
                "ERROR": error.message
            });
        }
        // res.send(req.session.userData);
    },

    async getEntradas(req, res) {
        try {
            const {empresas, startDate, endDate } = req.body

            const entradas =  knexPostgre("produtos_movimento")
                .withSchema("dbo")
                .select("produtos_movimento.id_empresa", "empresas_tbl.cliente","empresas_tbl.id_escritorio", "produtos_movimento.data_movimento", "produtos_movimento.quantidade", "produtos_movimento.valor_unitario", "produtos_movimento.valor_total", "produtos_movimento.valor_total_custo_venda")
                // .limit(100)
                .join('empresas_tbl', 'produtos_movimento.id_empresa', '=', 'empresas_tbl.id_empresa')
                if(empresas) {
                    entradas.whereIn('empresas_tbl.id_empresa', empresas)
                }
                entradas.where('empresas_tbl.id_escritorio', req.session.userData.id_escritorio/*16*/)
                .andWhere('produtos_movimento.operacao', 'E');
                if (startDate && endDate) {
                    var datade_formatado = moment(startDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                    var dataate_formatado = moment(endDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                    entradas.andWhere(function () {
                        this.where(
                            "data_movimento",
                            ">=",
                            datade_formatado + "T00:00:00.000Z"
                        ).andWhere("data_movimento", "<=", dataate_formatado);
                    })
                }

            //    console.log("QUERY --->", entradas.toSQL().toNative()) 

               const databaseData = await entradas

                return res.send(databaseData || []);


        } catch (error) {
            console.log("error -> ", error.message)
            res.status(500).send({
                "ERROR": error.message
            });
        }
    },

    async getSaidas(req, res) {
        try {
            const {empresas, startDate, endDate } = req.body

            const saidas =  knexPostgre("produtos_movimento")
                .withSchema("dbo")
                .select("produtos_movimento.id_empresa", "empresas_tbl.cliente","empresas_tbl.id_escritorio", "produtos_movimento.data_movimento", "produtos_movimento.quantidade", "produtos_movimento.valor_unitario", "produtos_movimento.valor_total", "produtos_movimento.valor_total_custo_venda")
                // .limit(100)
                .join('empresas_tbl', 'produtos_movimento.id_empresa', '=', 'empresas_tbl.id_empresa')
                if(empresas) {
                    saidas.whereIn('empresas_tbl.id_empresa', empresas)
                }
                saidas.where('empresas_tbl.id_escritorio', req.session.userData.id_escritorio/*16*/)
                .andWhere('produtos_movimento.operacao', 'S')
                .andWhere('produtos_movimento.quantidade', '<>', 0)
                if (startDate && endDate) {
                    var datade_formatado = moment(startDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                    var dataate_formatado = moment(endDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                    saidas.andWhere(function () {
                        this.where(
                            "data_movimento",
                            ">=",
                            datade_formatado + "T00:00:00.000Z"
                        ).andWhere("data_movimento", "<=", dataate_formatado);
                    })
                }

               console.log("QUERY --->", saidas.toSQL().toNative()) 

               const databaseData = await saidas

                return res.send(databaseData || []);


        } catch (error) {
            console.log("error -> ", error.message)
            res.status(500).send({
                "ERROR": error.message
            });
        }
    }
}

