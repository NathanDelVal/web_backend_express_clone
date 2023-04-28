//----------------------------AWS S3------------------------------------------------------

const s3 = require("./index");

var params = {
  Bucket: "aws-s3-ged",
  Delimiter: "/",
  Prefix: "1/A. DO NASCIMENTO ARAUJO/",
};

//Listar arquivos
const listObjects = async (params) => {
  /*
    var params = {
        Bucket: 'aws-s3-ged',
        Delimiter: '/',
        Prefix: '1/A. DO NASCIMENTO ARAUJO/'
    }
    */
  return await s3.listObjects(params, function (error, data) {
    if (error) {
      //console.log(error);
      return error;
    }
    //console.log(data);
    return data;
  });
};

//Listar Buckets
const listBuckets = async () => {
  return await s3.listBuckets(function (error, data) {
    if (error) {
      //console.log("Error", error);
      return error;
    }
    //console.log("Success", data.Buckets);
    return data.Buckets;
  });
};

module.exports = {  listObjects, listBuckets  };
