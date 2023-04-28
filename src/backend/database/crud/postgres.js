const { knexPostgre } = require("../../database/knex");

//Used for tests, it can be change
module.exports = {
  async select(table, schema, columns) {
    /**
     * @param columns String : 'name', 'email' : Default : '*'
     * @param schema String : default 'dbo'
     * @param data Object
     */

    schema ? (schema = schema) : (schema = "dbo");
    columns ? (columns = columns) : (columns = "*");

    return await knexPostgre
      .from(table)
      .withSchema(schema)
      .select("cnpj")
      .limit(1)
      .then((rows) => {
        return rows;
      })
      .catch((error) => {
        console.log("APP --> Postgre CRUD select ❌", error.code);
        return error.message;
      });
  },

  async insert(table, schema, data) {
    /**
     * @param table String
     * @param schema String : default 'dbo'
     * @param data Object : {'columnName': "value"}
     */
    schema ? (schema = schema) : (schema = "dbo");

    return await knexPostgre
    .from(table)
    .withSchema(schema)
    .insert(data)
    .then((rows) => {
      return rows;
    })
    .catch((error) => {
      console.log("APP --> Postgre CRUD insert ❌", error.code);
      return error.message;
    });

  },

  async update(table, schema, data) {
    /**
     * @param table String
     * @param schema String : default 'dbo'
     * @param data Object
     */
    schema ? (schema = schema) : (schema = "dbo");

    return await knexPostgre
    .from(table)
    .withSchema(schema)
    .insert(data)
    .then((rows) => {
      return rows;
    })
    .catch((error) => {
      console.log("APP --> Postgre CRUD update ❌", error.code);
      return error.message;
    });

  },



  async delete(table, schema, columnName, columnMatch) {
    /**
     * @param table String
     * @param schema String : default 'dbo'
     * @param columnName  : 'columnName'
     * @param columnMatch : String || boolean : 'JaneDoe' || true
     */
    schema ? (schema = schema) : (schema = "dbo");

    return await knexPostgre
    .from(table)
    .withSchema(schema)
    .where(columnName, columnMatch)
    .del()
    .then((rows) => {
      return rows;
    })
    .catch((error) => {
      console.log("APP --> Postgre CRUD delete ❌", error.code);
      return error.message;
    });

  },
};
