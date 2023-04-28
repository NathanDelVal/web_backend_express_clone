const { knexPostgre } = require('../../../../database/knex');
const { schemaAgendamento } = require('../../../../workers/JOI/schemas');
const { nfe, validacoes, dados, formatacoes, bancos, boleto } = require('../../../../APIs/DANFE/core/brasil/brazilian/brazilian');
const {responseForRequest} = require('../../../helpers/responseToRequest');

module.exports = {

    async renderCadastrarAgendamento(req, res) {
        return res.render('./_escritorio/Agendamento/cadastrar-agendamento');
    },

    async cadastrarAgendamento(req, res) {

        var {
            nome_completo, email, numero_contato, cnpj, razao_social, cpf, disponibilidade
        } = req.body

        var obj = {};
        if (nome_completo)      obj.nome_completo = nome_completo;
        if (email)              obj.email = email;
        if (numero_contato)     obj.numero_contato = formatacoes.removerMascara(numero_contato);
        if (razao_social)       obj.razao_social = razao_social;
        if (cnpj)               obj.cnpj = formatacoes.removerMascara(cnpj);
        if (cpf)                obj.cpf = formatacoes.removerMascara(cpf); //cpf = cpf.replace(/\./g, '').replace(/-/g, '').replace(/\//g, '');

        obj.disponibilidade = disponibilidade;
        //console.log(">>>>> Objeto: ", obj);
        var response = {};
        try {
            const { error, value } =  schemaAgendamento.validate(req.body);
            console.log("Error: ",error);
            console.log("Value: ",value);
            if (error) {
                return res.send(responseForRequest(error.message, false, true));

            }

            if (!error && value) {
                console.log(">>>> Antes da query");
                try {
                    knexPostgre('agendamentos_tbl').withSchema('dbo')
                    .select('cnpj')
                    .where('cnpj', obj.cnpj)
                    .then(rows => {
                        if (rows.length == 0) {
                            knexPostgre('agendamentos_tbl').withSchema('dbo')
                            .insert(obj)
                            .then(rows => {
                                if (rows == 0){
                                    return res.send(responseForRequest('Escritório já  está cadastrado para agendamento!', false, true));
                                }
                                return res.send(responseForRequest('Agendamento realizado com sucesso!', true, false));
                            })
                        } else {
                            return res.send(responseForRequest('Falha ao realizar agendamento!', false, true));
                        }

                    })

                } catch (error) {
                    console.log(error);
                }
            }


        } catch (error) {
            console.log(error);
        }
    },

}
