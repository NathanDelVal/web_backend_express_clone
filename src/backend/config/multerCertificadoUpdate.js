/*

Arquivo para upload de arquivos feitos no front-end.

Uso no modal de inserir novos clientes na página "Clientes" para inserir certificados digitais

*/

const multer = require("multer");
const path = require("path");
const { knexPostgre } = require("../database/knex");
const multerS3 = require("multer-s3");
const { S3Bucket } = require("../APIs/AWS/S3");

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_CERTIFICADOS,
    key: async (req, file, cb) => {
      console.log(
        "multerS3 update!! filename: ",
        file.originalname /* req.body, file */
      );
      var { nome_fantasia, id_escritorio } = req.session.userData;

      //FUNÇÕES PARA REMOVER OS ESPAÇOS
      var {
        id_item,
        cliente,
        cnpj,
        unidade,
        regime,
        email_empresa,
        fone,
        situacao,
        senhaCertificado,
      } = req.body;
      const getfilename = async (nome, cnpj) =>
        await generateFilename(nome, cnpj);
      const generateFilename = async (nome, cnpj) => `${nome}!${cnpj}.pfx`;

      if (!Array.isArray(cliente)) {
        var nome = cliente.replace(/\s/g, "");
        var cnpj = cnpj
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(/-/g, "")
          .replace(/\//g, "");
        if (!nome && !cnpj) return cb(true, null);
        const fileName = await getfilename(nome, cnpj);

        if (!fileName) {
          req.body.fileName = null;
          cb(true, null); //Não grava no S3
        }
        if (fileName) {
          var nomedocertificado = fileName.toUpperCase();
          req.body.fileName = nomedocertificado;
          return cb(null, `${id_escritorio}/${nomedocertificado}`); //Gravar no S3
        }
      } else {
        Console.log(
          "APP ---> multerCertificadUpdate ERROR: 'cliente' é um array!"
        );
        return cb(true, null); //Não grava no S3
      }
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/keychain_access",
      "application/x-pkcs12",
    ];
    //console.log("Mimes", file.mimetype)
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      //console.log("Mime ACEITO")
    } else {
      //console.log("Mime não aceito")
      cb(new Error("Formato de arquivo invalido."));
    }
  },
};
