const axios = require('axios');
const { knexPostgre } = require("../../../../database/knex");
const { countTipoAntecipadoWhereLike, countTipoAntecipadoWhereInit, countTipoAntecipadoWhereLikeByNumeroNota } = require("../../Controllers/countTributacoes")
const { schemaCorrigirAprovadosUpdateSingle } = require('../../../../workers/JOI/schemas');
const {redisClient} = require('../../../../database/redis');

const flag_pendente_aprovado = 1; //1 = produto aprovado

const verifCommaInputRed = function (input) {
    input = input.replace(/\s/g, '')
    if (input == ',' && input.length == 1) {
        input = input.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }
    return input;
}


module.exports = {
    async renderPage(req, res) {

        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData

        if (root == "SIM") {
            try {
                //"./_escritorio/_InternalUser/corrigir-aprovados"
                return res.render("./_escritorio/_InternalUser/corrigir-aprovados", {
                    usuario,
                    nome_fantasia,
                    administrador,
                    root,
                    suporte,
                });
            } catch (error) {
                console.log("APP ===>", error);
                return res.status(500);
            }
        } else {
            return res.redirect("/acesso");
        }
    },

    async requestCreate(req, res) {
        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData

        if (root == "SIM") {
            var dataTable = "";
            try {
                //CONTADOR----------------------------------------------------------------------------------------
                var faltamaprovar = "";
                var aprovados = "";
                var totalitens = "";

                //CONTADOR DE APROVADOS
                knexPostgre("produtos_tbl_view").withSchema('dbo')
                    .count("id_produto", { as: "nAprovados" })
                    .whereNotNull("pendente")
                    .then((rows) => {
                        aprovados = parseInt(rows[0].nAprovados);
                        //CONTADOR DE QUANTOS FALTAM
                        knexPostgre("produtos_tbl_view").withSchema('dbo')
                            .count("id_produto", { as: "nFaltam" })
                            .whereNull("pendente")
                            .then((rows) => {
                                faltamaprovar = parseInt(rows[0].nFaltam);
                                //CONTADOR DE TOTAL
                                totalitens = aprovados + faltamaprovar;
                                if (!faltamaprovar) {
                                    faltamaprovar = "Erro";
                                }
                                if (!aprovados) {
                                    aprovados = "Erro";
                                }
                                if (!totalitens) {
                                    totalitens = "Erro";
                                }
                                knexPostgre("produtos_tbl_view").withSchema('dbo')
                                    .distinct("id_item",
                                        "descricao_item",
                                        "ncm",
                                        "mva_4",
                                        "mva_7",
                                        "mva_12",
                                        "tipo_antecipado",
                                        "cst_icms",
                                        "csosn_icms",
                                        "cst_piscofins_entrada",
                                        "cst_piscofins_saida",
                                        "red_bc_icms_sai_pa",
                                        "red_bc_icms_sai_fora_pa",
                                        "natureza_receita_monofasico_aliqzero")
                                    .whereNull("pendente")
                                    .limit(5000)
                                    .then((rows) => {
                                        var dataTable = JSON.stringify(rows);

                                        if (dataTable.length != 0) {
                                            return res.send({
                                                dataTable,
                                                aprovados,
                                                faltamaprovar,
                                                totalitens,
                                            });
                                        } else {
                                            return res.send({
                                                dataTable,
                                                aprovados,
                                                faltamaprovar,
                                                totalitens,
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);

                                    });


                            })
                            .catch((error) => {
                                console.log(error);

                            });
                    })
                    .catch((error) => {
                        console.log(error);

                    });
            } catch (error) {
                console.log("APP --->", error);
                return res.status(500).send({
                    dataTable,
                    aprovados,
                    faltamaprovar,
                    totalitens,
                });
            }
        } else {
            return res.redirect("/acesso");
        }
    },

    async requestSearch(req, res) {
        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData
        var countTiposAntecipados = null;
        var itembuscado = req.body.buscado_corrigir_aprovados_itens;
        var corrigirRadios = req.body.corrigirRadios;
        //INPUTS BUTTONS - FILTRO
        var { input_filtro_mva4, input_filtro_mva7, input_filtro_mva12, input_filtro_tipoantecipado, input_filtro_cest, input_filtro_cst_icms, input_filtro_csosn, input_filtro_cst_piscofins_entrada, input_filtro_reducao_base_saida_pa, input_filtro_reducao_base_saida_fora_pa, input_filtro_cst_piscofins_saida, input_filtro_natureza } = req.body
        //RADIOS BUTTONS - FILTRO
        var { radio_filtro_mva4, radio_filtro_mva7, radio_filtro_mva12, radio_filtro_tipoant, radio_filtro_cest, radio_filtro_csticms, radio_filtro_csosnicms, radio_filtro_piscofent, radio_filtro_reducao_base_saida_pa, radio_filtro_reducao_base_saida_fora_pa, radio_filtro_piscofsai, radio_filtro_natureza } = req.body
        //console.log("Busca corrigir aprovados:", req.body)
        var QUERY = knexPostgre("produtos_tbl_view").withSchema('dbo')
            .distinct("id_item", "descricao_item", "ncm", "mva_4", "mva_7", "mva_12", "tipo_antecipado", "cest", "cst_icms", "csosn_icms", "cst_piscofins_saida", "cst_piscofins_entrada", "red_bc_icms_sai_pa", "red_bc_icms_sai_fora_pa", "natureza_receita_monofasico_aliqzero")

        /*__FILTRO__*/
        if (input_filtro_mva4) {
            if (radio_filtro_mva4 == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('mva_4', input_filtro_mva4)
                        .orWhere(function () {
                            this.whereNull('mva_4')
                        })
                })

            } else if (radio_filtro_mva4 == 'igual') {
                QUERY.andWhere('mva_4', input_filtro_mva4)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('mva_4', input_filtro_mva4)
            }
        }

        if (input_filtro_mva7) {
            if (radio_filtro_mva7 == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('mva_7', input_filtro_mva7)
                        .orWhere(function () {
                            this.whereNull('mva_7')
                        })
                })
            } else if (radio_filtro_mva7 == 'igual') {
                QUERY.andWhere('mva_7', input_filtro_mva7)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('mva_7', input_filtro_mva7)
            }
        }
        if (input_filtro_mva12) {
            if (radio_filtro_mva12 == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('mva_12', input_filtro_mva12)
                        .orWhere(function () {
                            this.whereNull('mva_12')
                        })
                })
            } else if (radio_filtro_mva12 == 'igual') {
                QUERY.andWhere('mva_12', input_filtro_mva12)
            }
        }
        if (input_filtro_tipoantecipado) {
            if (radio_filtro_tipoant == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('tipo_antecipado', input_filtro_tipoantecipado)
                        .orWhere(function () {
                            this.whereNull('tipo_antecipado')
                        })
                })

            } else if (radio_filtro_tipoant == 'igual') {
                QUERY.andWhere('tipo_antecipado', input_filtro_tipoantecipado)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('tipo_antecipado', input_filtro_tipoantecipado)
            }
        }
        if (input_filtro_cest) {
            if (radio_filtro_csticms == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('cest', input_filtro_cest)
                        .orWhere(function () {
                            this.whereNull('cest')
                        })
                })
            } else if (radio_filtro_csticms == 'igual') {
                QUERY.andWhere('cest', input_filtro_cest)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('cest', input_filtro_cest)
            }
        }
        if (input_filtro_cst_icms) {
            if (radio_filtro_csticms == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('cst_icms', input_filtro_cst_icms)
                        .orWhere(function () {
                            this.whereNull('cst_icms')
                        })
                })
            } else if (radio_filtro_csticms == 'igual') {
                QUERY.andWhere('cst_icms', input_filtro_cst_icms)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('cst_icms', input_filtro_cst_icms)
            }
        }
        if (input_filtro_csosn) {
            if (radio_filtro_csosnicms == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('csosn_icms', input_filtro_csosn)
                        .orWhere(function () {
                            this.whereNull('csosn_icms')
                        })
                })

            } else if (radio_filtro_csosnicms == 'igual') {
                QUERY.andWhere('csosn_icms', input_filtro_csosn)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('csosn_icms', input_filtro_csosn)
            }
        }
        if (input_filtro_cst_piscofins_entrada) {
            if (radio_filtro_piscofent == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('cst_piscofins_entrada', input_filtro_cst_piscofins_entrada)
                        .orWhere(function () {
                            this.whereNull('cst_piscofins_entrada')
                        })
                })

            } else if (radio_filtro_piscofent == 'igual') {
                QUERY.andWhere('cst_piscofins_entrada', input_filtro_cst_piscofins_entrada)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('cst_piscofins_entrada', input_filtro_cst_piscofins_entrada)
            }
        }
        if (input_filtro_cst_piscofins_saida) {
            if (radio_filtro_piscofsai == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('cst_piscofins_saida', input_filtro_cst_piscofins_saida)
                        .orWhere(function () {
                            this.whereNull('cst_piscofins_saida')
                        })
                })

            } else if (radio_filtro_piscofsai == 'igual') {
                QUERY.andWhere('cst_piscofins_saida', input_filtro_cst_piscofins_saida)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('cst_piscofins_saida', input_filtro_cst_piscofins_saida)
            }
        }
        if (input_filtro_reducao_base_saida_pa) {
            if (radio_filtro_reducao_base_saida_pa == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('red_bc_icms_sai_pa', input_filtro_reducao_base_saida_pa)
                        .orWhere(function () {
                            this.whereNull('red_bc_icms_sai_pa')
                        })
                })
            } else if (radio_filtro_reducao_base_saida_pa == 'igual') {
                QUERY.andWhere('red_bc_icms_sai_pa', input_filtro_reducao_base_saida_pa)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('red_bc_icms_sai_pa', input_filtro_reducao_base_saida_pa)
            }
        }
        if (input_filtro_reducao_base_saida_fora_pa) {
            if (radio_filtro_reducao_base_saida_fora_pa == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('red_bc_icms_sai_fora_pa', input_filtro_reducao_base_saida_fora_pa)
                        .orWhere(function () {
                            this.whereNull('red_bc_icms_sai_fora_pa')
                        })
                })

            } else if (radio_filtro_reducao_base_saida_fora_pa == 'igual') {
                QUERY.andWhere('red_bc_icms_sai_fora_pa', input_filtro_reducao_base_saida_fora_pa)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('red_bc_icms_sai_pa', input_filtro_reducao_base_saida_fora_pa)
            }
        }
        if (input_filtro_natureza) {
            if (radio_filtro_natureza == 'diferente') {
                QUERY.andWhere(function () {
                    this.whereNot('natureza_receita_monofasico_aliqzero', input_filtro_natureza)
                        .orWhere(function () {
                            this.whereNull('natureza_receita_monofasico_aliqzero')
                        })
                })
            } else if (radio_filtro_natureza == 'igual') {
                QUERY.andWhere('natureza_receita_monofasico_aliqzero', input_filtro_natureza)
            } else {
                //caso não venha o radio, será buscado usando igualdade (ANDWHERE)
                QUERY.andWhere('natureza_receita_monofasico_aliqzero', input_filtro_natureza)
            }
        }
        /* ________ */


        if (corrigirRadios == "numero_nota") {
            try {
                countTiposAntecipados = await countTipoAntecipadoWhereLikeByNumeroNota(itembuscado)
                //CONTADOR----------------------------------------------------------------------------------------
                QUERY.andWhere("numero", itembuscado)
                    .limit(5000)
                    .then((rows) => {
                        var dataTable = JSON.stringify(rows);
                        if (dataTable.length != 0) {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        } else {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        }
                    })
                    .catch((error) => {
                        console.log(error);

                    });

            } catch (error) {

            }

        }

        if (corrigirRadios == "contem") { //feito
            try {
                countTiposAntecipados = await countTipoAntecipadoWhereLike(itembuscado)
                //CONTADOR----------------------------------------------------------------------------------------
                QUERY.andWhere(
                    function () {
                        this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`, [`%${itembuscado}%`])  //(case sensitive. solve with unaccent())
                    })
                    .limit(5000)
                    .then((rows) => {

                        var dataTable = JSON.stringify(rows);
                        if (dataTable.length != 0) {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        } else {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        }
                    })
                    .catch((error) => {
                        console.log(error);

                    });

            } catch (error) {
                console.log(error)

            }
        }

        if (corrigirRadios == "ncm_nota") {
            try {
                countTiposAntecipados = await countTipoAntecipadoWhereLike(itembuscado)
                //ncm nunca terá espaço
                //posteriormente sanitizar para evitar % !@#$ etc
                itembuscado = itembuscado.replace(/\s/g, '')
                //CONTADOR----------------------------------------------------------------------------------------
                QUERY.andWhere(
                    function () {
                        this.whereRaw(`unaccent(ncm) ILIKE unaccent(?)`, [`${itembuscado}%`])  //(case sensitive. solve with unaccent())
                    })
                    .limit(5000)
                    .then((rows) => {
                        var dataTable = JSON.stringify(rows);
                        if (dataTable.length != 0) {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        } else {
                            return res.send({
                                dataTable,
                                countTiposAntecipados
                            });
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error)

            }

        }


    },

    async updateSingle(req, res) {
        const { usuario, nome_fantasia, id_escritorio, administrador } = req.session.userData;
        var { id_produto, descricao_produtos, mva_4, mva_7, mva_12, tipoantecipado, cst_icms, csosn_icms, cst_piscofins_entrada, nt_saida_reducao_base_pa, nt_saida_reducao_base_fora_pa, cst_piscofins_saida, natureza } = req.body;
        //adicionar o JOI para substituir o if grande de baixo xing JOI
        const { error, value } = schemaCorrigirAprovadosUpdateSingle.validate(req.body);

        if (error) {
            console.log('Joi error!', error);
            return res.status(400).send(error.details[0].message);
        }

        if (!error && value) {
            var id_item_selecionados = [];

            if (id_produto, descricao_produtos) {
                id_item_selecionados.push(id_produto);
            }
            try {
                var objItens = {}
                objItens['modified_by'] = usuario;
                if (mva_4) {
                    objItens['mva_4'] = verifCommaInputRed(mva_4);
                }
                if (mva_7) {
                    objItens['mva_7'] = verifCommaInputRed(mva_7);
                }
                if (mva_12) {
                    objItens['mva_12'] = verifCommaInputRed(mva_12);
                }
                if (tipoantecipado) {
                    objItens['tipo_antecipado'] = verifCommaInputRed(tipoantecipado);
                }
                if (cst_icms) {
                    objItens['cst_icms'] = verifCommaInputRed(cst_icms);
                }
                if (csosn_icms) {
                    objItens['csosn_icms'] = verifCommaInputRed(csosn_icms)
                }
                if (cst_piscofins_entrada) {
                    objItens['cst_piscofins_entrada'] = verifCommaInputRed(cst_piscofins_entrada);
                }
                if (cst_piscofins_saida) {
                    objItens['cst_piscofins_saida'] = verifCommaInputRed(cst_piscofins_saida);
                }
                if (nt_saida_reducao_base_pa) {
                    objItens['red_bc_icms_sai_pa'] = verifCommaInputRed(nt_saida_reducao_base_pa);
                }
                if (nt_saida_reducao_base_fora_pa) {
                    objItens['red_bc_icms_sai_fora_pa'] = verifCommaInputRed(nt_saida_reducao_base_fora_pa);
                }
                if (natureza) {
                    objItens['natureza_receita_monofasico_aliqzero'] = natureza.replace(/\s/g, '');

                    if (natureza == ' ') {
                        objItens.natureza_receita_monofasico_aliqzero = natureza.replace(/\s/g, '');
                    }
                    if (natureza.toLowerCase() == 'x') {
                        objItens.natureza_receita_monofasico_aliqzero = null;
                    }
                }

                objItens['pendente'] = flag_pendente_aprovado;
                var data = { 'id_item_produtos': id_item_selecionados, 'objItens': objItens }
                /* Novo Bull */
                const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message;});
                const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message;});
                /* Novo Bull */
                if (redis_token1 || redis_token2) {
                    await axios({
                        method: 'post',
                        url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/corrigir-aprovados`,
                        data: { 'data': data },
                        headers: {
                            'token1': redis_token1,
                            'token2': redis_token2,
                            'content-type': 'application/json'
                        }
                    }).then(async (response) => {
                        console.log("Effie response ", response.data);
                        return res.send("Dados atualizados!");
                    }).catch(async (error) => {
                        console.log("Effie error ", error);
                        return res.send("Erro ao gravar dados!");
                        //return res.send(error.message).status(500);
                    });

                } else {
                    console.log("Effie Erro ao obter tokens!");
                    return res.send("Erro ao obter tokens!");
                    //return res.status(500).send("Erro ao obter tokens!");
                }


            } catch (error) {
                return res.send().status(500);
            }

        } else {
            return res.send(error.details[0].message).status(422);
        }
    },

    async updateMulti(req, res) {
        var { usuario, nome_fantasia, administrador, root } = req.session.userData;
        var result = {
            sql: { msg: null, affectedRows: 0, erros: 'Nenhum' },
            pg: { msg: null, affectedRows: 0, erros: 'Nenhum' }
        }
        var arraysToEnqueue = [];
        var count_execucoes = 0;
        var count_tam_array = 0;
        var tamanho_passo = 20;
        var stopindex = tamanho_passo;
        if (root) {
            var { id_item_selecionados, mva_4, mva_7, mva_12, tipoantecipado, cst_icms, csosn_icms, nt_saida_reducao_base_pa, nt_saida_reducao_base_fora_pa, reducao_base_fora_pa, cst_piscofins_entrada, cst_piscofins_saida, natureza } = req.body;

            var objItens = {}

            if (usuario) {
                objItens['modified_by'] = usuario
            }
            if (mva_4) {
                objItens['mva_4'] = verifCommaInputRed(mva_4);
            }
            if (mva_7) {
                objItens['mva_7'] = verifCommaInputRed(mva_7);
            }
            if (mva_12) {
                objItens['mva_12'] = verifCommaInputRed(mva_12);
            }
            if (tipoantecipado) {
                objItens['tipo_antecipado'] = verifCommaInputRed(tipoantecipado);
            }
            if (cst_icms) {
                objItens['cst_icms'] = verifCommaInputRed(cst_icms);
            }
            if (csosn_icms) {
                objItens['csosn_icms'] = verifCommaInputRed(csosn_icms);
            }
            if (cst_piscofins_entrada) {
                objItens['cst_piscofins_entrada'] = verifCommaInputRed(cst_piscofins_entrada);
            }
            if (cst_piscofins_saida) {
                objItens['cst_piscofins_saida'] = verifCommaInputRed(cst_piscofins_saida);
            }
            if (nt_saida_reducao_base_pa) {
                objItens['red_bc_icms_sai_pa'] = verifCommaInputRed(nt_saida_reducao_base_pa);
            }
            if (nt_saida_reducao_base_pa) {
                objItens['red_bc_icms_sai_fora_pa'] = verifCommaInputRed(nt_saida_reducao_base_fora_pa);
            }
            if (natureza) {
                objItens['natureza_receita_monofasico_aliqzero'] = natureza.replace(/\s/g, '');
                //Se a natureza for um espaço, limpa o espaço e deixa '';
                if (natureza == ' ') {
                    objItens['natureza_receita_monofasico_aliqzero'] = natureza.replace(/\s/g, '');
                }
                //Se a natureza for um 'X', salva no banco como 'NULL';
                if (natureza.toLowerCase() == 'x') {
                    objItens['natureza_receita_monofasico_aliqzero'] = null;
                }
            }
            if (flag_pendente_aprovado) {
                objItens['pendente'] = flag_pendente_aprovado
            }
            const arrayIdDesc = id_item_selecionados;
            if (Object.entries(objItens).length !== 0) {
                try {
                    /* fragmenta o array de acordo com o tamanho da variável "tamanho_passo" itens */
                    for (var startindex = 0; startindex < arrayIdDesc.length; startindex = (startindex + tamanho_passo)) {
                        arraysToEnqueue[count_execucoes] = arrayIdDesc.slice(startindex, stopindex)
                        stopindex = stopindex + tamanho_passo
                        count_execucoes++
                    }
                    /* Novo Bull */
                    const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message; });
                    const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message; });

                    arraysToEnqueue.forEach(async function (sliceOfArrayIdDesc, idx) {
                        count_tam_array++
                        if (sliceOfArrayIdDesc && objItens) {
                            var data = { 'id_item_produtos': sliceOfArrayIdDesc, 'objItens': objItens }

                            try {
                                //console.log("redis_tokens ", redis_token1, redis_token2)
                                //console.log("urlsss ", `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/corrigir-aprovados`);
                                if (redis_token1 || redis_token2) {
                                    await axios({
                                        method: 'post',
                                        url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/corrigir-aprovados`,
                                        data: { 'data': data },
                                        headers: {
                                            'token1': redis_token1,
                                            'token2': redis_token2,
                                            'content-type': 'application/json'
                                        }
                                    }).then(async (response) => {
                                        console.log("Effie response ", response.data);
                                        //return res.send(response.data).status(200);
                                        return;
                                    }).catch(async (error) => {
                                        console.log("Effie error ", error);
                                        return;
                                        //return res.send(error.message).status(500);
                                    });

                                } else {
                                    console.log("Effie Erro ao obter tokens!");
                                    return;
                                    //return res.status(500).send("Erro ao obter tokens!");
                                }

                            } catch (error) {
                                console.log("APP --> ", error)
                            }
                        }
                    })
                    if (arraysToEnqueue.length == count_tam_array) {
                        return res.send("Dados atualizados!");
                    }

                } catch (error) {
                    return res.send("Erro ao gravar dados!");
                }
            } else {
                return res.send("Erro ao gravar dados!");
            }
        } else {
            return res.send("Você não possui as permissões necessárias!");
        }
    }


};
