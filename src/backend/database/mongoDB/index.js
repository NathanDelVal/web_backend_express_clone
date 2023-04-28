const mongoose = require("mongoose");
const { mongoConfig } = require("../../config/mongo.config");
const { initEtiquetasMongo } = require("./etiquetas.create");

async function initMongoConnection() {
  try {
    mongoose.connect(
      mongoConfig.connectionString,
      mongoConfig.options,
      function (error, conn) {
        if (conn) {
          initEtiquetasMongo();
          console.log(
            "APP --> Mongo",
            mongoose.STATES[mongoose.connection.readyState],
            "✔️"
          );
        }
      }
    );
  } catch (error) {
    console.log("APP --> Mongo ❌ ", error);
  }
}

initMongoConnection();

function mongoConnectionCheck() {
  if (mongoose.STATES[mongoose.connection.readyState] === "connected") {
    return true;
  }
  console.error(
    "APP --> Mongo ❌ ",
    mongoose.STATES[mongoose.connection.readyState]
  );
  return false;
}

module.exports = {
  mongoConnectionCheck,
};
