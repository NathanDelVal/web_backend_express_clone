
const { knexPostgre } = require('../../../../database/knex');

module.exports = {

    async updatePlano(req, res) {
        var { administrador, id_escritorio } = req.session.userData
        var { Plano, Contrato } = req.body

        if(administrador == "SIM") {
            if(Contrato && Plano) {
                console.log("tem plano e contrato")
                try {
                    console.log("entrou no try")
                    knexPostgre("dbo.escritorios_tbl")
                    .where("id_escritorio", id_escritorio)
                    .update({
                        status: 'Ativa',
                        plano: Plano,
                    })
                    .then((rowsAffected) => {
                        if (rowsAffected == 1) {
                            res.send("O plano foi atualizado com sucesso, faça login novamente!");
                        } else {
                            res.send("Erro ao atualizar plano, tente novamente.");
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500);
                    });
                } catch (error) {
                    res.status(500);
                    res.render("/notas");
                }
            } else { //adicionar esse cara na resposta do servidor
                res.send("O plano não foi atualizado, para realizar a atualização aceite o contrato.");
            }
        }
    },


    //no ato de cancelar recalcular o valor do bolteo - conectr com o bibo
    //importante
    async cancelarPlano(req, res) {
        var { administrador, id_escritorio } = req.session.userData
        var {msg_cancelamento_plano} = req.body
        //O front end está enviando antes de aceitar o contrato - VERIFICAR
        if(administrador == "SIM") {

            //criar schema pra contas canceladas
            console.log("o que tenho ==> ", msg_cancelamento_plano)
            //console.log("o que tenho ==> ", req.body)

            try {

                const inativarEscritorio = await knexPostgre("dbo.escritorios_tbl")
                .where("id_escritorio", id_escritorio)
                .update({
                    status: 'Inativa',
                    plano:  'FREE',
                })
                .then((rowsAffected) => {
                    if (rowsAffected) {
                        return true
                    } else {
                        return false
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500);
                });


                const inativarUsuarios = await knexPostgre("dbo.login_tbl")
                .where("id_escritorio", id_escritorio)
                .update({
                    ativo: 'NÃO',
                    administrador: 'NÃO',
                })
                .then((rowsAffected) => {
                    if (rowsAffected) {
                        return true
                    } else {
                        return false
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500);
                });

                if(inativarEscritorio || inativarUsuarios) {
                    console.log("a empresa e os usuarios foram inativados com sucesso", inativarEscritorio, inativarUsuarios)
                    res.send("A sua conta foi cancelada com sucesso")
                } else {
                    console.log("erro ao inativar escritorio")
                    res.send("Erro ao cancelar conta")
                }


            } catch (error) {
                res.status(500);
                res.render("/notas");
            }



        }
    }


}
