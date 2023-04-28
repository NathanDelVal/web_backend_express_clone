const mongoose = require("mongoose");

module.exports = {
  notasSchema: mongoose.model(
    "nome_notas_xml",
    {
      nome: {
        type: String,
        required: true,
      },
      escritorio: {
        type: String,
        required: true,
      },
      usuario: {
        type: String,
        required: true,
      },

      processada: {
        type: Number,
        default: 0,
      },

      processed_at: {
        type: Date,
        default: "",
      },

      created_at: {
        type: Date,
        default: "",
      },
    },
    "nome_notas_xml"
  ),
};
