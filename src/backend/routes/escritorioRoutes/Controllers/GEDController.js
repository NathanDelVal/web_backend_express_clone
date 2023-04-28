const {knexPostgre} = require("../../database/knex");
const moment = require('moment')

module.exports = {

    async renderPage(req, res) {
        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario,
            email
        } = req.session.userData
            /*
                'rf_notas_icms_sum',
                 'rf_notas_piscofins_sum',
                 'rf_notas_antecipados_sum',
                 'rf_notas_erro_sum'
            */
        try {
           return res.render("./_escritorio/_Home/GED", {
                administrador,
                root,
                suporte,
                email,
                nome_fantasia,
            });
        } catch (error) {
            console.log("APP ===>", error);
           return res.status(404);
        }
    },

    async renderAdminGED(req, res) {
        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario,
            email
        } = req.session.userData

        try {
            return res.render("./_escritorio/_Home/AdminGED", {
                    administrador,
                    root,
                    suporte,
                    email,
                    nome_fantasia,
            });
        } catch (error) {
            console.log("APP ===>", error);
            return res.status(404);
        }
    },


}
