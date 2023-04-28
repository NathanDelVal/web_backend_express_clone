const moment = require('moment');
const { knexPostgre } = require("../../../../database/knex");

const { countTipoAntecipadoWhereLike, countTipoAntecipadoWhereInit } = require("../../Controllers/countTributacoes")

//const Queue = require('../../queue/lib/Queue');
const {redisClient} = require('../../../../database/redis')

const axios = require('axios');
const qs = require('qs');

module.exports = {
    async renderPage(req, res) {

        var { usuario, administrador, root, nome_fantasia, suporte } = req.session.userData

        if (root == "SIM") {
            try {
                //"./_escritorio/_InternalUser/aprovar-itens"
                res.render("./_escritorio/_InternalUser/aprovar-itens", {
                    usuario,
                    nome_fantasia,
                    administrador,
                    root,
                    suporte,
                });
            } catch (error) {
                res.status(500);
                console.log("APP ===>", error);
            }
        } else {
            res.redirect("/acesso");
            //return res.send("Acesso Negado")
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
                    //.whereNotNull("pendente")
                    //POSTGRE//.whereNot({ 'pendente': 'NULL' }) POSTGRE
                    //.andWhere("nome_fantasia", nome_fantasia) //traz somente do escritorio do usuário (quando descomentado)
                    .then((rows) => {
                        aprovados = parseInt(rows[0].nAprovados);
                        //CONTADOR DE QUANTOS FALTAM
                        knexPostgre("produtos_tbl_view").withSchema('dbo')
                            .count("id_produto", { as: "nFaltam" })
                            .whereNull("pendente")
                            //POSTGRE//.where({ 'pendente': NULL }) POSTGRE
                            //.andWhere("nome_fantasia", nome_fantasia) //traz somente do escritorio do usuário (quando descomentado)
                            .then(async (rows) => {
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
                                await knexPostgre("produtos_tbl_view").withSchema('dbo')
                                    .distinct(
                                        "id_item",
                                        "descricao_item",
                                        "ncm",
                                        "mva_4",
                                        "mva_7",
                                        "mva_12",
                                        "cest",
                                        "tipo_antecipado",
                                        "cst_icms",
                                        "csosn_icms",
                                        "cst_piscofins_entrada",
                                        "cst_piscofins_saida",
                                        "red_bc_icms_sai_pa",
                                        "red_bc_icms_sai_fora_pa",
                                        "natureza_receita_monofasico_aliqzero"
                                    )
                                    .whereNull("pendente")
                                    //.whereNotNull("cst_piscofins_saida") //just4test
                                    //.orderBy("data_emissao", "DESC")
                                    .limit(2500)
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
                                        console.log("AprovarItensController, linha 110 ", error);
                                        return res.send().status(500);

                                    });


                            })
                            .catch((error) => {
                                console.log("AprovarItensController, linha 118 ", error);
                                return res.send().status(500);


                            });
                    })
                    .catch((error) => {
                        console.log("AprovarItensController, linha 125 ", error);
                        return res.send().status(500);


                    });
            } catch (error) {
                console.log("AprovarItensController, linha 132 ", error);
                return res.send({
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
        var { usuario, administrador, root, nome_fantasia, id_escritorio, suporte } = req.session.userData
        var itembuscado = req.body.buscadoaprovaritens;
        var aprovarRadios = req.body.aprovarRadios;
        var countTiposAntecipados = null

        if (root == "SIM") {
            if (aprovarRadios == "inicia") {

                try {
                    countTiposAntecipados = await countTipoAntecipadoWhereInit(itembuscado)

                    //CONTADOR----------------------------------------------------------------------------------------
                    var faltamaprovar = "";
                    var aprovados = "";
                    var totalitens = "";
                    var dataTable = [];

                    knexPostgre("produtos_tbl_view").withSchema('dbo')
                        .count("id_produto", { as: "nAprovados" })
                        .whereNotNull("pendente")
                        .then((rows) => {
                            aprovados = rows[0].nAprovados;
                            //CONTADOR DE QUANTOS FALTAM
                            knexPostgre("produtos_tbl_view").withSchema('dbo')
                                .count("id_produto", { as: "nFaltam" })
                                .whereNull("pendente")
                                .then((rows) => {
                                    faltamaprovar = rows[0].nFaltam;
                                    //CONTADOR DE QUANTOS ITENS BUSCADO O BANCO POSSUI---------------------------------------------------
                                    knexPostgre("produtos_tbl_view").withSchema('dbo')
                                        .count("id_produto", { as: "nBuscado" })
                                        .whereNull("pendente")
                                        .andWhere(function () {
                                            this.whereRaw(`unaccent(descricao_item) LIKE ?`,
                                                [`${itembuscado.toLowerCase()}%`])
                                                .orWhere("ncm", "like", itembuscado + "%");
                                        })
                                        .then(async (rows) => {
                                            var quantositens = rows[0].nBuscado;
                                            //BUSCA DOS ITENS INICIA COM PALAVRA BUSCADA------------------------------------------------------------------------------------
                                            await knexPostgre("produtos_tbl_view").withSchema('dbo')
                                                .distinct(
                                                    "id_item",
                                                    "descricao_item",
                                                    "ncm",
                                                    "mva_4",
                                                    "mva_7",
                                                    "mva_12",
                                                    "cest",
                                                    "tipo_antecipado",
                                                    "cst_icms",
                                                    "csosn_icms",
                                                    "cst_piscofins_saida",
                                                    "cst_piscofins_entrada",
                                                    "red_bc_icms_sai_pa",
                                                    "red_bc_icms_sai_fora_pa",
                                                    "natureza_receita_monofasico_aliqzero",
                                                )
                                                .whereNull("pendente") //pendente descomentado 03/06/2021
                                                .andWhere(function () {
                                                    this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`,
                                                        [`${itembuscado}%`])  //(case sensitive. solve with unaccent())
                                                        .orWhere("ncm", "like", itembuscado + "%");
                                                })
                                                .limit(2500)
                                                .then((rows) => {
                                                    dataTable = JSON.stringify(rows);
                                                    if (dataTable.length != 0) {
                                                        return res.send({
                                                            dataTable,
                                                            quantositens,
                                                            itembuscado,
                                                            aprovados,
                                                            faltamaprovar,
                                                            totalitens,
                                                            countTiposAntecipados
                                                        });
                                                    } else {
                                                        return res.send({
                                                            dataTable,
                                                            quantositens,
                                                            itembuscado,
                                                            aprovados,
                                                            faltamaprovar,
                                                            totalitens,
                                                            countTiposAntecipados
                                                        });
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.log("APP ===>", error);
                                                    res.status(500);
                                                    return
                                                });

                                        })
                                        .catch((error) => {
                                            console.log("APP ===>", error);
                                            return res.status(500);

                                        });
                                })
                                .catch((error) => {
                                    console.log("APP ===>", error);
                                    return res.status(500);

                                });
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            return res.status(500);

                        });
                    //---------------------------------------------------------------------------------------------------
                } catch (error) {
                    console.log("APP ===>", error);
                    return res.status(500).send({
                        dataTable,
                        quantositens,
                        itembuscado,
                        aprovados,
                        faltamaprovar,
                        totalitens,
                    });

                }
                //TRY CATCH
            }

            if (aprovarRadios == "contem") {
                try {

                    countTiposAntecipados = await countTipoAntecipadoWhereLike(itembuscado)

                    //CONTADOR----------------------------------------------------------------------------------------
                    var faltamaprovar = "";
                    var aprovados = "";
                    var totalitens = "";
                    //CONTADOR DE APROVADOS
                    knexPostgre("produtos_tbl_view").withSchema('dbo')
                        .count("id_produto", { as: "nAprovados" })
                        .whereNotNull("pendente")
                        .then((rows) => {
                            aprovados = JSON.stringify(rows[0].nAprovados);
                            //CONTADOR DE QUANTOS FALTAM
                            knexPostgre("produtos_tbl_view").withSchema('dbo')
                                .count("id_produto", { as: "nFaltam" })
                                .whereNull("pendente")
                                .then((rows) => {
                                    faltamaprovar = rows[0].nFaltam;
                                    //CONTADOR DE TOTAL
                                    if (
                                        aprovados != "" &&
                                        aprovados != undefined &&
                                        faltamaprovar != "" &&
                                        faltamaprovar != undefined
                                    ) {
                                        totalitens = aprovados + faltamaprovar;
                                    } else {
                                        totalitens = "Erro";
                                    }
                                    //VERIFICAÇÃO FINAL DAS VARIÁVEIS
                                    if (
                                        faltamaprovar == undefined ||
                                        faltamaprovar == "" ||
                                        faltamaprovar == " "
                                    ) {
                                        faltamaprovar = "Erro";
                                    }
                                    if (
                                        aprovados == undefined ||
                                        aprovados == "" ||
                                        aprovados == " "
                                    ) {
                                        aprovados = "Erro";
                                    }
                                    //CONTADOR DE QUANTOS ITENS BUSCADO O BANCO POSSUI---------------------------------------------------
                                    knexPostgre("produtos_tbl_view").withSchema('dbo')
                                        .count("id_produto", { as: "nBuscado" })
                                        .whereNull("pendente")
                                        .andWhere(function () {
                                            this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`, [`%${itembuscado}%`])
                                                .orWhere(
                                                    function () {
                                                        this.whereRaw(`unaccent(ncm) ILIKE unaccent(?)`, [`%${itembuscado}%`])
                                                    })
                                        })
                                        .then((rows) => {
                                            var quantositens = rows[0].nBuscado;
                                            //BUSCA DOS ITENS INICIA COM PALAVRA BUSCADA------------------------------------------------------------------------------------
                                            knexPostgre("produtos_tbl_view").withSchema('dbo')
                                                .distinct(
                                                    "id_item"
                                                    , "descricao_item"
                                                    , "ncm"
                                                    , "mva_4"
                                                    , "mva_7"
                                                    , "mva_12"
                                                    , "cest"
                                                    , "tipo_antecipado"
                                                    , "cst_icms"
                                                    , "csosn_icms"
                                                    , "cst_piscofins_entrada"
                                                    , "cst_piscofins_saida"
                                                    , "red_bc_icms_sai_pa"
                                                    , "red_bc_icms_sai_fora_pa"
                                                    , "natureza_receita_monofasico_aliqzero"
                                                    // ,"data_emissao"
                                                )
                                                .whereNull("pendente") //pendente descomentado 03/06/2021
                                                .andWhere(function () {
                                                    this.whereRaw(`unaccent(descricao_item) ILIKE unaccent(?)`, [`%${itembuscado}%`]) //Postgre (case sensitive) Solved with unaccent()
                                                        .orWhere("ncm", "like", `%${itembuscado}%`);
                                                })
                                                .limit(2500)
                                                .then((rows) => {
                                                    var dataTable = JSON.stringify(rows);
                                                    if (dataTable.length != 0) {
                                                        return res.send({
                                                            dataTable,
                                                            quantositens,
                                                            itembuscado,
                                                            aprovados,
                                                            faltamaprovar,
                                                            totalitens,
                                                            countTiposAntecipados
                                                        });
                                                    } else {
                                                        return res.send({
                                                            dataTable,
                                                            quantositens,
                                                            itembuscado,
                                                            aprovados,
                                                            faltamaprovar,
                                                            totalitens,
                                                            countTiposAntecipados
                                                        });
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.log("APP ===>", error);
                                                    return res.status(500);

                                                });
                                        })
                                        .catch((error) => {
                                            console.log("APP ===>", error);
                                            return res.status(500);

                                        });
                                })
                                .catch((error) => {
                                    console.log("APP ===>", error);
                                    return res.status(500);
                                });
                        })
                        .catch((error) => {
                            console.log("APP ===>", error);
                            return res.status(500);

                        });
                } catch (error) {
                    console.log("APP ===>", error);
                    return res.status(500);

                }
            }
        } else {
            return res.status(403).send("Você não possui as permissões necessárias");
        }
    },

    /* completo */
    async updatePendente(req, res) {
        var { usuario, nome_fantasia, administrador, root } = req.session.userData;
        let flag0_pendente = 0;
        let flag1_pendente = 1;
        console.log(req.body)
        if (root) {
            var { id_item_selecionados,
                nt_saida_reducao_base_pa,
                nt_saida_reducao_base_fora_pa,
                mva4,
                mva7,
                mva12,
                tipoantecipado,
                cst_icms,
                csosn,
                cst_piscofins_entrada,
                cst_piscofins_saida,
                natureza } = req.body;

            if (id_item_selecionados) {

                if (!Array.isArray(id_item_selecionados)) {
                    id_item_selecionados = id_item_selecionados.split(",");
                }

                try {
                    var objItens = {}
                    objItens.pendente = 1;
                    if (usuario) { objItens.modified_by = usuario; }
                    if (nt_saida_reducao_base_pa) { objItens.red_bc_icms_sai_pa = nt_saida_reducao_base_pa.replace(/\s/g, ''); }                    //novos added 16/11/21
                    if (nt_saida_reducao_base_fora_pa) { objItens.red_bc_icms_sai_fora_pa = nt_saida_reducao_base_fora_pa.replace(/\s/g, ''); }     //novos added 16/11/21
                    if (mva4) { objItens.mva_4 = mva4.replace(/\s/g, ''); }                                             //novos added 20/10/21
                    if (mva7) { objItens.mva_7 = mva7.replace(/\s/g, ''); }
                    if (mva12) { objItens.mva_12 = mva12.replace(/\s/g, ''); }
                    if (tipoantecipado) { objItens.tipo_antecipado = tipoantecipado.replace(/\s/g, ''); }
                    if (cst_icms) { objItens.cst_icms = cst_icms.replace(/\s/g, ''); }
                    if (csosn) { objItens.csosn_icms = csosn.replace(/\s/g, ''); }
                    if (cst_piscofins_entrada) { objItens.cst_piscofins_entrada = cst_piscofins_entrada.replace(/\s/g, ''); }
                    if (cst_piscofins_saida) { objItens.cst_piscofins_saida = cst_piscofins_saida.replace(/\s/g, ''); }
                    if (natureza) {
                        objItens['natureza_receita_monofasico_aliqzero'] = natureza.replace(/\s/g, '');
                        //Se a natureza for um espaço, limpa o espaço e deixa '';
                        if (natureza == ' ') {
                            objItens.natureza_receita_monofasico_aliqzero = natureza.replace(/\s/g, '');
                        }
                        //Se a natureza for um 'X', salva no banco como 'NULL';
                        if (natureza.toLowerCase() == 'x') {
                            objItens.natureza_receita_monofasico_aliqzero = null;
                        }
                    }

                    const arrayId_Item = id_item_selecionados;

                    var arraysToEnqueue = [];
                    var count_execucoes = 0;
                    var tamanho_passo = 20;
                    var stopindex = tamanho_passo;

                    if (Object.entries(objItens).length !== 0) {

                        var queueJOBcount = 0;
                        /* fragmenta o array em arrays com o tamanho_passo */
                        for (var startindex = 0; startindex < arrayId_Item.length; startindex = (startindex + tamanho_passo)) {
                            arraysToEnqueue[count_execucoes] = arrayId_Item.slice(startindex, stopindex)
                            stopindex = stopindex + tamanho_passo
                            count_execucoes++
                        }

                         /* Novo Bull */
                        const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message;});
                        const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message;});

                        /* Novo Bull */
                        if(redis_token1 || redis_token2){
                        arraysToEnqueue.forEach(async function (sliceOf_id_item, idx) {
                            var data = { 'id_item_produtos': sliceOf_id_item, 'objItens': objItens }

                                await axios({
                                    method: 'post',
                                    url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/aprovar-itens-update`,
                                    data: {'data': data},
                                    headers: {
                                        'token1': redis_token1,
                                        'token2': redis_token2,
                                        'content-type': 'application/json'
                                    }
                                }).then(async (response) => {
                                    console.log("Novo Bull response ", response.data);
                                    return res.send("Dados atualizados!");
                                }).catch(async (error) => {
                                    console.log("Novo Bull error ", error);
                                    return res.send("Erro ao gravar dados!");
                                    //return res.send(error.message).status(500);
                                });
                            queueJOBcount++
                            if (arraysToEnqueue.length == queueJOBcount) {
                                return res.send("Dados atualizados!");
                            }
                        })
                    }else{
                        console.log("Novo Bull Erro ao obter tokens!");
                        return res.send("Erro ao obter tokens!");
                        //return res.status(500).send("Erro ao obter tokens!");
                    }
                    } else {
                        return res.send("Erro ao gravar dados!");
                        //res.status(500);
                        //res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador });
                    }

                } catch (error) {
                    return res.status(500).res.render("./_escritorio/_InternalUser/aprovar-itens", { administrador, root });
                }
            } else {
                return res.send("Erro ao gravar dados!");
            }
        } else {
            return res.send("Você não possui as permissões necessárias!");
        }
    },

    async aprovarPendente(req, res) {
        var { id_login, usuario, nome_fantasia } = req.session.userData;
        var { id_item_selecionados, validar_pendente } = req.body;
        var flag0_pendente = 0;
        var arraysToEnqueue = [];
        var count_execucoes = 0;
        var tamanho_passo = 20;
        var stopindex = tamanho_passo;
        var PGQueryesExecutadas = 0;
        //console.log("aprovarPendente req body: ", req.body)
        if (id_item_selecionados && validar_pendente) {

            if (!Array.isArray(id_item_selecionados)) {
                id_item_selecionados = id_item_selecionados.split(",");
            }

            var arrayId_Item = id_item_selecionados;

            var objItens = {}
            if (usuario) {
                objItens['usuario'] = usuario
            }
            objItens['pendente'] = 0 //0 = Aprovou sem alterações

            var queueJOBcount = 0;
            try {
                /* fragmenta o array da descricao de itens em 20 itens */
                for (var startindex = 0; startindex < arrayId_Item.length; startindex = (startindex + tamanho_passo)) {
                    arraysToEnqueue[count_execucoes] = arrayId_Item.slice(startindex, stopindex);
                    stopindex = stopindex + tamanho_passo;
                    count_execucoes++
                }
                 /* Novo Bull */
                const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message; });
                const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message;});

                arraysToEnqueue.forEach(async function (sliceOfArrayId_Item, idx) {
                    var data = { 'id_item_produtos': sliceOfArrayId_Item, 'objItens': objItens };

                    /* Novo Bull */
                    console.log("teste ->> ", `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/aprovar-itens`);
                    if(redis_token1 || redis_token2){
                        await axios({
                            method: 'post',
                            url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/query/aprovar-itens`,
                            data: {'data': data},
                            headers: {
                                'token1': redis_token1,
                                'token2': redis_token2,
                                'content-type': 'application/json'
                            }
                        }).then(async (response) => {
                            console.log("Novo Bull response ", response.data);
                            //return res.send(response.data).status(200);
                            return;
                        }).catch(async (error) => {
                            console.log("Novo Bull error ", error);
                            return;
                            //return res.send(error.message).status(500);
                        });

                    }else{
                        console.log("Novo Bull Erro ao obter tokens!");
                        return;
                        //return res.status(500).send("Erro ao obter tokens!");
                    }

                    queueJOBcount++

                    if (arraysToEnqueue.length == queueJOBcount) {
                        return res.send("Linhas Validadas!");
                    }
                })
            } catch (error) {
                console.log("APP ===>", error);
                return res.send().status(500);
            }

        } else {
            return res.send("Quantidade incorreta de paramentros").status(406); //406 Not Acceptable
        }

    },

};
