/*

Arquivo para upload de arquivos feitos no front-end.

Uso no modal de inserir novos clientes na página "Clientes" para inserir certificados digitais

*/

const multer = require("multer");
const path = require("path");
const { knexPostgre } = require("../database/knex");
const multerS3 = require("multer-s3");
const {S3Bucket} = require("../APIs/AWS/S3");
const { formatacoes } = require("../APIs/DANFE/core/brasil/brazilian/brazilian");


async function storeOnDB(req, storeObj) {
  var{ cliente,cnpj,situacao,regime,unidade,email_empresa,fone,senhacert } = storeObj

  req.EmpresasExistentes=[];
  req.EmpresasInseridas=[];

  const resultInsertionBD = await knexPostgre("empresas_tbl")
  .withSchema("dbo")
  .select("cliente", "cnpj")
  .where("cnpj", cnpj)
  .then(async(rows) => {
    if (rows.length > 0){
      console.log('Cliente já existe por isso não foi inserido!!!');
      req.EmpresasExistentes.push(rows[0].cliente);
      return false;
    }
    if (rows.length == 0) {
      return await knexPostgre("empresas_tbl")
      .withSchema("dbo")
      .insert(storeObj)
      .returning("cliente")
      .into("empresas_tbl")
      .then((rows) => {
        if (rows.length > 0) {
          console.log('>>>> INSERIDO ', cliente);
          req.EmpresasInseridas.push(cliente);
          return true
        }
        if(rows.length == 0 || !rows){
          console.log("Não Inseriu! ", cliente);
          return false
        }

      })
      .catch((error) => {
        console.log(error);
        return false;
      });
    }

  }).catch((error) => {
    console.log("multerS3 knexPostgre select catch", error);
    return { exists: false, row: [] };
  });
  console.log('>>>> Resultado da inserção (true or false)? ', resultInsertionBD);
  return resultInsertionBD;
}

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_CERTIFICADOS,
    key: (req, file, cb) => {

      console.log('key FILE >>>>> ', file.originalname);
      console.log('key CNPJ >>>', req.body.cnpj);
      var {cnpj,
        cliente,
        senhacert,
        unidade,
        regime,
        email_empresa,
        fone,
        situacao} = req.body;

      var { id_escritorio } = req.session.userData;
      var index = cnpj.length - 1;
      console.log('multerS3 Index >>>> ', index);
      //console.log('>:>>>> Cliente e CNPJ ', cliente, cnpj);
      if (
            !cnpj[index] ||
            !cliente[index] ||
            !senhacert[index] ||
            !unidade[index] ||
            !regime[index] ||
            !email_empresa[index] ||
            !fone[index] ||
            !situacao[index]
      ) {
            console.log("Multer Certificado Formulário incompleto!");
            req.multer= {formError: true, msg: "Formulário incompleto!" };
            cb(null, false);
          }
      cliente = cliente[index];
      cnpj = cnpj[index];
      var clienteClean = formatacoes.removerMascara(cliente);
      var cnpjClean = formatacoes.removerMascara(cnpj);
      /* console.log('>>>> CLIENTE SEM ESPACAO ', clienteClean);
      console.log('>>>> CNPJ SEM ESPACAO ', cnpjClean); */

      var fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
      console.log('>>>> fileKeyName ', fileKeyName);
      cb(null, fileKeyName);

    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: async(req, file, cb) => {
    //console.log('FILEFILTER >>>>>>>>>>>>>> ', file.originalname);
    const allowedMimes = [
      "application/keychain_access",
      "application/x-pkcs12",
    ];

    console.log('fileFilter FILE >>>>> ', file.originalname);
    console.log('fileFilter CNPJ >>>', req.body.cnpj);


    if(!allowedMimes.includes(file.mimetype)) return cb(null, false);
    if (allowedMimes.includes(file.mimetype)) {

      const { id_escritorio } = req.session.userData;
      var {cnpj,cliente,senhacert,unidade,regime,email_empresa,fone,situacao} = req.body;
        var index = cnpj.length - 1;
        var clienteClean = formatacoes.removerMascara(cliente[index]);
        var cnpjClean = formatacoes.removerMascara(cnpj[index]);

        //Caso não seja array não será gravado no s3
        if (!Array.isArray(cliente) || !Array.isArray(cnpj)) cb (null, false);
        if (!id_escritorio || !clienteClean || !cnpjClean) cb(null, false);

        //var fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
        var fileKeyNameSemExtensao = `${clienteClean}!${cnpjClean}`.toUpperCase();
        var storeObj = {};
         storeObj.cliente = cliente[index];
         storeObj.cnpj = cnpjClean;
         storeObj.situacao = situacao[index];
         storeObj.regime_tributario = regime[index];
         storeObj.unidade = unidade[index];
         storeObj.email_empresa = email_empresa[index];
         storeObj.fone = fone[index];
         storeObj.senhacertificado = senhacert[index];
         storeObj.nomecertificado = fileKeyNameSemExtensao;
         storeObj.id_escritorio = id_escritorio;
         //req.result =  storeOnDB(storeObj);
        const result =  storeOnDB(req, storeObj)
        /* .then(result => {
          console.log('>>> Resultado da inserção do banco!!! ', result);
          if(!result) cb(null, false);
          if (result) cb(null, true);
        }); */
        console.log('>>>> Filefilter result insertion ONDB ', result);
        /* if(result === false) cb(null, false);
        if (result === true) cb(null, true);
         */
        cb (null, true);
    }

  },
};

