const { response } = require('express');
const moment = require('moment');
const { knexPostgre } = require("../../../../database/knex");

//const { ExpireTime } = require('../../helpers/sessionTime')
//const diff = ExpireTime(rows.data_inicio)

module.exports = {
    async shutDownFREEplans(days) {

        const timeNow = moment().subtract(days, 'days').format("YYYY-MM-DD HH:mm:ss")
        //.subtract(1, "days");
        console.log("FSADF ", timeNow)
        if (timeNow) {

            const rows = await knexPostgre('dbo.escritorios_tbl').select('id_escritorio').where('data_inicio', '<=', timeNow).andWhere('plano', 'FREE')
            console.log("escritorios vencidos ", rows)
            const rowsEscritoriosFK = await rows.map(function (row) {
                return row.id_escritorio
            });
            console.log("works ? ", rowsEscritoriosFK)

            //DESATIVAR USUARIOS
            const loginsDesativados = await knexPostgre('dbo.login_tbl').update({ ativo: 'NÃO' }).whereIn('id_escritorio', rowsEscritoriosFK).andWhere('ativo', 'SIM').returning('id_login')
            console.log("login table ", loginsDesativados)

            /*
            ids.push(rows)
            //continuar aqui paassar ids pra array
                ids =
                 var arrayId = new Array();
                arrayId = idsSplited.split(",");

            foreach(rows){
                ids.push(rows)
            }

        })

*/

        } else {
            console.log(timeNow, 'Inválido')
        }
    }
}

/*
 knexPostgre('dbo.empresas_tbl_view')
                    .select('id_empresa', 'cliente', 'cnpj', 'situacao', 'regime_tributario', 'unidade', 'nome_fantasia', 'expiration_date')
                    .where('nome_fantasia', nome_fantasia)
                    .orderBy('cliente', 'asc')
                    .then((rows) => {
                        dateRowsAdjustments(rows).then((dataok) => {
                        dataTable = JSON.stringify(dataok);
                        try {
                            res.send({
                                dataTable
                            });
                            //res.send(nomepjexistente);
                        } catch (error) {
                            res.status(500)
                            console.log(error);
                            res.status(500)
                        }
                    })
                    }).catch((error) => {
                        console.log(error);
                        res.status(500)
                    });


//UPDATE

 knexPostgre('empresas_tbl')
    .where('id_empresa', id_item)
    .update(obj2Update)
    .returning('id_empresa')
    .into('empresas_tbl')
    .then((id_empresa) => {

}).catch((error) => {
    console.log(error);
    res.status(500)
});

 */
