const multer = require("multer");
const path = require("path");
const { knexPostgre } = require("../database/knex");
const multerS3 = require("multer-s3");
const { S3Bucket } = require("../APIs/AWS/S3");
const {
  formatacoes,
} = require("../APIs/DANFE/core/brasil/brazilian/brazilian");

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_CERTIFICADOS,
    key: async (req, file, cb) => {
      console.log("multer req.body ", req.body);
      /* cliente = cliente[index];
      cnpj = cnpj[index];
      const { id_escritorio } = req.session.userData;
      var clienteClean = formatacoes.removerMascara(cliente);
      var cnpjClean = formatacoes.removerMascara(cnpj);
      var fileKeyName = `${id_escritorio}/${clienteClean.toUpperCase()}!${cnpjClean.toUpperCase()}.pfx`;
      console.log('>>>> fileKeyName ', fileKeyName);
      cb(null, fileKeyName); */
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: async (req, file, cb) => {
    console.log(">>>> FileFilter ", req.rec, req.body.user);

    const allowedMimes = [
      "application/keychain_access",
      "application/x-pkcs12",
    ];

    /*  try {
      const { FlagMulterInsertions, user } = req.body;
      console.log('>>>> FlagMulterInsertions ', FlagMulterInsertions);
      
      if (allowedMimes.includes(file.mimetype)) {
      
      if(FlagMulterInsertions[FlagMulterInsertions.length - 1]){
        console.log("Inserir user ", FlagMulterInsertions[FlagMulterInsertions.length - 1]);
        cb(null, true);
      }
      if(!FlagMulterInsertions[FlagMulterInsertions.length - 1]){
        console.log("Não inserir user ",FlagMulterInsertions[FlagMulterInsertions.length - 1]);
        cb(null, false);
      }
    } else {
      console.log('>>>> Tipo de arquivo não aceito');
      cb(null, false);

    }
    }
    catch (error) {
      console.log(error);
          console.log("catch error ", error.message)
      cb(null, false);
    }
         //console.log("Mimes", file.mimetype)
    */
  },
};

/*


const multer = require("multer");
const path = require("path");
const { knexPostgre } = require("../database/knex");
const multerS3 = require("multer-s3");
const S3aws = require("../APIs/AWS/S3");
const { formatacoes } = require("../APIs/DANFE/core/brasil/brazilian/brazilian");

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_CERTIFICADOS,
    key: async (req, file, cb) => {
      var {user} = req.body;
      console.log('>>>>> Req.body ', req.body);
      console.log("multerS3 teste !! filename: ", file.originalname);
      cb(null, `multerS3_testee/${user[user.length -1]}_${file.originalname}`);
      
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: async (req, file, cb) => {
    console.log('>>>> FileFilter ', req.rec, req.body.user);
   
    const allowedMimes = [
      "application/keychain_access",
      "application/x-pkcs12",
    ];

    try {
      const { inserir, user } = req.body;
      /* if (!Array.isArray(user)) console.log("CHEGOU ITENS NÃO ARRAY!!!", user);
      if (Array.isArray(user) ) { console.log("É ARRAY" , user);} 
      if (allowedMimes.includes(file.mimetype)) {
      
        if(inserir[inserir.length-1] === "true"){
          console.log("Inserir user ", user[user.length -1]);
          cb(null, true);
        }
        if(inserir[inserir.length-1] === "false"){
          console.log("Não inserir user ", user[user.length -1]);
          cb(null, false);
        }
      } else {
        console.log('>>>> Tipo de arquivo não aceito');
        cb(null, false);
  
      }
      }
      catch (error) {
        console.log(error);
            console.log("catch error ", error.message)
        cb(null, false);
      }
           //console.log("Mimes", file.mimetype)
     
   
    
  
    },
  };
  

*/
