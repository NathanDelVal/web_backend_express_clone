const { suggestionEtiquetaSchema } = require("./schemas/suggestions.schema");
const { schemaEtiquetaNF } = require("../../workers/JOI/schemas");

async function saveNewSuggestionEtiquetaMongo(
  id_escritorio,
  nome_etiqueta,
  cor
) {
  const data = { id_escritorio, nome_etiqueta, cor };
  const { error, value } = schemaEtiquetaNF.validate(data);
  if (error) {
    return error.details[0].message;
  }
  if (!error && value) {
    const data_atual = new Date();
    const existeEtiqueta = await suggestionEtiquetaSchema.schema.findOne({
      id_escritorio: value.id_escritorio,
      nome_etiqueta: value.nome_etiqueta,
    });
    const existeExatamenteIgual = await suggestionEtiqueta.schema.findOne({
      id_escritorio: value.id_escritorio,
      nome_etiqueta: value.nome_etiqueta,
      cor: value.cor,
    });
    if (existeEtiqueta && !existeExatamenteIgual) {
      return suggestionEtiqueta.schema.updateOne(
        { _id: existeEtiqueta._id },
        { cor: value.cor }
      );
    }
    if (!existeEtiqueta) {
      return suggestionEtiqueta
        .schema({
          id_escritorio: value.id_escritorio,
          nome_etiqueta: value.nome_etiqueta,
          cor: value.cor,
          created_at: data_atual,
        })
        .save();
    }
  }
}

module.exports = {
  saveNewSuggestionEtiquetaMongo,
};
