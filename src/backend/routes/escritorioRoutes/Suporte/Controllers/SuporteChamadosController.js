const moment = require('moment');
const { knexPostgre } = require('../../../../database/knex');
const { getChatMongo } = require('../../../../database/mongoDB');

module.exports = {
    async renderPage(req, res) {

        var {
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData

        try {
            res.render('./_escritorio/Suporte/suporte-chamados', {
                administrador,
                root,
                suporte,
                nome_fantasia
            });
        }
        catch (error) {
            console.log(error)
        }
    },
    async getChamadosSuporte(req, res) {

        var { suporte } = req.session.userData

        var RootQuery = knexPostgre('dbo.chamados_tbl')
            .select('id_chamado', 'numerochamado', 'assunto', 'tipo', 'descricao', 'status', 'respondidopor', 'resposta', 'usuarionome', 'usuarioemail', 'inserido', 'modificado', 'prioridade')
            .whereNot('status', 'Fechado')

        if (suporte == 'TRIBUTACAO') {
            RootQuery.andWhere('tipo', 'Tributação')
        }

        if (suporte == 'TI') {
            RootQuery.andWhereNot('tipo', 'Tributação')
        }

        RootQuery.then((rows) => {
            var dataTableChamados = rows
            var AdjustdataTableChamados = dataTableChamados.map(function (saida) {
                saida.inserido = moment(saida.inserido, "YYYY-MM-DD").format("DD/MM/YYYY");
                //console.log("data convert : ", saida.inserido)
                return saida;
            });
            dataTableChamados = JSON.stringify(AdjustdataTableChamados)
            res.send({
                dataTableChamados
            });
        }).catch((error) => {
            console.log(error)
        })
    },
    async getChatSuporte(req, res) {
        const { email, usuario, chamado } = req.body

        getChatMongo(email, chamado).then(function (SupportChat) {
            //console.log("lllllll ", SupportChat)
            try {
                res.send({
                    SupportChat
                });
            }
            catch (error) {
                console.log(error)
            }
        })
    },
    async atenderChamado(req, res) {
        //console.log("session ", req.session.userData)
        const { usuario } = req.session.userData

        //console.log("chegou! ", req.body)

        if (req.method == "POST") {
            const { numeroChamado, tipo, resposta } = req.body


            var objItens = {}
            objItens.status = 'Pendente';

            const getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')


            if (getdate) {
                objItens.modificado = getdate
            }
            if (usuario) {
                objItens.respondidopor = usuario
            }

            if (resposta) {
                objItens.resposta = resposta
            }
            if (tipo) {
                objItens.tipo = tipo
            }


            if (Object.entries(objItens).length !== 0) {
                try {
                    knexPostgre('dbo.chamados_tbl')
                        .where('numerochamado', numeroChamado)
                        .update(objItens)
                        .then((rows) => {
                            //console.log("GRAVOU ! ", rows)
                            if (rows) {
                                res.send("Chamado respondido!")
                            } else {
                                //console.log("NÃO GRAVOU ! ", rows)
                                res.send("Chamado não respondido!")
                            }
                        });
                } catch (error) {
                    res.send("Erro ao gravar novos dados!");
                    //res.status(500);
                    // res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador });
                }
            }
        }
    }
}
