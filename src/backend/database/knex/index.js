const NodeEnviroment = require('../../../../config');
const knexfile = require('./knexfile'); //Importa as conexões com banco definidas
//const knexSQLite = require('knex')(knexfile['sqliteTESTER']) //DESENVOLVIMENTO - (Only read)

console.log("APP --> Knex Enviroment ", NodeEnviroment.NODE_ENV );

if(NodeEnviroment.NODE_ENV == 'development'){
    const knexPostgre = require('knex')(knexfile['rds_aurora_pg']); //postgresql_out ou rds_aurora_pg
    const knexSQLite = require('knex')(knexfile['sqlite']);
    console.log("!DESENVOLVIMENTO!");
    module.exports = { knexPostgre, knexSQLite };
}

if(NodeEnviroment.NODE_ENV == 'production'){
    ///ATENÇÃO!!!!!!!!!!!!!!!!!!
    const knexPostgre = require('knex')(knexfile['rds_aurora_pg']);
    const knexSQLite = require('knex')(knexfile['sqlite']);
    console.log("!PRODUCAO!");
    module.exports = { knexPostgre, knexSQLite };
}


