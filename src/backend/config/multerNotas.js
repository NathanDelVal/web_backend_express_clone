/*

Arquivo para upload de arquivos feitos no front-end.

Uso na página "Enviar Notas" para envio manual de XML.

*/

const multer = require('multer');
const path = require('path');

module.exports = {


    dest: path.resolve(__dirname, '..', '..', '..', 'storage', 'uploads'),
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', '..', 'storage', 'uploads'));
        },
        filename: (req, file, cb) => {
            exec = async () => {
                console.log("chegou isso enviar notas ", file)
                console.log("chegou isso enviar notas nome do arquivo ", file.originalname)
                ///var nomedoescritorio = ""
                var nomedoescritorio = req.session.userData.nome_fantasia.replace(/\s/g, '')
                var { usuario, nome_fantasia, id_escritorio } = req.session.userData
                var id_escritorio_clean = id_escritorio.toString().replace(/\s/g, '')
                //console.log("nomedoescritorio ", nomedoescritorio)
                /* const fileName = `${escritorio.toString()}-${file.originalname}`;
                    //const fileName = `${"mezzomo"}!${file.originalname}`;
                    */
                var originalName = file.originalname.toString().replace(/\s/g, '')
                //console.log("originalName ", originalName)
                //var fileName = `${nomedoescritorio.toString()}!${originalName}`;
                //var fileName = `${nomedoescritorio.toString()}!${originalName}`;
                var fileName = `${id_escritorio_clean}_${originalName}`;
                console.log("original name == ", originalName)
                console.log("fileName == ", fileName)
                return cb(null, fileName);
            }
           exec()
        },
    }),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/xml',
            //'image/png',
            //console.log("Mimes")
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            //cb(new Error("Formato de arquivo inválido."));
        }

    },
};