/*



module.exports = {
    dest: path.resolve(__dirname, '..', '..', '..', 'storage', 'certificados'),
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, path.resolve(__dirname, '..', '..', '..', 'storage', 'certificados'));
        },

        filename: (req, file, cb) => {
            var { cnpj, cliente } = req.body
            cnpj = cnpj.replace(/\s/g, '').replace(/\./g, "").replace(/-/g, "").replace(/\//g, "")
            var nome_fantasia = req.session.userData.nome_fantasia;
            var nome_fantasia_NOESPACES = nome_fantasia.replace(/\s/g, '');
            var fileName = "";

            //FUNÇÕES PARA REMOVER OS ESPAÇOS
            const getfilename = async function (nome, cnpj, nome_fantasia) {
                fileName = await generateFilename(nome, cnpj, nome_fantasia);
                return fileName
            }
            const generateFilename = function (nome, cnpj, nome_fantasia) {
                return `${nome}!${cnpj}!${nome_fantasia}.pfx` //`${nome}!${cnpj}!${nome_fantasia}.pfx`
            }

            if (!Array.isArray(cliente)) {
                //console.log("não é array")
                //console.log(" clientecliente  ", cliente)
                var clienteClean = cliente.replace(/\s/g, '');
                var cnpjClean = cnpj.replace(/\s/g, '').replace(/\./g, "").replace(/-/g, '').replace(/\//g, '');

                if (clienteClean && cnpjClean && nome_fantasia_NOESPACES) {
                    getfilename(clienteClean, cnpjClean, nome_fantasia_NOESPACES).then(function (returnedFileName) {
                        //console.log("returnedFileName no array ", returnedFileName)
                        if (returnedFileName) {
                            req.body.filename = [returnedFileName]
                            return cb(null, returnedFileName);
                        } else {
                            return cb(null, '');
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                }

            } else if (Array.isArray(cliente)) {
                //console.log("É ARRAY")

                var clienteClean = cliente.replace(/\s/g, '');
                var cnpjClean = cnpj.replace(/\s/g, '').replace(/\./g, "").replace(/-/g, '').replace(/\//g, '');

                //console.log("ULTIMOS DADOS => ", clienteClean, 'and', cnpjClean)

                if (clienteClean && cnpjClean && nome_fantasia_NOESPACES) {
                    //console.log("OKKK")
                    getfilename(clienteClean, cnpjClean, nome_fantasia_NOESPACES).then(function (returnedFileName) {
                        //console.log("returnedFileName array ", returnedFileName)
                        if (returnedFileName) {
                            returnedFileName = returnedFileName.replace(/\.pfx/g, '') //pra gravar no banco sem ".pfx"
                            req.body.filename = [returnedFileName]
                            return cb(null, returnedFileName);
                        } else {
                            return cb(null, '');
                        }
                    }).catch((error) => {
                        console.log(error)
                    })

                }


            }

        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/keychain_access', 'application/x-pkcs12'];
        //console.log("Mimes", file.mimetype)
        if (allowedMimes.includes(file.mimetype)) {
            return cb(null, true);
            //console.log("Mime ACEITO")
        } else {
            //console.log("Mime não aceito")
            return cb(new Error("Formato de arquivo invalido."));
        }
    },
};


versão funcional


const multer = require("multer");
const path = require("path");
const { knexPostgre } = require("../database/knex");
const multerS3 = require("multer-s3");
const S3aws = require("../APIs/AWS/S3");
const { formatacoes } = require("../APIs/DANFE/core/brasil/brazilian/brazilian");


async function storeOnDB(req, storeObj) {
  var{ cliente,cnpj,situacao,regime,unidade,email_empresa,fone,senhacert } = storeObj

  req.EmpresasExistentes=[];
  req.EmpresasInseridas=[];

  const resultInsertionBD = await knexPostgre("empresas_tbl")
  .withSchema("dbo")
  .select("cliente", "cnpj")
  .where("cnpj", cnpj)
  .then(async(rows) => {
    if (rows.length > 0){
      console.log('Cliente já existe por isso não foi inserido!!!');
      req.EmpresasExistentes.push(rows[0].cliente);
      return false;
    }
    if (rows.length == 0) {
      return await knexPostgre("empresas_tbl")
      .withSchema("dbo")
      .insert(storeObj)
      .returning("cliente")
      .into("empresas_tbl")
      .then((rows) => {
        if (rows.length > 0) {
          console.log('>>>> INSERIDO ', cliente);
          req.EmpresasInseridas.push(cliente);
          return true
        }
        if(rows.length == 0 || !rows){
          console.log("Não Inseriu! ", cliente);
          return false
        }

      })
      .catch((error) => {
        console.log(error);
        return false;
      });
    }

  }).catch((error) => {
    console.log("multerS3 knexPostgre select catch", error);
    return { exists: false, row: [] };
  });
  console.log('>>>> Resultado da inserção (true or false)? ', resultInsertionBD);
  return resultInsertionBD;
}

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_CERTIFICADOS,
    key: async (req, file, cb) => {
      var {cnpj,
        cliente,
        senhacert,
        unidade,
        regime,
        email_empresa,
        fone,
        situacao} = req.body;

      var { id_escritorio } = req.session.userData;
      var index = cnpj.length - 1;
      console.log('multerS3 Index >>>> ', index);
      //console.log('>:>>>> Cliente e CNPJ ', cliente, cnpj);
      if (
            !cnpj[index] ||
            !cliente[index] ||
            !senhacert[index] ||
            !unidade[index] ||
            !regime[index] ||
            !email_empresa[index] ||
            !fone[index] ||
            !situacao[index]
      ) {
            console.log("Multer Certificado Formulário incompleto!");
            req.multer= {formError: true, msg: "Formulário incompleto!" };
            cb(null, false);
          }
      cliente = cliente[index];
      cnpj = cnpj[index];
      var clienteClean = formatacoes.removerMascara(cliente);
      var cnpjClean = formatacoes.removerMascara(cnpj);
      console.log('>>>> CLIENTE SEM ESPACAO ', clienteClean);
      console.log('>>>> CNPJ SEM ESPACAO ', cnpjClean);

      var fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
      console.log('>>>> fileKeyName ', fileKeyName);
      cb(null, fileKeyName);

    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: async(req, file, cb) => {
    const allowedMimes = [
      "application/keychain_access",
      "application/x-pkcs12",
    ];
    console.log('fileFilter req.body >>>>> ', req.body)
    if(!allowedMimes.includes(file.mimetype)) return cb(null, false);
    if (allowedMimes.includes(file.mimetype)) {

        const { id_escritorio } = req.session.userData;
        var {cnpj,cliente,senhacert,unidade,regime,email_empresa,fone,situacao} = req.body;
        var index = cnpj.length - 1;
        var clienteClean = formatacoes.removerMascara(cliente[index]);
        var cnpjClean = formatacoes.removerMascara(cnpj[index]);

        //Caso não seja array não será gravado no s3
        if (!Array.isArray(cliente) || !Array.isArray(cnpj)) cb (null, false);
        if (!id_escritorio || !clienteClean || !cnpjClean) cb(null, false);

        //var fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
        var fileKeyNameSemExtensao = `${clienteClean}!${cnpjClean}`.toUpperCase();
        var storeObj = {};
         storeObj.cliente = cliente[index];
         storeObj.cnpj = cnpjClean;
         storeObj.situacao = situacao[index];
         storeObj.regime_tributario = regime[index];
         storeObj.unidade = unidade[index];
         storeObj.email_empresa = email_empresa[index];
         storeObj.fone = fone[index];
         storeObj.senhacertificado = senhacert[index];
         storeObj.nomecertificado = fileKeyNameSemExtensao;
         storeObj.id_escritorio = id_escritorio;
         //req.result =  storeOnDB(storeObj);
        storeOnDB(req, storeObj)
        .then(result => {
          console.log('>>> Resultado da inserção do banco!!! ', result);
          if(!result) cb(null, false);
          if (result) cb(null, true);
        });



    }

  },
};





*/
