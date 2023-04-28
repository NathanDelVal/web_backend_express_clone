// Load the SDK for JavaScript
import { S3 } from "@aws-sdk/client-s3";

//Import S3 Config
var awsConfig = require("../../../config/aws");

const S3Bucket = new S3(awsConfig.s3Config);

const {
  responseForRequest,
} = require("../../../routes/helpers/responseToRequest");

async function listBucketObjects(params) {
  /**
    const params = {
          Bucket: 'aws-s3-ged',
          Delimiter: '/',
          Prefix: '1/A. DO NASCIMENTO ARAUJO/'
        }
  */
  return await S3Bucket.listObjects(params, function (error, data) {
    if (error) {
      //console.log(error);
      return error;
    }
    //console.log(data);
    return data;
  });
}

//Listar Buckets
async function listBuckets() {
  return await S3Bucket.listBuckets(function (error, data) {
    if (error) {
      console.error("Error", error.message);
      return error;
    }
    //console.log("Success", data.Buckets);
    return data.Buckets;
  });
}

//Listar arquivos

async function getObject(params) {
  /**
   * @param {Object} params
   * @param {string} params.Bucket bucket-name
   * @param {string} params.Key    file path ex: 'pasta/arquivo.txt'
   * @returns {Object} {status: Boolean, msg : String, data: Object}
   */
  try {
    console.log("getObject find params ", params);
    if (!params) {
      return `Envie os parâmetros Bucket e Key`;
    }
    const fileData = await S3Bucket.getObject(params).catch((error) => {
      console.error(error.message);
    });

    return await responseForRequest(
      "Arquivo encontrado",
      true,
      false,
      fileData
    );
  } catch (error) {
    let fileName = params.Key.split("/");
    fileName = fileName[fileName.length - 1];
    console.error("S3Bucket.getObject fileName ", fileName);
    return responseForRequest(
      `${error.message.replace("key", "file")}  \n>${fileName}`,
      false,
      true
    );
    //return `Could not retrieve file from S3: ${e.message.replace("key", "file")}`
  }
}

async function uploadFile(bucketName, fileContent, fileName, mimeType) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      //ContentType: mimeType//geralmente se acha sozinho
    };

    const data = await S3Bucket.upload(params).catch((error) => {
      console.trace(error.message);
    });
    console.log("S3 uploadFile", data);
    return data.Location;
  } catch (error) {
    console.trace("error no uploadFile() s3", error.message);
    throw new Error(error);
  }
}

module.exports = {
  S3Bucket,
  listBucketObjects,
  listBuckets,
  getObject,
  uploadFile,
};
