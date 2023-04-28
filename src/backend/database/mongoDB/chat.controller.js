const { schemaSupport } = require("./schemas/chat.schema");

async function saveSocketMsgMongo(userEmail, chamado, mensagem, fromMsg) {
  let userAndtickets = false;
  let user = false;
  let userNotTickets = false;

  var chamadoNovo = new schemaSupport({
    useremail: "",
    chamado: "",
    messages: [
      {
        from: "",
        msg: "",
        createdAt: "",
        updatedAt: "",
      },
    ],
  });

  var date = new Date();

  const res = await schemaSupport.find({
    useremail: userEmail,
    chamado: chamado,
  });

  if (res) {
    for (let i = 0; i < res.length; i++) {
      if (res[0].useremail === userEmail && res[0].chamado === chamado) {
        userAndtickets = true;
      }

      if (res[0].usuarioemail === userEmail) {
        user = true;
      }

      if (res[0].chamado === chamado) {
        userNotTickets = true;
      }
    }
  }

  if (user && !userNotTickets) {
    date = new Date();
    chamadoNovo = new schemaSupport({
      useremail: userEmail,
      chamado: chamado,
      deletado: 0,
      messages: [
        {
          from: "supportChatMsg",
          msg: "Olá, como podemos ajudar?",
          createdAt: date,
          updatedAt: date,
        },
      ],
    });

    return chamadoNovo.save().then(() => {
      return 1;
    });
  }

  if (!userAndtickets) {
    date = new Date();
    chamadoNovo = new schemaSupport({
      useremail: userEmail,
      chamado: chamado,
      deletado: 0,
      messages: [
        {
          from: "supportChatMsg",
          msg: "Olá, como podemos ajudar?",
          createdAt: date,
          updatedAt: date,
        },
      ],
    });
    return chamadoNovo.save().then(() => {
      return 1;
    });
  } else {
    const tamanho = res[0].messages.length;
    if (res[0].messages[tamanho - 1].msg === mensagem) {
      return 0;
    } else {
      return schemaSupport
        .updateOne(
          { _id: res[0]._id },
          {
            $push: {
              messages: {
                from: fromMsg,
                msg: mensagem,
                createdAt: date,
                updatedAt: date,
              },
            },
          }
        )
        .then(() => {
          return 1;
        });
    }
  }
}

async function getChatMongo(userEmail, chamado) {
  return await schemaSupport
    .find({
      useremail: userEmail,
      chamado: chamado,
    })
    .then((dados) => {
      if (dados.length > 0) {
        if (dados[0].messages) {
          return dados[0].messages;
        } else {
          dados = [];
        }
      } else {
        dados = [];
      }
    })
    .catch((error) => {
      console.trace(error);
    });
}

async function getChatMongoTeste() {
  return await schemaSupport
    .find({})
    .then((dados) => {
      if (dados.length > 0) {
        if (dados[0].messages) {
          return dados[0].messages;
        } else {
          dados = [];
        }
      } else {
        dados = [];
      }
    })
    .catch((error) => {
      console.trace(error);
    });
}

async function deleteChamadoMongo(userEmail, chamado) {
  const res_delete = await schemaSupport.find({
    useremail: userEmail,
    chamado: chamado,
  });

  if (res_delete) {
    return schemaSupport
      .updateOne(
        { _id: res_delete[0]._id },
        {
          deletado: 1,
        }
      )
      .then(() => {
        return 1;
      });
  }
}

module.exports = {
  mongoConnectionCheck,
  saveSocketMsgMongo,
  getChatMongo,
  getChatMongoTeste,
  deleteChamadoMongo,
};
