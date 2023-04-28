/**
 *@description
 *Arquivo para upload de arquivos xml através da API do Joeliton.
 */

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let fileFolder = "";

    const { cnpj } = req.body;

    if (cnpj && cnpj.length) {
      fileFolder = cnpj;
    }

    const storage_dir = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "storage",
      "uploads",
      fileFolder
    );

    if (!fs.existsSync(storage_dir)) {
      fs.mkdirSync(storage_dir, { recursive: true });
    }

    console.log("storage_dir -> ", storage_dir);

    cb(null, storage_dir);
  },
  filename: function (req, file, cb) {

    var { nome_arquivo } = req.body || {};
    var originalName = file?.originalname || ''
    var fileName = null;

    if (originalName) {
      fileName = `${originalName}`;
    }
    if (nome_arquivo) {
      fileName = nome_arquivo
    }

    if (!fileName) {
      fileName = `file-${Date.now()}.xml`;
    }
    console.log("fileName ", fileName);

    cb(null, `${fileName.replace(/\s/g, "_").replace(/\.xml/g, "")}.xml`);
  },
});

const limits = {
  fileSize: 50 * 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["text/xml", "application/xml", "xml"];
  if (allowedMimes.includes(file.mimetype)) {
    console.log("File allowed");
    cb(null, true);
  } else {
    console.log("File not allowed");
    req.multer.error.details.message = `uploaded file type ${file.mimetype}`
    req.multer.error.details.allowedMimes = allowedMimes.toString()
    
    cb(null, false);
  }
};

module.exports = {
  multerUploadXmlToFolder: {
    storage,
    limits,
    fileFilter,
  },
};
