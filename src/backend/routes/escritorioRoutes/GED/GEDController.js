var fs = require("fs");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { forEach } = require("async");
const { element } = require("xml");
const { PDFDocument } = require("pdf-lib");
//const imgToPDF = require('image-to-pdf'); npm uninstall image-to-pdf
const {
  imageToPdf,
  modifyPdf,
} = require("../../helpers/ImageBufferToPDFBuffer");
const { knexPostgre } = require("../../../database/knex");
const { capitalize } = require("../../helpers/capitalize");
const { getGedFileSystem } = require("../../../database/mongoDB");
const {
  schemaControleObrigacoes,
  schemaGedLogin,
} = require("../../../workers/JOI/schemas");
const responseForRequest = require("../../helpers/responseToRequest");
const {
  ArrayObjToHierarchical,
} = require("../../helpers/ArrayObjToHierarchicalPath");

const S3aws = require("../../../APIs/AWS/S3");
//S3aws.S3_getObject()
/*
CONVERTE DATA
de:    2021-06-01T19:31:08.000Z
para: '01/06/2021'
*/
async function dateRowsAdjustments(rows) {
  return await rows.map(function (row) {
    if (row.data_upload)
      row.data_upload = moment(row.data_upload, "YYYY-MM-DD").format(
        "DD/MM/YYYY"
      );
    if (row.data_vencimento)
      row.data_vencimento = moment(row.data_vencimento, "YYYY-MM-DD").format(
        "DD/MM/YYYY"
      );
    if (row.data_de_emissao)
      row.data_de_emissao = moment(row.data_de_emissao, "YYYY-MM-DD").format(
        "DD/MM/YYYY"
      );
    return row;
  });
}

async function dateToSqlFormat(date) {
  if (date) date = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
}



async function getS3File(keyName){
  if(!keyName) {
    return null
  }
  return await S3aws.getObject({
    Bucket: "aws-s3-ged",
    Key: keyName // 1/1/DAE/2021/Fevereiro/92248978-DAE - A DO NASCIMENTO.pdf`
  }).then((file) => {
    return file;
  }).catch((error)=>{
    console.trace(error.message)
    return null
  })
}

async function getComprovante(filePath, comprovanteName){
  if (!comprovanteName) {
    return null
  }

  return await S3aws.getObject({
    Bucket: "aws-s3-ged",
    Key: `${filePath}${comprovanteName}`
  }).then((file) => {
    return file;
  }).catch((error)=>{
    console.trace(error.message)
    return null
  })
}


