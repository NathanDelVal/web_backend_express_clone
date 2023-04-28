exports.up = knex => knex.schema.createTable('chamados_tbl_knex', table => {
    table.increments('id').unique().notNullable()

    table.string('NumeroChamado', [20]).notNullable()
    table.string('Assunto', [100]).notNullable()
    table.string('Tipo', [100]).notNullable()
    table.string('Descricao', [255]).notNullable()
    table.string('Status', [50]).notNullable()
    table.string('RespondidoPor', [50])
    table.string('Resposta', [255])
    table.string('UsuarioNome', [50]).notNullable()
    table.string('UsuarioEmail', [50]).notNullable()
    table.timestamp('Inserido', [22]).notNullable().defaultTo(knex.fn.now())
    table.timestamp('Modificado', [22]).notNullable().defaultTo(knex.fn.now())
    table.string('Prioridade', [20]).notNullable()


    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())


});

exports.down = knex => knex.schema.dropTable('chamados_tbl_knex');