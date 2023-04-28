exports.up = knex => knex.schema.createTable('empresas_tbl_knex', table =>{
    table.increments('id').unique().notNullable()

    table.string('cliente', [100]).notNullable()
    table.string('cnpj', [50])
    table.string('situacao', [50])
    table.string('regime_tributario', [50])
    table.string('unidade', [50])
    table.string('escritorio', [50])

    table.string('NomeCertificado', [50])
    table.string('SenhaCertificado', [50])
    table.string('ultNSU', [50])

    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())


});

exports.down = knex => knex.schema.dropTable('empresas_tbl_knex');

