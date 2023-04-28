
async function inserirNomeDaNota(nomedanota, escritorio, usuario) {
  nomedanota = nomedanota.trim().replace('.xml', '');

  var notaExiste = false;

  var notaNova = new notasSchema({
    nome: '',
    escritorio: '',
    usuario: '',
    processada: '',
    processed_at: '',
    created_at: '',
  });

  const res = await notasSchema.find({
    nome: nomedanota,
    escritorio: escritorio,
  });

  if (res) {
    for (let i = 0; i < res.length; i++) {
      if (res[0].nome === nomedanota && res[0].escritorio === escritorio) {
        notaExiste = true;
      }
    }
  }

  if (!notaExiste) {
    data_atual = new Date();

    notaNova = new notasSchema({
      nome: nomedanota,
      escritorio: escritorio,
      usuario: usuario,
      processada: 0,
      processed_at: '',
      created_at: data_atual,
    });
    return notaNova.save().then(() => {
      return 1;
    }); //INSERE DADOS
  } else {
    return 0;
  }
}

async function setNotaProcessada(setProcessed) {
  const res = await notasSchema.find({ nome: setProcessed });

  if (res) {
    var data_processada = new Date();

    return notasSchema
      .updateOne(
        { _id: res[0]._id },
        {
          processada: 1,
          processed_at: data_processada,
        }
      )
      .then(() => {
        return 1;
      });
  } else {
    //fazer algum tratamento aqui
  }
}

async function setNotaNaoProcessada() {
  objeto = [];
  try {
    return await notasSchema.find({ processada: 0 }).then((response) => {
      if (response) {
        for (var i = 0; i < response.length; i++) {
          objeto.push(response[i].nome);
        }

        return objeto;
      }
      return objeto;
    });
  } catch (error) {
    console.trace(error);
  }
}

module.exports ={
  inserirNomeDaNota,
  setNotaProcessada,
  setNotaNaoProcessada
}
