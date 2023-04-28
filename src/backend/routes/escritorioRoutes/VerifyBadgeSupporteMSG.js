const socket = require('../../server/serverSocket');
const { knexPostgre } = require('../../database/knex');

module.exports = {
    //------------------------------------------------[SESSION VALIDATE]------------------------------------------------------
    async SendOverbadgeSupporteMSG(topico) {
        var email = topico;
        try {
            knexPostgre('dbo.chamados_tbl')
                .select('id_chamado', 'numerochamado', 'assunto', 'tipo', 'descricao', 'status', 'respondidopor', 'resposta', 'usuarionome', 'inserido', 'prioridade', 'visualizado')
                //.andWhere('visualizado', false)
                .andWhere('usuarioemail', email)
                .andWhereNot('resposta', "")
                .where('status', 'Pendente')
                .then((rows) => {
                    var dataTableChamados = rows;
                    var msg = dataTableChamados.length
                    if (dataTableChamados.length > 0) {
                        socket.on('connection', (io) => {
                            //console.log("=-=> ",topico, msg)
                            io.emit(topico, msg)
                        });

                    } else {
                        let msg = 0;
                        socket.on('connection', (io) => {
                            io.emit(topico, msg)
                        });

                    }
                }).catch((error) => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }

    }

}
