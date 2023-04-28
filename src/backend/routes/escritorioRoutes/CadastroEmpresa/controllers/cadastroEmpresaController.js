const {responseForRequest} = require('../../../helpers/responseToRequest');
const { knexPostgre } = require('../../../../database/knex');
const {getStreamFiles, deleteTempFile} = require('../../../../workers/formidable/')
const { nfe, validacoes, dados, formatacoes, bancos, boleto } = require('../../../../APIs/DANFE/core/brasil/brazilian/brazilian');
const {uploadFile} = require('../../../../APIs/AWS/S3/index');

module.exports = {
    async efetuarCadastroEmpresa (req, res, next) {
      // req.body é um objeto undefined, pois a requisição é um multipart/form
      //e só será interpretada após o formidable dentro da função getStreamFiles()
      //porém o formidable obtém os parâmetros na variável fields a qual vamos construir
      // o req body a partir dela

      //fake session
      //req.session.userData = {id_escritorio: 1012};
      try {
        const {fields, files} = await getStreamFiles(req);

        req.body = {...fields};

        var {cnpj,cliente,senhacert,unidade,regime,email_empresa,fone,situacao, nao_contribuinte, nao_layout} = req.body;
        const arraySameLength = new Set([cnpj?.length, cliente?.length, senhacert?.length, unidade?.length, regime?.length, email_empresa?.length, fone?.length, situacao?.length]).size;

        if(arraySameLength !== 1 || !Array.isArray(cliente) || !Array.isArray(cnpj)){
         return res.send(responseForRequest("Formulário Incompleto", false, true));
        }

        req.body.EmpresasExistentes = [];
        req.body.EmpresasInseridas = [];

        const { id_escritorio } = req.session.userData;

        for (let index = 0; index < cnpj.length; index++) {
          //console.log('>>> dentro do for index ', index);

          let clienteClean = formatacoes.removerMascara(cliente[index]);
          let cnpjClean = formatacoes.removerMascara(cnpj[index]);
          let fileKeyNameSemExtensao = `${clienteClean}!${cnpjClean}`.toUpperCase();

          let storeObj = {};
          storeObj.cliente = clienteClean;
          storeObj.cnpj = cnpjClean;
          storeObj.situacao = situacao[index];
          storeObj.regime_tributario = regime[index];
          storeObj.unidade = unidade[index];
          storeObj.email_empresa = email_empresa[index];
          storeObj.fone = fone[index];
          storeObj.senhacertificado = senhacert[index];
          storeObj.nomecertificado = fileKeyNameSemExtensao;
          storeObj.id_escritorio = id_escritorio;
          //CHECKBOX nao_contribuinte e nao_layout quando ticados vem a String 'true', quando não ticados não vem a variável no body
          nao_contribuinte? storeObj.credito_icms = 'N' : storeObj.credito_icms = 'S';
          nao_layout? storeObj.gerar_layout= '0' : storeObj.gerar_layout= null;
          await knexPostgre("empresas_tbl")
          .withSchema("dbo")
          .select("cliente", "cnpj")
          .where("cnpj", cnpjClean)
          .limit(1)
          .then(rows => rows[0])
          .then(async(rows) => {
            if (rows){
              req.body.EmpresasExistentes.push(rows.cliente);

            }
            if (!rows) {
              await knexPostgre("empresas_tbl")
              .withSchema("dbo")
              .insert(storeObj)
              .returning("cliente")
              .then(rows => rows[0])
              .then(async (rows) => {
                if (rows) {
                  req.body.EmpresasInseridas.push(rows);
                  let fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
                  uploadFile(process.env.AWS_BUCKET_CERTIFICADOS, files.file[index].BUFFERdata, fileKeyName);

                }
                if(!rows){
                  req.body.FlagMulterInsertions.push(true);
                  req.body.EmpresasExistentes.push(rows.cliente);

                }


              })
              .catch((error) => {
                console.log(error);
              });
            }
          }).catch((error) => {
            console.log("knexPostgre efetuarCadastroEmpresa() catch", error.message);
            return res.status(200).send(responseForRequest(error.message, false, true));

          });

        }

        var {EmpresasExistentes, EmpresasInseridas} = req.body

        if (!EmpresasExistentes && !EmpresasInseridas) return res.send(responseForRequest("Erro ao inserir novo(s) cliente(s). Tente novamente!", false, true))
        var response = responseForRequest("Clientes inseridos com sucesso!", true, false, {
          "EmpresasExistentes": EmpresasExistentes,
          "EmpresasInseridas": EmpresasInseridas
        });
        if (EmpresasExistentes.length > 0 && EmpresasInseridas.length == 0) response.msg = 'Clientes não inseridos';
        return res.status(200).send(response);


      } catch (error) {
        console.log('>>>> efetuarCadastroPG catch ', error.message);
        return res.send(responseForRequest(error.message, false, true));
      }

    },


}
