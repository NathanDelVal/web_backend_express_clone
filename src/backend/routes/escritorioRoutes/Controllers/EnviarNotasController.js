const { knexPostgre } = require('../../database/knex');

const VerifyBadgeSuporteMSG = require('../../routes/VerifyBadgeSupporteMSG')


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
           return res.render("./_escritorio/_EndUser/enviar-notas", {
                administrador,
                root,
                suporte,
                email,
                escritorio,
                plano
            });
        } catch (error) {
            console.log("APP ===>", error);
            return res.redirect("/");
        }
    },

    async upload(req, res) {
        if (req.file) {
           return res.send("Nota(s) envidas com sucesso!");
        } else {
           return res.send("Ops! Não foi possível enviar suas notas, tente novamente.");
        }
    }

}
