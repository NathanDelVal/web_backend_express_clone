const { knexPostgre } = require("../../../database/knex");

//Adicionar Redis aqui posteriormente
module.exports = {

    async countTipoAntecipadoWhereLike(descricao) {
        return await knexPostgre.from('dbo.produtos_tbl_view').select('tipo_antecipado').count('tipo_antecipado as qtd').where('descricao_item', 'like', `%${descricao}%`).groupBy('tipo_antecipado').catch((error)=>{
            console.log("APP => countTributacoes, linha 9", error)
        })
    },

    async countTipoAntecipadoWhereInit(descricao) {
        return await knexPostgre.from('dbo.produtos_tbl_view').select('tipo_antecipado').count('tipo_antecipado as qtd').where('descricao_item', 'like', `%${descricao}`).groupBy('tipo_antecipado').catch((error)=>{
            console.log("APP => countTributacoes, linha 15", error)
        })
    },


    async countTipoAntecipadoWhereLikeByNumeroNota(numero_nota) {
        return await knexPostgre.from('dbo.produtos_tbl_view').select('tipo_antecipado').count('tipo_antecipado as qtd').where('numero', `${numero_nota}`).groupBy('tipo_antecipado').catch((error)=>{
            console.log("APP => countTributacoes, linha 22", error)
        })
    },


}