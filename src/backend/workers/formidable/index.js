const Formidable = require("formidable");
const fs = require("fs");
const formidable = Formidable({
  encoding: "utf-8",
  uploadDir: `${__dirname}/temp`,
  multiples: true,
});

function deleteTempFile(nameFile) {
  try {
    //fs.closeSync(`${nameFile}`);
    fs.unlinkSync(`${nameFile}`, { force: true });
  } catch (error) {
    console.log("function deleteTempFile catch: ", error.message);
    return error;
  }
}

module.exports = {
  async getStreamFiles(req) {
    try {
      const retorno = await new Promise((resolve, reject) => {
        formidable.parse(req, (error, fields, files) => {
          if (error) {
            return reject(error);
          }
          /* console.log("fields!!! ", fields)
          console.log("files!!! ", files.file[0].originalFilename) */
          //if not array, init new Array() with previous data
          if(!Array.isArray(files.file)) files.file = new Array(files.file);

          return resolve({ fields, files });
          //{ fields, files };
        });
      });

      if (retorno) {
        const { fields, files } = retorno;
        for (let i of files.file) {
          if(!i) continue;
          if (!(filepath in i)) continue;
          i.BUFFERdata = fs.readFileSync(`${i.filepath}`, {
            flag: "r",
          });
          deleteTempFile(i.filepath);
        }
        return retorno;
        //console.log("files!!! ", files.file);
      }
    } catch (error) {
      console.log('>>> error  ', error.message);
      return { status: false, error };
    }
  },


};
