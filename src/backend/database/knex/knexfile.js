require("dotenv").config();
const fs = require("fs");
const path = require("path");
const serviceConfig = require("../../../../config");
const SQLITEDB =
  serviceConfig.NODE_ENV !== "production" ? "CNPJ_demo.db" : "CNPJ_full.db";

var CNPJ_full_db = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "_db",
  SQLITEDB
);

module.exports = {
  sqlite: {
    client: "sqlite3",
    connection: {
      filename: CNPJ_full_db,
    },
    useNullAsDefault: true,
  },

  rds_aurora_pg: {
    client: "pg",
    connection: {
      host: process.env.RDS_AURORA_HOST,
      user: "postgres",
      password: process.env.RDS_AURORA_PASS,
      port: process.env.RDS_AURORA_PORT,
      database: process.env.RDS_AURORA_DB,
    },

    pool: {
      min: 1,
      max: 10,
      afterCreate: function (conn, done) {
        conn.query('SET TIMEZONE="America/Belem";', function (error) {
          if (error) {
            console.log("APP --> Postgres ❌");
            done(error, conn);
          } else {
            console.log("APP --> Postgres ✔️");
            conn.query("SELECT NOW()::timestamp;", function (error, result) {
              done(error, conn);
            });
          }
        });
      },
    },
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
    useNullAsDefault: true,
  },
};
