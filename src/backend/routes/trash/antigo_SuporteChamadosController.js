const { knexPostgre } = require('../../database');
const moment = require('moment');
const fs = require('fs')
const JsonRW = require('../JsonRW')

var JSONfilename = './storage/SupportMSG/SupportChat.json'

module.exports = {
    async renderPage(req, res) {
          var {
            administrador,
            root,
            nome_fantasia,
            suporte,
        } = req.session.userData;


        try {
           return res.render('./_escritorio/_InternalUser/suporte-chamados', {
                administrador,
                root,
                suporte,
                nome_fantasia
            });
        }
        catch (error) {
            console.log("APP ===>", error);
        }
    },
    async getChamadosSuporte(req, res) {
        knexPostgre('dbo.chamados_tbl')
            .select (
                'id_chamado', 'numerochamado', 'assunto', 'tipo', 'descricao',
                'status', 'respondidopor',   'resposta', 'usuarionome', 'usuarioemail',
                'inserido', 'modificado', 'prioridade')
            .then((rows) => {
                console.log("sssssssss ", rows)
                var dataTableChamados = rows
                var AdjustdataTableChamados = dataTableChamados.map(function (saida) {
                    saida.inserido = moment(saida.inserido, "YYYY-MM-DD").add(1, 'days').format("DD/MM/YYYY");
                    //console.log("data convert : ", saida.inserido)
                    return saida;
                });
                dataTableChamados = JSON.stringify(AdjustdataTableChamados)
                return res.send({ dataTableChamados});
            }).catch((error) => {
                console.log("APP ===>", error)
            })
    },
    async getChatSuporte(req, res) {
        var EndUserEmail = req.body.email
        var EndUserName = req.body.usuario
        var EndUserChamado = req.body.chamado
        var SupportChat;
        JsonRW.readFilePromise(JSONfilename).then(data => {
            var tempSupportChat = JSON.parse(data);
            var temp2SupportChat = tempSupportChat[EndUserName][EndUserChamado]
            SupportChat = JSON.stringify(temp2SupportChat)
        }).then(function () {
            try {
                return res.send({
                    SupportChat
                });
            }
            catch (error) {
                console.log("APP ===>", error)
            }
        })
    },

    //xing 01/06
    async sendChatSupporte(req, res) {
        if (req.method == "POST") {
            var EndUserName = req.body.usuarioData
            var newMsg = req.body.newMsg
            var nchamado = req.body.numeroChamado
            if (newMsg != '' && newMsg != undefined) {
                var SupportChat = "";
                JsonRW.readFilePromise(JSONfilename).then(data => {
                    SupportChat = JSON.parse(data);
                    SupportChat[EndUserName][nchamado].push(newMsg)
                }).then(function () {
                    JsonRW.writeFilePromise(JSONfilename, JSON.stringify(SupportChat))
                }).then(function () {
                    return res.status(201).send('Mensagem recebida')
                });
            } else {
                return res.status(422)
            }
        } else {
            return res.status(400)
        }
    }


}
