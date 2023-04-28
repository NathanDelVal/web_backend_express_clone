const moment = require("moment");
const { knexPostgre } = require("../../../../database/knex");
const { redisClient } = require( '../../../../database/redis');
const VerifyBadgeSuporteMSG = require("../../../../routes/escritorioRoutes/VerifyBadgeSupporteMSG");

//colunas da tabela escritorios_tbl
///****** Script do comando SelectTopNRows de SSMS  ******/
//id, cnpj, razao_social, nome_fantasia, endereco, cep, numero, nome_responsavel, email_responsavel, telefone, erp, bi, status, data_inicio,[plano]




        module.exports = {
            async renderPage(req, res) {


                var {
                    administrador,
                    root,
                    nome_fantasia,
                    suporte,
                    email
                } = req.session.userData

                if (administrador == "SIM" || root == "SIM") {
                    try {
                        var dataTable;
                        knexPostgre("dbo.escritorios_tbl")
                            .select(
                                "id_escritorio",
                                "cnpj",
                                "razao_social",
                                "nome_fantasia",
                                "endereco",
                                "cep",
                                "numero",
                                "nome_responsavel",
                                "email_responsavel",
                                "telefone",
                                "erp",
                                "bi",
                                "status",
                                "data_inicio",
                                "plano",
                                "prod1",
                                "prod2",
                                "prod3",
                                "prod4"
                            )
                            .then((rows) => {
                                dataTable = rows;
                                VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
                                try {
                                    res.render("./Suporte/escritorios", {
                                        administrador,
                                        root,
                                        suporte,
                                        email,
                                        dataTable,
                                        nome_fantasia,
                                    });
                                    //res.send(nomepjexistente);
                                } catch (error) {
                                    console.log("erro aqui===> ", error);
                                    //res.status(500)
                                    res.render("acesso", { erro: error });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500);
                            });
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    //console.log("deu ruim")
                    res.redirect("/acesso");
                    //res.send("Você não possui as permissões necessárias!")
                }
            },

            async requestCreate(req, res) {

                var {
                    administrador,
                    root,
                    nome_fantasia,
                    suporte
                } = req.session.userData


                if (administrador == "SIM" || root == "SIM") {
                    try {
                        var dataTable;
                        knexPostgre("dbo.escritorios_tbl")
                            .select(
                                "id_escritorio",
                                "cnpj",
                                "razao_social",
                                "nome_fantasia",
                                "endereco",
                                "cep",
                                "numero",
                                "nome_responsavel",
                                "email_responsavel",
                                "telefone",
                                "erp",
                                "bi",
                                "status",
                                "data_inicio",
                                "plano",
                                "prod1",
                                "prod2",
                                "prod3",
                                "prod4"
                            )
                            .then((rows) => {
                                dataTable = JSON.stringify(rows);
                                try {
                                    res.send({
                                        dataTable
                                    });
                                    //res.send(nomepjexistente);
                                } catch (error) {
                                    res.status(500);
                                    console.log(error);
                                    res.status(500);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500);
                            });
                    } catch (error) {
                        console.log(error);
                        res.status(500);
                    }
                } else {
                    //console.log("deu ruim")
                    res.redirect("/acesso");
                    //res.send("Você não possui as permissões necessárias!")
                }

                //} //final do if
            },

            async getCountConsumoTotal(req, res) {
                //criando mês atual
                var data = moment();
                var mes = data.format('MM');
                var ano = data.format('YYYY');
                var mes_atual = ano + '-' + mes + '-' + '01';
                var { administrador, root, plano } = req.session.userData
                var { escritorio_input } = req.body
                if (escritorio_input) {
                    //console.log("qual o nome do escritório ===> teste xing", req.body.escritorio_input)
                    if (administrador == "SIM" || root == "SIM") {
                        //console.log("ADM ROOT")
                        try {
                            knexPostgre.from('dbo.escritorios_tbl')
                                .select('id_escritorio')
                                .where('nome_fantasia', escritorio_input)
                                .limit(1)
                                .then((rows) => {
                                    //console.log("essse é o  id do escritorio == ", rows)
                                    if (rows.length > 0) { //verificar se a consulta retornou algo
                                        //console.log("essse é o  id do escritorio == ", rows)
                                        escritorioID_FK = rows[0].id_escritorio
                                        knexPostgre('dbo.notas_tbl')
                                            .count('id_nota', { as: 'consumo' })
                                            .where('id_escritorio', escritorioID_FK)
                                            .then((rows) => {
                                                //dataTable = JSON.stringify(rows);
                                                var consumo_total = rows[0].consumo
        console.log("fsfsdf ")
                                                knexPostgre('dbo.notas_tbl')
                                                    .count('id_nota', { as: 'consumo' })
                                                    .where('id_escritorio', escritorioID_FK)
                                                    .andWhere('inserido', '>=', mes_atual)
                                                    .then((rows) => {
                                                        var consumo_mensal = rows[0].consumo

                                                        try {

                                                            res.send({
                                                                'consumo_total': consumo_total,
                                                                'consumo_mensal': consumo_mensal,
                                                                'plano': plano
                                                            });

                                                        } catch (error) {
                                                            console.log(error);
                                                            res.status(500);

                                                        }

                                                    }).catch((error) => {
                                                        console.log(error);
                                                    });


                                            }).catch((error) => {
                                                console.log(error)
                                            })


                                    }

                                }).catch((error) => {
                                    console.log(error)
                                })

                        } catch (error) {
                            console.log("ss")
                            console.log(error);
                        }
                    } else {
                        res.redirect("/acesso");
                    }
                } else {
                    res.status(200)
                }

            },

            async update_escritorio(req, res) {

                var {
                    administrador,
                    root,
                    nome_fantasia,
                    suporte
                } = req.session.userData

                var {
                    id_escritorio,
                    cnpj,
                    razao_social,
                    nome_fantasia,
                    endereco,
                    cep,
                    numero,
                    nome_responsavel,
                    email_responsavel,
                    telefone,
                    erp,
                    bi,
                    status,
                    data_inicio,
                    plano,
                    prod1,
                    prod2,
                    prod3,
                    prod4
                } = req.body;

                if (req.method == "POST") {
                    if (administrador == "SIM" || root == "SIM") {
                        //esse cara não vai existir

                        var obj = {}

                        if (cnpj) {
                            obj.cnpj = cnpj
                        }

                        if (razao_social) {
                            obj.razao_social = razao_social
                        }

                        if (nome_fantasia) {
                            obj.nome_fantasia = nome_fantasia
                        }

                        if (endereco) {
                            obj.endereco = endereco
                        }

                        if (cep) {
                            obj.cep = cep
                        }

                        if (numero) {
                            obj.numero = numero
                        }

                        if (nome_responsavel) {
                            obj.nome_responsavel = nome_responsavel
                        }

                        if (email_responsavel) {
                            obj.email_responsavel = email_responsavel
                        }

                        if (telefone) {
                            obj.telefone = telefone
                        }

                        if (erp) {
                            obj.erp = erp
                        }
                        if (bi) {
                            obj.bi = bi
                        }
                        if (status) {
                            obj.status = status
                        }
                        if (data_inicio) {
                            obj.data_inicio = data_inicio
                        }
                        if (plano) {
                            obj.plano = plano
                        }
                        if (prod1) {
                            obj.prod1 = prod1
                        }
                        if (prod2) {
                            obj.prod2 = prod2
                        }
                        if (prod3) {
                            obj.prod3 = prod3
                        }
                        if (prod4) {
                            obj.prod4 = prod4
                        }


                        if (Object.entries(obj).length !== 0) {
                            try {
                                knexPostgre("dbo.escritorios_tbl")
                                    .where({
                                        id_escritorio: id_escritorio,
                                    })
                                    .update(obj)
                                    .then((rows) => {
                                        rowsAffected = rows;
                                        if (rowsAffected >= 1) {
                                            //console.log("Gravei ", rowsAffected, " item(s)");
                                            res.send("Dados atualizados!");
                                        } else {
                                            console.log("Erro ao gravar Cliente(s)");
                                            res.send("Erro ao gravar novos dados!");
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(500);
                                    });
                            } catch (error) {
                                //console.log(error)
                            }

                        }

                    } else {
                        //res.redirect("/acesso")
                        res.send("Você não possui as permissões necessárias!");
                    }
                } else {
                    res.redirect("/acesso");
                    //res.send("Você não possui as permissões necessárias!")
                }
            },

            async update_escritorios_multiplos(req, res) {

                var {
                    administrador,
                    root,
                    escritorio,
                    suporte
                } = req.session.userData

                var formdados = req.body;
                //console.log(formdados)

                var form_ids = formdados.ids_multiplos;
                let arrayId = new Array();
                arrayId = form_ids.split(",");

                var {
                    plano,
                    status_mult,
                    prod1,
                    prod2,
                    prod3,
                    prod4
                } = req.body


                if (req.method == "POST") {
                    if (administrador == "SIM" || root == "SIM") {

                        var objetoUpdateMultiplos = {}

                        if (plano) {
                            objetoUpdateMultiplos.plano = plano
                        }
                        if (status_mult) {
                            objetoUpdateMultiplos.status = status_mult
                        }

                        if (prod1) {
                            objetoUpdateMultiplos.prod1 = prod1
                        }
                        if (prod2) {
                            objetoUpdateMultiplos.prod2 = prod2
                        }
                        if (prod3) {
                            objetoUpdateMultiplos.prod3 = prod3
                        }
                        if (prod4) {
                            objetoUpdateMultiplos.prod4 = prod4
                        }

                        if (Object.entries(objetoUpdateMultiplos).length !== 0) {
                            try {
                                knexPostgre("dbo.escritorios_tbl")
                                    .whereIn("id_escritorio", arrayId)
                                    .update(objetoUpdateMultiplos)
                                    .then((rows) => {
                                        //console.log("rows afetadas===", rows)
                                        if (rows > 0) {
                                            //console.log("Multiplos update ", rowsAffected, " item(s)")
                                            res.send("Dados atualizados!");
                                        } else {
                                            res.send("Erro ao gravar novos dados!");
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(500);
                                    });
                            } catch (error) {
                                console.log(error);
                            }

                        }

                    } else {
                        //res.redirect("/acesso")
                        res.send("Você não possui as permissões necessárias!");
                    }
                } else {
                    res.redirect("/acesso");
                    //res.send("Você não possui as permissões necessárias!")
                }
            },

            async insert(req, res) {
                if (req.RecResp.length > 0) {
                    res.send("Clientes inseridos com sucesso!");
                } else {
                    res.send("Erro ao inserir novos clientes. Tente Novamente!");
                }
            },

            async suggestionsEscritorio(req, res) {
                var { fetchescritorio_name } = req.body
                if (fetchescritorio_name) {
                    redisClient.get(fetchescritorio_name, function (error, res) {

                        if (error) console.log("APP --> redisClient: ", error)

                        if (res.length > 0) {
                            console.log("get entry returns : ", res, res[0].body)
                            res.send(res[0].body)

                        } else {

                            try {
                                knexPostgre
                                    .from("dbo.escritorios_tbl")
                                    .select("nome_fantasia")
                                    .where("nome_fantasia", "like", `%${fetchescritorio_name}%`)
                                    .orderBy("nome_fantasia", "ASC")
                                    .then((rows) => {
        //Caching New Data
        // redisClient.set(fetchescritorio_name, JSON.stringify(rows), 'ex', ((60*6000)* (0.5/*HORA*/)), 'type', 'text/html; charset=utf-8', function (error, res) {
                                    redisClient.set(fetchescritorio_name, JSON.stringify(rows), { expire: ((60*6000)* (0.5/*HORA*/)), type: 'text/html; charset=utf-8' }, function (error, res) {
                                        console.log("res from ioredis redisClient.set ",res)
                                             if(error)console.log("APP --> redisClient: ", error)
                                             })

                                        //console.log("like buscado == ", rows)
                                        res.send(JSON.stringify(rows))
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(500);
                                    });
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    })
                }else{
                    res.send([])
                }

            },

            async requestGraficoConsumo(req, res) {

                var id_escritorio = 1

                const dateRowsAdjustments = async (data) => {

                    var check = moment();
                    var month = check.format('MM');
                    var year = check.format('YYYY');
                    var mes_atual = year + '-' + month + '-' + '01';

                    var x = await data.map(function (new_data) {
                        new_data.inserido = moment(new_data.inserido, "YYYY-MM-DD").add(1, "days").valueOf()
                        new_data.mes_atual = moment(mes_atual, "YYYY-MM-DD").add(1, "days").valueOf();
                        return new_data
                    })
                    if (x) {
                        res.send({ x })
                    }
                }

                //tem como colocar nesse select aqui um sum(sum_notas) e por numa variavel e mandar pra pagina?
                knexPostgre.from('consumo_notas_view').withSchema('dbo')
                    .select('sum_notas', 'inserido')
                    .where({ 'id_escritorio': id_escritorio })
                    .orderBy('inserido', 'ASC')
                    .then((rows) => {
                        //console.log("nova data ======> ", row)
                        if (rows) {
                            dateRowsAdjustments(rows)
                        } else {
                            res.status(204)
                        }
                    })
            },


            async requestGraficoConsumoByEscritorio(req, res) {

                var { requested_escritorio } = req.body
                //console.log("nome do escritorio ===>", requested_escritorio)

                const dateRowsAdjustments = async (data) => {
                    var check = moment();
                    var month = check.format('MM');
                    var year = check.format('YYYY');
                    var mes_atual = year + '-' + month + '-' + '01';

                    var x = await data.map(function (new_data) {
                        new_data.inserido = moment(new_data.inserido, "YYYY-MM-DD").add(1, "days").valueOf()
                        new_data.mes_atual = moment(mes_atual, "YYYY-MM-DD").add(1, "days").valueOf();
                        return new_data
                    })
                    if (x) {
                        //console.log("EEEEEE : ", x)
                        res.send({ dataChart: x })
                    }
                }

                knexPostgre.from('consumo_notas_view').withSchema('dbo')
                    .select('sum_notas', 'inserido')
                    .where({ 'nome_fantasia': requested_escritorio })
                    .orderBy('inserido', 'ASC')
                    .then((rows) => {
                        if (rows) {
                            dateRowsAdjustments(rows)
                        } else {
                            res.status(204)
                        }
                    })
            },

};