module.exports = {
  async renderPage(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
    } = req.session.userData;
    try {
      res.render("./_escritorio/GED/home_GED", {
        administrador,
        root,
        suporte,
        email,
        nome_fantasia,
      });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  },

  async renderPageExplorar(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
    } = req.session.userData;
    try {
      res.render("./_escritorio/GED/explorar_GED", {
        administrador,
        root,
        suporte,
        email,
        nome_fantasia,
      });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  },

  async renderAdminGED(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
    } = req.session.userData;

    try {
      res.render("./_escritorio/GED/admin_GED", {
        administrador,
        root,
        suporte,
        email,
        nome_fantasia,
      });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  },

  async renderdocGED(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
    } = req.session.userData;

    try {
      res.render("./_escritorio/GED/doc_GED", {
        administrador,
        root,
        suporte,
        email,
        nome_fantasia,
      });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  },

  async busca(req, res) {
    var {
      administrador,
      root,
      id_escritorio,
      nome_fantasia,
      suporte,
      usuario,
      email,
    } = req.session.userData;

    var { input_search } = req.body;

    //Dados da página GED:  { data: [ 'tesste', 'vitor', '2020', 'darfe' ] }
    if (input_search) {
      try {
        var knexQuery = knexPostgre
          .from("ged_tbl")
          .withSchema("dbo")
          .select(
            "id_documento",
            "natureza",
            "thumb",
            "json_path",
            "nome_do_arquivo",
            "assunto",
            "autor",
            "banco",
            "cei_caepf",
            "cnpj",
            "cpf",
            "cliente",
            "codigo_da_receita",
            "data_upload",
            "data_vencimento",
            "data_de_emissao",
            "data_upload",
            "fornecedor",
            "inscricao_estadual",
            "nome_do_declarante",
            "num_do_parcelamento",
            "numero_da_alteracao",
            "numero_da_nota",
            "quota",
            "referencia",
            "retificacao",
            "sindicato",
            "tipo_cfem",
            "tipo_cartao",
            "tipo_contribuicao",
            "tipo_dam",
            "tipo_darf",
            "tipo_das",
            "tipo_dctf",
            "tipo_dief",
            "tipo_fgts",
            "tipo_folha_pagamento",
            "tipo_funrural",
            "tipo_ibge",
            "tipo_imposto",
            "tipo_licenca",
            "tipo_livro_fiscal",
            "tipo_parcelamento",
            "tipo_rais",
            "tipo_sped",
            "tipo_sintegra",
            "valor_da_nota",
            "nire",
            "nome_funcionario",
            "nome_do_socio"
          )
          .where("id_escritorio", id_escritorio);
        input_search.forEach((valor, index) => {
          if (valor) {
            knexQuery.andWhere(function () {
              this.whereRaw(`unaccent(texto_doc) ILIKE unaccent(?)`, [
                `%${valor}%`,
              ]); //(case sensitive. solve with unaccent())
            });
            //'texto_doc', 'like', `%${valor}%`)
          }
        });

        async function getThumbFromS3(arrayRows) {
          return await Promise.all(
            arrayRows.map(async (row) => {
              if (row.json_path) {
                var S3_params = {
                  Bucket: process.env.AWS_BUCKET_GED,
                  Key: `${row.json_path.substring(1)}${row.thumb}`,
                };
                await S3aws.getObject(S3_params).then((response) => {
                  if (!response) return null;
                  if (!response.data) return null;
                  if (!response.data.Body) return null;
                  //continuar de tarde
                  row.imgbase64 = response.data.Body.toString("base64");
                });
              }
              return row;
            })
          );
        }

        res.send(
          await dateRowsAdjustments(await getThumbFromS3(await knexQuery))
        );
      } catch (error) {
        console.log(error);
        res.status(404);
      }
    }
  },



  async gedFileGED(req, res) {
    try {
      var { id_escritorio } = req.session.userData;
      var { id_documento } = req.body;

      const [queryResult] = await knexPostgre
        .select("json_path", "nome_do_arquivo", "nome_do_comprovante")
        .from("ged_tbl_view")
        .withSchema("dbo")
        .where("id_documento", id_documento)
        .andWhere("id_escritorio", id_escritorio)
        .limit(1);

        const {json_path, nome_do_arquivo}=  queryResult

      if (json_path && nome_do_arquivo) {

        const DocumentoData = await getS3File(`${queryResult.json_path.substring(1)}${queryResult.nome_do_arquivo}`)

        if (!DocumentoData) {
          return res.send("Arquivo não encontrado");
        }

        const ComprovanteDocumentoData = await getComprovante(queryResult.json_path.substring(1), queryResult.nome_do_comprovante)

        console.log("pass");

        if (!DocumentoData && !ComprovanteDocumentoData) {
          return res.send("Arquivo não encontrado");
        }

        if (queryResult.nome_do_arquivo) {
          const DocumentoExtension = queryResult.nome_do_arquivo.substring(
            queryResult.nome_do_arquivo.length - 3,
            queryResult.nome_do_arquivo.length
          );

          if (["jpeg", "jpg", "png"].includes(DocumentoExtension)) {
            console.log("DocumentoData é uma imagem ", DocumentoExtension);
            modifyPdf;
            DocumentoData.data.Body = modifyPdf(DocumentoData.data.Body);
            DocumentoData.data.Body = imageToPdf(DocumentoData.data.Body);
            console.log("virou pdf ", DocumentoData);
          } else {
            console.trace("DocumentoExtension ->", DocumentoExtension);
          }
        }

        if (queryResult.nome_do_comprovante) {
          const ComprovanteExtension =
            queryResult.nome_do_comprovante.substring(
              queryResult.nome_do_comprovante.length - 3,
              queryResult.nome_do_comprovante.length
            );

          if (["jpeg", "jpg", "png"].includes(ComprovanteExtension)) {
            console.log(
              "ComprovanteDocumentoData é uma imagem ",
              ComprovanteExtension
            );
            ComprovanteDocumentoData.data.Body = imgToPDF(
              ComprovanteDocumentoData.data.Body,
              "A4"
            );
            console.log("virou pdf ", ComprovanteDocumentoData);
          } else {
            console.log("elsee!");
          }
        }

        const pdfFiles = [];
        const hasDocumentBody = DocumentoData?.data?.Body || false;
        if (hasDocumentBody) {
          pdfFiles.push(DocumentoData.data.Body);
          console.log("pdfFiles:>>", pdfFiles);

          const mergedPdf = await PDFDocument.create();

          for (const pdfBytes of pdfFiles) {
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(
              pdf,
              pdf.getPageIndices()
            );
            copiedPages.forEach((page) => {
              mergedPdf.addPage(page);
            });
          }

          const buf = await mergedPdf?.save();
          console.log("!!!! mergedPdf !!!! ", buf);
          DocumentoData.data.Body = new Buffer.from(buf.buffer);
          console.log("DocumentoData.Body ", DocumentoData);
          var response = DocumentoData;
          console.log("response.data.Body ", response);
          return res.send(response);
        }
      } else {
        res.send("Arquivo não encontrado");
      }
    } catch (error) {
      console.trace("APP ===>", error.message);
      return res.status(500);
    }
  },

  async updateDetalhes(req, res) {
    var { id_escritorio } = req.session.userData;
    var {
      natureza,
      cnpj,
      cliente,
      codigo_da_receita,
      data_upload,
      data_vencimento,
      data_de_emissao,
      data_upload,
      tipo_darf,
      status_documento,
      id_documento,
    } = req.body;

    var ItensToUpdateOBJ = {};
    /*
        //NÂO TEM COLUNO MODIFICADO
        let getdate = moment().format('YYYY-MM-DD HH:mm:ss.ms')
        if(getdate){
            ItensToUpdateOBJ.modificado = getdate
        }
             */

    if (natureza) {
      ItensToUpdateOBJ.natureza = natureza;
    }
    if (cnpj) {
      ItensToUpdateOBJ.cnpj = cnpj;
    }
    if (cliente) {
      ItensToUpdateOBJ.cliente = cliente;
    }
    if (codigo_da_receita) {
      ItensToUpdateOBJ.codigo_da_receita = codigo_da_receita;
    }
    if (data_upload) {
      ItensToUpdateOBJ.data_upload = await dateToSqlFormat(data_upload);
    }
    if (data_vencimento) {
      ItensToUpdateOBJ.data_vencimento = await dateToSqlFormat(data_vencimento);
    }
    if (data_de_emissao) {
      ItensToUpdateOBJ.data_de_emissao = await dateToSqlFormat(data_de_emissao);
    }
    if (data_upload) {
      ItensToUpdateOBJ.data_upload = await dateToSqlFormat(data_upload);
    }
    if (tipo_darf) {
      ItensToUpdateOBJ.tipo_darf = tipo_darf;
    }
    if (status_documento) {
      ItensToUpdateOBJ.status_documento = status_documento;
    }

    try {
      if (id_documento) {
        const RowDATA = await knexPostgre("ged_tbl")
          .withSchema("dbo")
          .update(ItensToUpdateOBJ)
          .where("id_escritorio", id_escritorio)
          .andWhere("id_documento", id_documento);
        if (RowDATA != 0) return res.send("Detalhe atualizado com sucesso");
        return res.send("Erro ao atualizar detalhe, tente novamente");
      }
      return res.send("Erro ao atualizar detalhe, tente novamente");
    } catch (error) {
      console.log("GEDController, linha 334", error.message);
      return res.status(500);
    }
  },

  async getDetalhesById(req, res) {
    var { id_escritorio } = req.session.userData;
    var { id_documento } = req.body;

    //console.log('dados da requisição', req.body)

    if (id_documento) {
      try {
        var query = knexPostgre
          .from("ged_tbl")
          .select(
            "id_documento",
            "natureza",
            "thumb",
            "nome_do_arquivo",
            "assunto",
            "autor",
            "banco",
            "cei_caepf",
            "cnpj",
            "cpf",
            "cliente",
            "codigo_da_receita",
            "data_upload",
            "data_vencimento",
            "data_de_emissao",
            "data_upload",
            "fornecedor",
            "inscricao_estadual",
            "nome_do_declarante",
            "num_do_parcelamento",
            "numero_da_alteracao",
            "numero_da_nota",
            "quota",
            "referencia",
            "retificacao",
            "sindicato",
            "tipo_cfem",
            "tipo_cartao",
            "tipo_contribuicao",
            "tipo_dam",
            "tipo_darf",
            "tipo_das",
            "tipo_dctf",
            "tipo_dief",
            "tipo_fgts",
            "tipo_folha_pagamento",
            "tipo_funrural",
            "tipo_ibge",
            "tipo_imposto",
            "tipo_licenca",
            "tipo_livro_fiscal",
            "tipo_parcelamento",
            "tipo_rais",
            "tipo_sped",
            "tipo_sintegra",
            "valor_da_nota",
            "nire",
            "nome_funcionario",
            "nome_do_socio"
          )
          .where("id_escritorio", id_escritorio)
          .andWhere("id_documento", id_documento);

        const queryResult = await query.then((result) => {
          return result;
        });

        if (queryResult) {
          res.send(queryResult);
        } else {
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
  },

  async downloadPDF(req, res) {
    var { id_escritorio } = req.session.userData;
    var { id_documento } = req.body;
    console.log("/download-pdf !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    try {
      //busca banco de dados
      const queryResult = await knexPostgre
        .select("path")
        .from("ged_tbl")
        .where("id_documento", id_documento)
        .andWhere("id_escritorio", id_escritorio)
        .limit(1)
        .then((result) => {
          return result[0];
        });

      if (queryResult) {
        var rootPath = global.__publicdir;
        var pdf;
        try {
          pdf = fs.readFileSync(`${rootPath}/${queryResult.path}`);
          if (pdf) {
            // convert binary data to base64 encoded string
            // pdf = Buffer.from(pdf).toString();
            res.writeHead(200, {
              "Content-Type": "application/pdf",
            });
            res.end(pdf, "binary");
          } else {
            res.status(204);
          }
        } catch (error) {
          res.status(500);
        }
      } else {
        res.status(204);
      }
    } catch (error) {
      res.status(500);
    }
  },

  async fileManager(req, res) {
    var { id_escritorio } = req.session.userData;
    try {
      /*
            var rootPath = global.__basedir
            var jsonData
            var file = (`${rootPath}/storage/ged_folder/${id_escritorio}/file_manager.json`)
            if (file) {
                fs.readFile(file, "utf8", function (error, data) {
                    if (error) {
                        return console.log("Erro ao ler arquivo");
                    }
                    jsonData = JSON.parse(data); // faz o parse para json
                    res.send(jsonData)
                });
            } else {
                console.log("Escritorio sem pasta de arquivos em ged_folder")
            }
            */

      //MongoDb

      /*  //s3
            var S3_params = {
                Bucket: process.env.AWS_BUCKET_GED,
                Key: `${id_escritorio}/file_manager.json`
            }
            S3aws.getObject(S3_params).then(response => {
                var { data } = response;
                if (!data) return res.send(response);
                if (data) {
                    response.data.Body = JSON.parse(data.Body)
                    return res.send(response)
                }

            });
 */
      const jsonHierarchical = await ArrayObjToHierarchical(
        await getGedFileSystem(id_escritorio)
      );
      return res.send({
        status: true,
        data: jsonHierarchical,
      });
    } catch (error) {
      res.status(500);
    }
  },

  async fileManagerGetDoc(req, res) {
    var { id_escritorio } = req.session.userData;
    var { documento } = req.body;

    if (documento && id_escritorio) {
      function removeNomeDoEscritorio(cellvalue) {
        if (!cellvalue) {
          // test for null or undefined
          return "";
        }
        //slice remove first element (name of escritorio) because in ged_folder the folder name is id_escritorio value
        cellvalue = String(cellvalue)
          .split("/")
          .slice(1, cellvalue.length)
          .join("/");
        return cellvalue;
      }
      documento = removeNomeDoEscritorio(documento);
      try {
        var S3_params = {
          Bucket: "aws-s3-ged",
          Key: `${id_escritorio}/${documento}`,
        };
        await S3aws.getObject(S3_params).then((response) => {
          var { data } = response;
          if (data?.Body) {
            //data.Body = data.Body
            return res.send(response); //res.writeHead(200, { 'Content-Type': 'application/pdf' }).end(pdf, 'binary');
          } else {
            return res.status(200).send(response); //Could not retrieve file from S3: The specified file does not exist.
          }
        });
      } catch (error) {
        res.status(500);
      }
    } else {
      res.status(204);
    }
  },

  async fileDetailsByName(req, res) {
    var { id_escritorio } = req.session.userData;
    var { nome_documento } = req.body;
    try {
      var aux = nome_documento.split("/");
      //verificar quais itens esse select realmente precisa, evitar usar *
      const queryResult = await knexPostgre
        .select(
          "id_documento",
          "natureza",
          "thumb",
          "nome_do_arquivo",
          "assunto",
          "autor",
          "banco",
          "cei_caepf",
          "cnpj",
          "cpf",
          "cliente",
          "codigo_da_receita",
          "data_upload",
          "data_vencimento",
          "data_de_emissao",
          "data_upload",
          "fornecedor",
          "inscricao_estadual",
          "nome_do_declarante",
          "num_do_parcelamento",
          "numero_da_alteracao",
          "numero_da_nota",
          "quota",
          "referencia",
          "retificacao",
          "sindicato",
          "tipo_cfem",
          "tipo_cartao",
          "tipo_contribuicao",
          "tipo_dam",
          "tipo_darf",
          "tipo_das",
          "tipo_dctf",
          "tipo_dief",
          "tipo_fgts",
          "tipo_folha_pagamento",
          "tipo_funrural",
          "tipo_ibge",
          "tipo_imposto",
          "tipo_licenca",
          "tipo_livro_fiscal",
          "tipo_parcelamento",
          "tipo_rais",
          "tipo_sped",
          "tipo_sintegra",
          "valor_da_nota",
          "nire",
          "nome_funcionario",
          "nome_do_socio"
        )
        .from("ged_tbl")
        .withSchema("dbo")
        .where("nome_do_arquivo", aux[5])
        .andWhere("id_escritorio", id_escritorio)
        .limit(1)
        .then(async (result) => {
          result = await dateRowsAdjustments(result);
          return result[0];
        })
        .catch((error) => {
          console.log("error ", error);
          return null;
        });

      if (queryResult) {
        try {
          res.send(queryResult);
        } catch (error) {
          console.log("error ", error);
          res.status(500);
        }
      } else {
        res.status(204);
      }
    } catch (error) {
      console.log("error ", error);
      res.status(500);
    }
  },

  async GEDControl(req, res) {
    var { id_escritorio } = req.session.userData;
    var { gedmg_regime, gedmg_status, gedmg_data_referencia } = req.body;

    const { error, value } = await schemaControleObrigacoes.validate(req.body);
    var { gedmg_mes, gedmg_ano } = "";

    if (gedmg_data_referencia) {
      gedmg_mes = moment(gedmg_data_referencia, "MM/YYYY").format("MM");
      gedmg_ano = moment(gedmg_data_referencia, "MM/YYYY").format("YYYY");
    } else {
      gedmg_mes = moment().format("MM");
      gedmg_ano = moment().format("YYYY");
    }

    if (!error && value) {
      if (id_escritorio) {
        QUERY_NOME_EMPRESAS = knexPostgre("empresas_tbl_view")
          .withSchema("dbo")
          .distinct("cliente")
          .where("id_escritorio", id_escritorio)
          .andWhere("situacao", "Ativa");
        if (gedmg_regime) {
          QUERY_NOME_EMPRESAS.andWhere("regime_tributario", gedmg_regime);
        }
        var NOME_EMPRESAS = await QUERY_NOME_EMPRESAS.then((rows) => {
          return rows;
        });

        var GED_query = knexPostgre("ged_tbl_view")
          .withSchema("dbo")
          .distinct("natureza", "cliente", "status_documento")
          .where("id_escritorio", id_escritorio)
          .andWhere("situacao", "Ativa");

        if (gedmg_status == "Pendente") {
          //GED_query.andWhereNot('status_documento', 'Pago') //verificar se a empresa possui todos os documentos como pago
          GED_query.andWhereNot("status_documento", "Enviado");
        }

        if (gedmg_status != "Pendente") {
          if (gedmg_status.length == 0) {
            //GED_query.orWhere('status_documento', 'Pago')
            //GED_query.orWhere('status_documento', 'Enviado')
            GED_query.andWhere(function () {
              this.where("status_documento", "Pago").orWhere(
                "status_documento",
                "Enviado"
              );
            });
          } else {
            GED_query.andWhere("status_documento", gedmg_status);
          }
          //
        }

        if (gedmg_mes && gedmg_ano) {
          //console.log("if 2", gedmg_mes, gedmg_ano)
          GED_query.andWhere("data_de_emissao_mes", gedmg_mes);
          GED_query.andWhere("data_de_emissao_ano", gedmg_ano);
        }
        if (gedmg_regime) {
          GED_query.andWhere("regime_tributario", gedmg_regime);
        }

        try {
          var GED_rows = await GED_query.then(async (rows) => {
            let GED_rows = rows;

            //console.log('dados do ged row', GED_rows)

            if (GED_rows) {
              for (var i = 0; i < GED_rows.length; i++) {
                //console.log('entrei aqui 1')
                for (var j = 0; j < NOME_EMPRESAS.length; j++) {
                  // console.log('entrei aqui 2')
                  if (GED_rows[i].cliente == NOME_EMPRESAS[j].cliente) {
                    if (GED_rows[i].natureza && GED_rows[i].status_documento) {
                      //console.log('entrei aqui 5', GED_rows[i].natureza, GED_rows[i].status_documento)
                      NOME_EMPRESAS[j][GED_rows[i].natureza] =
                        GED_rows[i].status_documento;
                    }
                  }
                }
              }
            }

            return GED_rows;
          });

          const deleteStatus = async (data, target) => {
            var nova_Datarows = [];
            for (var i = 0; i < data.length; i++) {
              var deleteFlag = 0;

              Object.entries(data[i]).forEach(([columnkey, columnvalue]) => {
                if (columnkey != "cliente") {
                  if (data[i][columnkey] == target) {
                    deleteFlag++;
                  }
                }
              });

              if (deleteFlag > 0) {
                //console.log("Deletando")
                //NOME_EMPRESAS.splice(i, 1);
                nova_Datarows.push(data[i]);
                //console.log("pushhhh", nova_Datarows)
              }
            }
            //console.log("affter deleteNotPendente ", nova_Datarows)
            return nova_Datarows;
          };

          const deletarTodosPagos = async (data) => {
            //console.log('data recebida', data)
            /* função nova  */
            var baseColunas = [
              "CFEM",
              "C. CONFEDERATIVA",
              "DAE",
              "DAM",
              "DARF",
              "DAS",
              "FUNRURAL",
              "GNRE",
              "HONORARIO",
              "INSS",
            ];
            var countPendente = 0;
            var novo_dado = [];

            data.forEach(function (el, index) {
              Object.entries(el).forEach(([columnkey, columnvalue]) => {
                if (baseColunas.includes(columnkey)) {
                  countPendente += 1;
                  console.log("Existem em ambos vetores.");
                }
              });

              if (countPendente != baseColunas.length) {
                //console.log('fiz o push do objeto')
                novo_dado.push(el);
              }
            });

            return novo_dado;
          };

          if (NOME_EMPRESAS) {
            if (gedmg_status && gedmg_status != "Pendente") {
              res.send(
                JSON.stringify(await deleteStatus(NOME_EMPRESAS, gedmg_status))
              );
            } else {
              res.send(JSON.stringify(await deletarTodosPagos(NOME_EMPRESAS)));
            }
          }
        } catch (error) {
          console.log(error);
          res.status(500);
        }
      } else {
        res.status(204);
      }
    } else {
      res.send(error);
    }
  },

  async filesUpload(req, res) {
    console.log("ARRIVE in filesUpload", req.body);
    var { id_escritorio, fileName } = req.body;
    //console.log("filesUpload body ", id_escritorio, fileName);
    try {
      var insertQuery = knexPostgre("ged_tbl").withSchema("dbo").insert({
        id_escritorio: id_escritorio,
        nome_do_arquivo: fileName,
        status_processamento: "aguardando_processamento",
      });

      await insertQuery
        .then((rows) => {
          //console.log("filesUpload rowsssss ", rows);
          if (!rows)
            return res
              .status(409)
              .send("Erro na inserção, informação já existe");
          //console.log("filesUpload 200!");
          return res.send("Arquivo gravado com sucesso!").status(200);
        })
        .catch((error) => {
          console.log("APP ====> filesUpload Error ", error.message);
          return res.status(500).send("Erro na inserção");
        });
    } catch (error) {
      console.log("filesUpload 500!", error);
      return res.send("Erro ao gravar o arquivo").status(500);
    }
  },

  async gedLogin(req, res) {
    console.log("gedLogin body", req.body);
    try {
      var result = {
        status: null,
        msg: "",
        redirect: "",
      };
      var { email, senha } = req.body;

      const { error, value } = await schemaGedLogin.validate({ email, senha });
      //MEMO IMPLEMENTAR O JOI PARA VERIFICAR SE O INPUT  DO USUARIO FOI REALMENTE UM EMAIL, CASO NÃO DEVOLVER ERRO
      if (error) {
        //console.log("JOI ERROR: ", error)
        result.status = false;
        result.msg = error.message;
        result.error = true;
        return res.send(result);
      }
      if (!error && value) {
        //console.log("Joi validou")
        const getDataLogin = async (useremail) => {
          return await knexPostgre
            .from("login_tbl_view")
            .withSchema("dbo")
            .where({ email: useremail })
            .andWhere({ ativo: "SIM" })
            .then((rows) => rows[0])
            .then(async (rows) => {
              if (rows) {
                result.status = true;
                result.msg = `Seja Bem-vindo ${await capitalize(rows.usuario)}`;
                result.data = rows;
                return rows;
              } else {
                result.msg =
                  "Email informado não encontra-se cadastrado ou seu escritório está inativo.";
                //res.send(result);
                return;
              }
            })
            .catch((error) => {
              console.log(error);
            });
        };
        const bcryptValidade = async (data) => {
          if (data) {
            const isMatchPassword = await bcrypt.compare(senha, data.senha);
            if (isMatchPassword) {
              delete data["senha"];
              /*ARMAZENAR TOKEN*/
              var ano = parseInt(moment(data.data_inicio).format("YYYY"));
              var mes = parseInt(moment(data.data_inicio).format("M") + "00");
              var dia = parseInt(moment(data.data_inicio).format("DD"));
              var tag = data.nome_fantasia.substring(0, 2);

              data.token = `${tag}${ano + mes + dia}`;

              if (data.ativo == "SIM") {
                //if null then false                            //verificar a necessidade
                data.prod1 ? data.prod1 : (data.prod1 = false);
                data.prod2 ? data.prod2 : (data.prod2 = false);
                data.prod3 ? data.prod3 : (data.prod3 = false);
                data.prod4 ? data.prod4 : (data.prod4 = false);

                //Colocando o Ip do Cliente na sessão
                var clientIp =
                  req.headers["x-forwarded-for"] ||
                  req.socket.remoteAddress ||
                  null;
                data.ip = clientIp.replace("::ffff:", "");

                //Atribuindo dados do cliente à sessão
                req.session.userData = data;
                result.redirect = "/menu/apps";
                return res.send(result);
              } else {
                result.msg = "Você não possui as permissões necessárias";
                return res.send(result);
              }
            } else {
              if (
                result.msg !=
                "Email informado não encontra-se cadastrado ou seu escritório está inativo."
              ) {
                result.msg = "Credênciais inválidas!";
              }
              return res.send(result);
            }
          } else {
            //Usuário não encontrado no banco
            //result.msg = "Credênciais inválidas!";
            return res.send(result);
          }
        };
        bcryptValidade(await getDataLogin(email));
      }
    } catch (error) {
      console.log(error);
      //result.msg = "Credênciais inválidas!";
      //res.send(result);
    }
  },
};

/**

const deleteDuplicated = async (data) => {
    //Delete Duplicated
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data.length; j++) {
            if (data[i].cliente == data[j].cliente) {
                if (i != j) {
                    data.splice(j, 1);
                    delete data[i]['natureza']
                    delete data[i]['status_documento']
                }
            }
        }
    }
    return data
}




const joinEquals = async (data) => {
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data.length; j++) {
                let natur = data[j].natureza
                let status_doc = data[j].status_documento
                if (natur && status_doc) {
                    if (data[i].cliente == data[j].cliente) {
                        data[i][natur] = status_doc
                    }
                }
            }
        }

        return data
    } else {
        return data
    }
}


//COM FILTRO
if (gedmg_status == 'Pendente' || gedmg_data_referencia == '') {
    res.send(JSON.stringify(await deleteNotPendente(GED_rows)))
} else if (gedmg_regime) {
    res.send(JSON.stringify(await deleteDuplicated(GED_rows)))
} else {
    //SEM FILTRO
    res.send(JSON.stringify(await deleteDuplicated(await joinEquals(GED_rows))))
}

    /*
    if (rows.length > 0) {
        var GED_existingNames = rows.map(function (row) {
            return row['cliente'];
        });
        //ADICIONA EMPRESAS DE ged_tbl QUE NAO EXISTEM NO empresas_tbl QUE ESTÃO SALVAS EM NOME_EMPRESAS
        NOME_EMPRESAS.forEach((item, index) => {
            if (!GED_existingNames[0].match(item.cliente)) {
                rows.push(item)
            }
        })
    }
*/
