const { knexPostgre } = require("../knex");
const {
  saveNewSuggestionEtiquetaMongo,
} = require("./suggestions-etiquetas.controllers");

const initEtiquetasMongo = async () => {
  try {
    var ids = await knexPostgre
      .withSchema("dbo")
      .from("escritorios_tbl")
      .select("id_escritorio");
    ids?.forEach(function (escritorio, index) {
      const { id_escritorio } = escritorio;
      saveNewSuggestionEtiquetaMongo(id_escritorio, "DEVOLVIDA", "#EDCD00");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "REPROCESSAR", "#FFB22E");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "PROCESSADA", "#4287f5");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "CANCELADA", "#FF0000");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "LANÇADAS", "#33FF33");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "TIPO0", "#FF0000");
      saveNewSuggestionEtiquetaMongo(
        id_escritorio,
        "ERRO AO INSERIR NA ERP",
        "#FF0000"
      );
      saveNewSuggestionEtiquetaMongo(id_escritorio, "DESCONHECIDA", "#CCCCCC");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "NÃO IMPORTAR", "#CCCCCC");
      saveNewSuggestionEtiquetaMongo(id_escritorio, "CONTINGENCIA", "#03CFFC");
      saveNewSuggestionEtiquetaMongo(
        id_escritorio,
        "NAO AUTORIZADA",
        "#FC6203"
      );
    });
  } catch (error) {
    console.trace(error.message);
  }
};

module.exports = { initEtiquetasMongo };
