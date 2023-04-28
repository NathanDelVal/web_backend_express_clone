const bcrypt = require('bcrypt');
const moment = require('moment');
const joiSchemas = require('../../../../workers/JOI/schemas');
const {knexPostgre} = require('../../../../database/knex');
const saltRounds = 10;

module.exports = {
    async renderAcessoSuporte(req, res) {
        return res.render('./Suporte/acesso')
    },

    async loginSuporte (req, res) {
            var content = "";

            try {
                var datasend = "";
                var rowsData = "";
                var rowsAffected = "";
                var result = {
                    msg: '',
                    redirect: ''
                }
                var { Email, Senha } = req.body

                const { error, value } = await joiSchemas.schemaEmail.validate({ Email, Senha });
                //MEMO IMPLEMENTAR O JOI PARA VERIFICAR SE O INPUT  DO USUARIO FOI REALMENTE UM EMAIL, CASO NÃO DEVOLVER ERRO
                if (error) {
                    //console.log("JOI ERROR: ", error)
                    result.msg = error.message
                    return res.send(result);
                }

                if (!error && value) {
                    //console.log("Joi validou")
                    const getDataLogin = async (useremail) => {
                        return await knexPostgre.from("login_tbl_view").withSchema('dbo')
                            .where({ email: useremail })
                            .andWhere({ ativo: 'SIM' })
                            .then((rows) => {
                                if (rows?.length > 0) {
                                    return rows[0]
                                }
                                if (rows?.length == 0) {
                                    result.msg = 'Email informado não encontra-se cadastrado ou seu escritório está inativo.'
                                    //res.send(result);
                                    return false;
                                }
                            }).catch((error) => { console.log(error); });
                    }
                    const bcryptValidade = async (data) => {

                        if (!data) return res.send(result);

                        if (data) {
                            const isMatchPassword = await bcrypt.compare(Senha, data.senha)
                            if (isMatchPassword) {
                                delete data['senha']
                                /*ARMAZENAR TOKEN*/
                                var ano = parseInt(moment(data.data_inicio).format('YYYY'))
                                var mes = parseInt(moment(data.data_inicio).format('M') + '00')
                                var dia = parseInt(moment(data.data_inicio).format('DD'))
                                var tag = data.nome_fantasia.substring(0, 2)

                                data.token = `${tag}${(ano + mes + dia)}`


                                    //if null then false                            //verificar a necessidade
                                    //temporário
                                    data.prod1 ? data.prod1 : data.prod1 = false;
                                    data.prod2 ? data.prod2 : data.prod2 = false;
                                    data.prod3 ? data.prod3 : data.prod3 = false;
                                    data.prod4 ? data.prod4 : data.prod4 = false;
                                    data.prod5 ? data.prod5 : data.prod5 = false;

                                    //-------------------------------------------


                                    //Colocando o Ip do Cliente na sessão
                                    var clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                                    data.ip = clientIp.replace('::ffff:', '');

                                    //Atribuido dados do cliente à sessão
                                    req.session.userData = data

                                    if (data.suporte === "TI" || data.suporte === "TRIBUTACAO") {
                                        result.redirect = "/suporte/suporte-chamados";
                                        return res.send(result);
                                        //res.redirect("/suporte/suporte-chamados");
                                    }

                                    if (data.suporte === "ADMINISTRATIVO") {
                                        result.redirect = "/suporte/escritorios";
                                        return res.send(result);
                                        //res.redirect("suporte/escritorios");
                                    }                                         //SESSION AUX
                                    result.redirect = "/menu/apps";
                                    return res.send(result);



                            } else {
                                if (result.msg != 'Email informado não encontra-se cadastrado ou seu escritório está inativo.') { result.msg = "Credênciais inválidas!"; }
                                return res.send(result);
                            }
                        }

                    }
                    bcryptValidade(await getDataLogin(Email))
                }
            } catch (error) {
                console.log(error)
                //result.msg = "Credênciais inválidas!";
                //res.send(result);
            }

    },
}
