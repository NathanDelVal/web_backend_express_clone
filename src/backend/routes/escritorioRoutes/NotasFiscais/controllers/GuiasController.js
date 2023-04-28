const fs = require('fs');
const crypto = require('crypto');
const hbs = require('hbs')
const { knexPostgre } = require('../../../../database/knex');
const VerifyBadgeSuporteMSG = require('../../VerifyBadgeSupporteMSG');
const moment = require('moment');

module.exports = {

    async renderPage(req, res) {
        var { administrador, root, nome_fantasia, email, suporte, bi, plano } = req.session.userData;
        VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
        try {
            res.render("./_escritorio/NotasFiscais/guias", { administrador, root, suporte, nome_fantasia, email, bi, plano });
        } catch (error) {
            //res.status(500)
            res.redirect("/");
        }
    },


}

