//conexão local com sqlite
const { knexSQLite } = require("../../database/knex");

if (knexSQLite) {
    try {
        knexSQLite('empresas').select('cnpj').limit(1).then((rows) => { console.log("APP --> SQLite ✔️") })
    } catch (error) {
        console.log("APP --> SQLite ❌ ", error);
    }

} else {
    console.log("APP --> SQLite ❌ -Database não encontrada path: '_db' ");
}

module.exports = {
    async Consulta_CNPJ (cnpj) {
        cnpj = cnpj.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '').replace(/\//g, '')
        if(cnpj){
            if(cnpj.length !== 14){
                return
            }
        }
        if(!cnpj){
            return
        }
        return knexSQLite('empresas')
            .select('cnpj', 'razao_social', 'nome_fantasia', 'cep', 'uf', 'municipio', 'bairro', 'logradouro', 'numero')
            .where('cnpj', cnpj)
            .then((rows) => {
                //console.log("response == ", rows)
                if (rows) {
                    return rows[0]
                } else {
                    return []
                }
            }).catch((error) => {
                console.log(error);
                //throw error
            });
    }
 }


//MEMO


//ALL COLUMNS
//cnpj, matriz_filial, razao_social, nome_fantasia, situacao, data_situacao, motivo_situacao, nm_cidade_exterior, cod_pais, nome_pais, cod_nat_juridica, data_inicio_ativ, cnae_fiscal, tipo_logradouro, logradouro, numero, complemento, bairro, cep, uf, cod_municipio, municipio, ddd_1, telefone_1, ddd_2, telefone_2, ddd_fax, num_fax, email, qualif_resp, capital_social, porte, opc_simples, data_opc_simples, data_exc_simples, opc_mei, sit_especial, data_sit_especia

//cnpj, razao_social, nome_fantasia, cep, uf, municipio, bairro, longradouro, numero
