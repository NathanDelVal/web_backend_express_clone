exports.up = knex => knex.schema.createTable('mva_tbl_knex', table =>{
    table.increments('id').unique().notNullable()

    table.string('cest', [50])
    table.string('ncm', [50])
    table.string('mva_7', [50])
    table.string('mva_12', [50])
    table.string('tipo_antecipado', [50])
    table.string('descricao', [255])

    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

});

exports.down = knex => knex.schema.dropTable('mva_tbl_knex');

