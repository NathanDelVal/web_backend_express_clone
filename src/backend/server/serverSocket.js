'use strict';

const { saveSocketMsgMongo, getChatMongo } = require('../database/mongoDB')
//const { session } = require('../../app')

const io = require('socket.io')();
// Doc Útil --> https://www.npmjs.com/package/express-socket.io-session

io.on('connection', (socket) => {
  if (socket.handshake.session.userData) {
    //console.log('SOCKET => ' + socket.handshake.session.userData.usuario + '  conectou-se');
  }
  //console.log('SOCKET => ', socket.handshake.session.userdata);
  //console.log("SESSÃO DO SOCKET ", socket.handshake.session)
  socket.on('disconnect', function () {
    if (socket.handshake.session.userData) {
      //console.log('SOCKET => ' + socket.handshake.session.userData.usuario + ' desconectou-se');
    }
  });

  //TÓPICO OUVINTE DAS COMUNICAÇÕESENTRE CLIENTE E SUPORTE
  socket.on("ServerChannel", async function (sktData) {
    var { chamado, emailusuario, msg, from } = sktData
    //console.log("ServerChannel RECEBEU =======>", sktData)
    if (chamado && msg && emailusuario && from) {
        saveSocketMsgMongo(emailusuario, chamado, msg, from).then(async (status) => {
        //console.log("SAIDA DO MONGO INSERT = ", status)
        if (status == 1) {
          //console.log("MONGO INSERIU")
          getChatMongo(emailusuario, chamado).then(async (chat) => {
            io.emit(chamado.toString(), chat);
            io.emit(emailusuario.toString(), chat);
          })
        } else if(status == 0) {
          console.log("SOCKET => Não consegui salvar a mensagem do chat")
        }
      })
    }
    //socket.emit('ClientChannel', chamado + " - SOCKET emit"); //envia para todos
    //io.broadcast.emit('ClientChannel', sktData + " - SOCKET io.broadcast"); //envia para todos menos quem enviou a msg
    //io.emit('ClientChannel', sktData + " - Silvio Santos"); //Responde somente quem enviou a msg
  });

});



module.exports = io;
