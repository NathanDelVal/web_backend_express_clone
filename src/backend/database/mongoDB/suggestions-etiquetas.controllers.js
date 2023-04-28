const { schemaEtiquetaNF } = require('../../workers/JOI/schemas');
const { suggestionEtiquetaSchema } = require('./schemas/suggestions.schema')

async function saveNewSuggestionEtiquetaMongo(id_escritorio, nome_etiqueta, cor) {
  const data = { id_escritorio, nome_etiqueta, cor };
  const { error, value } = schemaEtiquetaNF.validate(data);
  if (error) {
    return error.details[0].message;
  }
  if (!error && value) {
    const data_atual = new Date();
    const existeEtiqueta = await suggestionEtiquetaSchema.findOne({
      id_escritorio: value.id_escritorio,
      nome_etiqueta: value.nome_etiqueta,
    });
    const existeExatamenteIgual = await suggestionEtiquetaSchema.findOne({
      id_escritorio: value.id_escritorio,
      nome_etiqueta: value.nome_etiqueta,
      cor: value.cor,
    });
    if (existeEtiqueta && !existeExatamenteIgual) {
      return suggestionEtiquetaSchema.updateOne(
        { _id: existeEtiqueta._id },
        { cor: value.cor }
      );
    }
    if (!existeEtiqueta) {
      return suggestionEtiqueta.schema({
        id_escritorio: value.id_escritorio,
        nome_etiqueta: value.nome_etiqueta,
        cor: value.cor,
        created_at: data_atual,
      }).save();
    }
  }
}

async function deleteNewSuggestionEtiquetaMongo(id_escritorio, nome) {
  const { error, value } = schemadeleteEtiquetaNF.validate(
    id_escritorio,
    nome
  );

  if (erro) {
    return res.send(error.message);
  }

  if (!erro && value) {
    const delete_etiqueta = await suggestionEtiquetaSchema.find({
      id_escritorio: id_escritorio,
      nome: nome,
    });

    if (delete_etiqueta) {
      return suggestionEtiqueta.schema
        .deleteOne({ _id: delete_etiqueta[0]._id })
        .then((res) => {
          return res;
        });
    } else {
      return;
    }
  }
  if (error) {
    console.trace('Erro ao validar os dados da Etiqueta com o JOI. ❌');
  }
}

async function findSuggestionsEtiquetasMongo(id_escritorio) {
  const result = await suggestionEtiquetaSchema.find({
    id_escritorio: id_escritorio,
  });

  if (result) {
    return result;
  } else {
    return false;
  }
}

async function findColorEtiquetasMongo(desc, id_escritorio) {
  const result = await suggestionEtiquetaSchema.find({
    id_escritorio: id_escritorio,
    nome_etiqueta: desc,
  });

  if (result) {
    return result;
  } else {
    return false;
  }
}

async function findAllColorEtiquetasMongo(id_escritorio) {
  var cor_json = {};

  const result = await suggestionEtiquetaSchema.find({
    id_escritorio: id_escritorio,
  });

  result.forEach(function (element, index) {
    cor_json[element.nome_etiqueta] = element.cor;
  });

  if (cor_json) {
    return cor_json;
  } else {
    return false;
  }
}

async function deleteTagMongo(id_escritorio, etiqueta) {
  const res_delete = await suggestionEtiquetaSchema.find({
    id_escritorio: id_escritorio,
    nome_etiqueta: etiqueta,
  });

  if (res_delete) {
    return suggestionEtiqueta.schema
      .deleteOne({ _id: res_delete[0]._id })
      .then(() => {
        return true;
      });
  } else {
    return false;
  }
}


module.exports ={
  saveNewSuggestionEtiquetaMongo,
  deleteNewSuggestionEtiquetaMongo,
  findSuggestionsEtiquetasMongo,
  findColorEtiquetasMongo,
  findAllColorEtiquetasMongo,
  deleteTagMongo,
}
