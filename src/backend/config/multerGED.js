/*

Arquivo para upload de arquivos feitos no front-end.

Uso na página "Documentos - GED" para envio manual de XML, PDF, JPEG e PNG.

*/

const multer = require('multer');
const path = require('path');

var srcGed ='core_ged_python'

module.exports = {

    dest: path.resolve(__dirname, '..', '..', '..', '..', srcGed, 'docs'),
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', '..', '..', srcGed, 'docs'));
        },

        filename: (req, file, cb) => {
            exec = async () => {
                var fileName = file.originalname.toString().replace(/\s/g, '');
                req.body.fileName = fileName;
                return cb(null, fileName);
            }
            exec()
        },
    }),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        //console.log("File Extension --> ",file.mimetype)
        const allowedMimes = [
            'text/xml',
            'application/xml',
            'text/pdf',
            'application/pdf',
            'image/png',
            'image/jpeg',
            //console.log("Mimes")
        ];

        if (allowedMimes.includes(file.mimetype)) {
            //console.log("Mime accepted -->", file.mimetype)
            cb(null, true);
        } else {
            console.trace("Mime not accepted -->", file.mimetype)
            cb(null, false);
            //cb(new Error("Formato de arquivo inválido."));
        }

    },
};
