exports.up = knex => knex.schema.createTable('notas_tbl_knex', table =>{
    table.increments('id').unique().notNullable()

    table.string('nome', [100]).notNullable()
    table.string('quantidade_itens', [50])
    table.string('inserido', [50])


    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())


});

exports.down = knex => knex.schema.dropTable('notas_tbl_knex');

