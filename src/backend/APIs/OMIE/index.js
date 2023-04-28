const omieApi = require('./omieFunctionsContas');

const jsonFunctions = require('../../routes/helpers/jsonObject');

module.exports = {
    async CadastroEfetivo(params, method) {
        try {

            var {identificacao:{cNome}, telefone_email:{cEmail}} = params;

            const contaASerVerificada = {
                "cNome": cNome,
                "cEmail": cEmail
            };

            const propertysIfExists = ["nCod", "cCodInt", "cCodStatus", "cDesStatus"];
            const propertysIfError = ["faultstring", "faultcode"];

            const accountOmie = await omieApi.VerficarConta(contaASerVerificada);
            const haveAllPropertys = await jsonFunctions.hasAllProperties(accountOmie, propertysIfExists);
            if (!haveAllPropertys || method == 'AlterarConta') {
                let resultadoIncluidoConta;
                //if para executar a função de IncluirConta ou AlerarConta
                if (method == "IncluirConta"){
                    resultadoIncluidoConta = await omieApi.IncluirConta(params);
                }
                if (method == "AlterarConta"){
                    resultadoIncluidoConta = await omieApi.AlterarConta(params);
                }

                const hallAllPropertysInclude = await jsonFunctions.hasAllProperties(resultadoIncluidoConta, propertysIfExists);
                var resultInsertion;

                if (!hallAllPropertysInclude) {
                    resultInsertion = {status: false, msg: "Conta não foi cadastrado no Omie"};
                } else {
                    resultInsertion = {status: true, msg: "Conta cadastrada com sucesso no Omie"};
                }

            }
        return resultInsertion;
        } catch (error) {
            console.log(">>>> CadastroEfetivo error do try catch, ", error.message);
        }
    },

    async cadastroContato(params) {
        try {

            var {identificacao:{cNome}, telefone_email:{cEmail}} = params;

            const contatoASerVerificado = {
                "cNome": cNome,
                "cEmail": cEmail
            };

            const propertysIfExists = ["nCod", "cCodInt", "cCodStatus", "cDesStatus"];
            const propertysIfError = ["faultstring", "faultcode"];

            const contactOmie = await omieApi.VerificarContato(contatoASerVerificado);
            const haveAllPropertys = await jsonFunctions.hasAllProperties(contactOmie, propertysIfExists);
            if (!haveAllPropertys) {
                let resultadoIncluidoConta;
                //if para executar a função de IncluirConta ou AlerarConta
                resultadoIncluidoConta = await omieApi.IncluirContato(params);

                const hallAllPropertysInclude = await jsonFunctions.hasAllProperties(resultadoIncluidoConta, propertysIfExists);

                var resultInsertion;
                if (!hallAllPropertysInclude) {
                    resultInsertion = {status: false, msg: "Contato não foi cadastrado no Omie"};
                } else {
                    resultInsertion = {status: true, msg: "Contato cadastrada com sucesso no Omie"};
                }

            }

            return resultInsertion;
        } catch (error) {
            console.log(">>>> CadastroEfetivo error do try catch, ", error.message);
        }
    }
}
