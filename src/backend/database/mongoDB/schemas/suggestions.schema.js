const mongoose = require("mongoose");

module.exports = {
  suggestionEtiquetaSchema: mongoose.model(
    "suggestions_etiquetas",
    {
      id_escritorio: {
        type: String,
        required: true,
      },
      nome_etiqueta: {
        type: String,
        required: true,
      },
      cor: {
        type: String,
        required: true,
      },

      created_at: {
        type: String,
        required: true,
      },
    },
    "suggestions_etiquetas"
  ),
};
