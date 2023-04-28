/*

Arquivo para upload de arquivos feitos no front-end.

Uso na página "Documentos - GED" para envio manual de XML, PDF, JPEG e PNG.

*/

const multer = require("multer");
const path = require("path");
const multerS3 = require("multer-s3");
const { S3Bucket } = require("../APIs/AWS/S3");

//const { initInsertMongo } = require('../database/mongoDB');

var srcGed = "core_ged_python";

module.exports = {
  storage: multerS3({
    s3: S3Bucket,
    bucket: process.env.AWS_BUCKET_GED,
    key: function (req, file, cb) {
      console.log("process.env.AWS_BUCKET_GED: ", process.env.AWS_BUCKET_GED);
      console.log("key: function ", file);
      var fileName = file.originalname.toString().replace(/\s/g, "");
      req.body.fileName = fileName;
      let key = `temp/${fileName}`;
      cb(null, key); //use Date.now() for unique file keys
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "text/xml",
      "application/xml",
      "text/pdf",
      "application/pdf",
      "image/png",
      "image/jpeg",
      //console.log("Mimes")
    ];

    if (allowedMimes.includes(file.mimetype)) {
      //console.log("Mime accepted -->", file.mimetype)
      cb(null, true);
    } else {
      console.trace("Mime not accepted -->", file.mimetype);
      cb(null, false);
      //cb(new Error("Formato de arquivo inválido."));
    }
  },
};
