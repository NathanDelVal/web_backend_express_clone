const { gedFileSystemSchema } = require("./schemas/files.schema");

async function getGedFileSystem(id_escritorio) {
  return await gedFileSystemSchema
    .find({ root: id_escritorio })
    .then((data) => {
      return data;
    });
}

module.exports = {
  getGedFileSystem,
};
