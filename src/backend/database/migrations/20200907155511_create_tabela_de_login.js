exports.up = knex => knex.schema.createTable('login_tbl_knex', table =>{

    table.increments('id').unique().notNullable()

    table.string('usuario', [100]).notNullable()
    table.string('senha', [50]).notNullable()
    table.string('email', [50]).notNullable()
    table.string('escritorio', [50]).notNullable()
    table.string('ativo', [50]).defaultTo('NÃO')
    table.string('administrador', [50]).defaultTo('NÃO')
    table.string('root', [50]).defaultTo('NÃO')
    table.string('suporte', [50]).defaultTo('NÃO')
    table.string('google_id', [50])
    table.string('google_fname', [50])
    table.string('google_lname', [50])
    table.string('google_picture', [255])

    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

});

exports.down = knex => knex.schema.dropTable('login_tbl_knex');

