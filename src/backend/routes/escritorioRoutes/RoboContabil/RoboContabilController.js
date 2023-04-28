const {knexPostgre} = require("../../../database/knex");

module.exports = {

  async renderRoboContabil(req, res) {
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
        res.render("./_escritorio/_Home/robo-contabil", {
            administrador,
            root,
            suporte,
            email,
            nome_fantasia,
        });
    } catch (error) {
        console.log(error)
        res.status(404)
    }
}



}


