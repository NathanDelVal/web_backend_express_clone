const { knexPostgre } = require('../../../../database/knex');
const VerifyBadgeSuporteMSG = require('../../VerifyBadgeSupporteMSG');

module.exports = {

    async renderPage(req, res) {
        var {
            administrador,
            root,
            escritorio,
            suporte,
            email,
            plano
        } = req.session.userData

        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        try {
            res.render("./_escritorio/NotasFiscais/enviar-notas", {
                administrador,
                root,
                suporte,
                email,
                escritorio,
                plano
            });
        } catch (error) {
            //res.status(500)
            res.redirect("/");
        }
    },

    async upload(req, res) {
        //if the multer fails, req.file will be undefined
        //multer will send response for each file receveid because .single('file') on configuration
        if (req.file) {
            res.send("Nota(s) enviadas com sucesso!");
        } else {
            res.send("Ops! Não foi possível enviar suas notas, tente novamente.");
        }
        //console.log("Rota Upload arquivos => ")
        //res.send().status(200)
        //res.send("Processando Nota(s), aguarde...")
    },

    async uploadXmlToFolderUploads(req, res) {
        console.log("req ", req.body)
        //if the multer fails, req.file will be undefined
        //multer will send response for each file receveid because .single('file') on configuration
        if (req?.file) {
            res.send({
                userMessage:`Arquivos xml enviados com sucesso!`,
                details: "File saved",
                status: true
            });
        }

        if(req?.multer?.error?.notAllowed === true){
            res.status(400).send({
                userMessage:`Ops! Seus arquivos precisam ser do tipo XML.`,
                details: req?.multer?.error?.details ||null,
                status:true
            });
        }

        res.status(500).send()
    },

}
