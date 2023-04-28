var fs = require('fs');
const util = require('util');
const { knexPostgre } = require('../../../../database/knex');
const VerifyBadgeSuporteMSG = require('../../../escritorioRoutes/VerifyBadgeSupporteMSG')
const { responseForRequest } = require('../../../helpers/responseToRequest');
const emailRedirect = require('../../../../workers/email/redirect_links');
const sender = require("../../../../workers/email/senderToEffie");

//const Queue =require ('../../queue/lib/Queue');
//--------------------------------------------------[NODE MAILER]---------------------------------------------------------


module.exports = {
    async renderPage(req, res, next) {
        var {
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario,
            email,
            plano,
            token
        } = req.session.userData

        try {
            knexPostgre('dbo.login_tbl_view')
                .select('id_login', 'usuario', 'email', 'nome_fantasia', 'ativo', 'administrador', 'root')
                .where('nome_fantasia', nome_fantasia)
                .orderBy('usuario', 'asc')
                .then((rows) => {
                    var dataTable = rows;

                    //nomepjexistente = JSON.stringify(buffer);
                    VerifyBadgeSuporteMSG.SendOverbadgeSupporteMSG(email);
                    try {
                        return res.render("./_escritorio/_EndUser/usuarios", {
                            administrador,
                            root,
                            suporte,
                            email,
                            dataTable,
                            nome_fantasia,
                            plano,
                            token
                        });
                    } catch (error) {
                        return res.render("acesso", { erro: error });
                    }

                }

                ).catch((error) => {
                    console.log("APP ===>", error);
                    return res.status(500);

                });

        } catch (error) {
            console.log(error)
            return res.status(500)
        }

    },

    async requestCreate(req, res, next) {

        var {
            id_escritorio,
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData

        if (administrador == "SIM" || root == "SIM") {
            try {
                knexPostgre('dbo.login_tbl_view')
                    .select('id_login', 'usuario', 'email', 'nome_fantasia', 'ativo', 'administrador', 'root')
                    .where('id_escritorio', id_escritorio)
                    .orderBy('usuario', 'asc')
                    .then((rows) => {

                        var dataTable = JSON.stringify(rows);

                        try {
                            return res.send({
                                dataTable,
                            });
                        } catch (error) {
                            return res.render("acesso", { erro: error });
                        }

                    }).catch((error) => {
                        console.log("APP ===>", error);
                    });

            } catch (error) {
                console.log(error)
            }

        }
    },

    async updateSingle(req, res) {

        var {
            id_escritorio,
            administrador,
            root,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData


        var formdados = req.body
        var form_usuario = formdados.usuario
        var form_email = formdados.email
        var form_ativo = formdados.ativo
        var form_admin = formdados.administrador
        var form_id = formdados.id_item

        if (req.method == "POST") {

            if (administrador == "SIM" || root == "SIM") {

                if (form_usuario && form_email && form_ativo && form_admin && form_id) {
                    try {
                        knexPostgre('dbo.login_tbl')
                            .where({
                                'id_escritorio': id_escritorio,
                                'id_login': form_id,
                            })
                            .update({
                                'usuario': form_usuario,
                                'ativo': form_ativo,
                                'administrador': form_admin
                            })
                            .then((rows) => {

                                let rowsAffected = rows;
                                if (rowsAffected > 0) {
                                    return res.send("Dados atualizados!")
                                }

                            }).catch((error) => {
                                console.log("APP ===>", error);
                            });

                    } catch (error) {
                        console.log("APP ===>", error);
                    }

                } else {
                    return res.send("Erro ao atualizar dados, tente novamente.");
                }
            } else {
                return res.status(403);
            }

        } else {
            return res.status(405);
        }
    },

    async updateMulti(req, res) {

        var {
            administrador,
            root,
            id_escritorio,
            nome_fantasia,
            suporte,
            usuario
        } = req.session.userData;

        var formdados = req.body;

        var form_ativo = formdados.ativo;
        var form_admin = formdados.administrador;

        var form_ids = formdados.ids_multiplos;
        let arrayId = new Array();
        arrayId = form_ids.split(",");

        if (req.method == "POST") {

            if (administrador == "SIM" || root == "SIM") {

                if (form_ativo != undefined && form_admin != undefined && form_ids != undefined) {
                    try {
                        knexPostgre('dbo.login_tbl')
                            .whereIn('id_login', arrayId)
                            .andWhere('id_escritorio', id_escritorio)
                            .update({
                                ativo: form_ativo,
                                administrador: form_admin
                            })
                            .then((rows) => {
                                var rowsAffected = rows;
                                if (rowsAffected > 0) {
                                    //console.log("Gravei ", rowsAffected, " item(s)")
                                    return res.send("Dados atualizados!")
                                }

                            }).catch((error) => {
                                console.log("APP ===>", error);

                            });

                    } catch (error) {
                        console.log("APP ===>", error);
                    }

                }
            } else {
                return res.send("Você não possui as permissões necessárias!").status(401);
            }

        } else {
            return res.redirect("/acesso");
        }
    },



    async insertUsuario(req, res) {

        var {
            nome_fantasia,
            usuario,
            id_escritorio
        } = req.session.userData;

        var{usuario, email} = req.body;
        console.log('>>>> Req.body', req.body);

            if (!Array.isArray(usuario)) {
                if (!usuario || !email || !nome_fantasia) {
                    console.log('>>>> insertUsuario: dentro do IF!');
                    console.log()
                    return res.status(200).send(responseForRequest('Formulário Incompleto', false, true));
                }
                try {
                    console.log('insert !!!!!!');
                    knexPostgre('login_tbl').withSchema('dbo')
                            .select()
                            .where('email', email)
                            .then((rows) => {
                                console.log("rowsrows ", rows)
                            //Insere se o email for único
                                if (rows.length === 0) {
                                    knexPostgre('login_tbl').withSchema('dbo')
                                        .insert({
                                            usuario: usuario,
                                            email: email,
                                            id_escritorio: id_escritorio,
                                            ativo: "NÃO"
                                        })
                                        //.returning('id_login')
                                        //.into('dbo.login_tbl')
                                        .then(async (rows) => {
                                            console.log('>>>> insertUsuario: tirar dúvida rows', rows);
                                            if (!rows) return res.status(200).send(responseForRequest('Falha ao inserir o usuário', false, true));
                                            console.log('>>>>> rows.rowCount: ', rows.rowCount)
                                            if (rows.rowCount > 0) {
                                                console.log('>>> Derntro do IF rows.rowCount > 0')
                                            //Devemos enviar email para o usuario inserido
                                            /* const subject = "Email de Confirmação - Notas Entrada Mezzomo"
                                            const htmlPage = "validacaoCadastro.html"
                                            const reqHost = process.env.MAIL_HOST + ':' + process.env.MAIL_PORT //req.get('host');
                                            const redirectLink = `${reqHost}${reqAdress.validacaoCadastroUsuario}?email=${email}`;

                                            var data = { email, subject, htmlPage, redirectLink, req };

                                            var data = { 'email': email, 'subject': subject, 'htmlPage': htmlPage, 'redirectLink': redirectLink };
 */
                                            //const envioResp = await Queue.add('RegistrationUserMail', data );
                                            //const envioResp = await dispatchEmail(email, subject, htmlPage, redirectLink, req)
                                            var mailOptions = {
                                                subject: "Email de Confirmação - Notas Entrada Mezzomo",
                                                to: email,
                                                from: ''
                                              }
                                              const reqHost = process.env.MAIL_HOST;
                                              const htmlPage = "validacaoCadastroUsuario.html";
                                              const emailRedirectLink = `${reqHost}${emailRedirect.validacaoCadastroUsuario}?email=${email}`;
                                              console.log('>>> emailRedirect', emailRedirectLink);
                                              const effieEndPoint = '/effie/escritorio/enviar-email-confirmacao-usuario';
                                              const senderToEffie = await sender.emailReady(mailOptions, htmlPage, emailRedirectLink, effieEndPoint);

                                              if (!senderToEffie) {
                                                console.log('Não foi possivel enviar o email para o Effie ', senderToEffie);
                                                return res.status(200).send(responseForRequest('Não foi possivel enviar o email para o Effie', false, true));
                                              }
                                              return res.status(200).send(responseForRequest('Usuário inserido com sucesso!', true, false));

                                          /*   if (envioResp) {
                                                return res.send("Usuário inserido com sucesso!");
                                            } else {
                                                return res.send("Erro ao gravar novos dados!");
                                            } */


                                        }
                                        })
                                        .catch((error) => {
                                        console.log("APP ===>", error);
                                        return res.send("Erro ao gravar novos dados!");
                                    });
                            } else {
                                //return res.send("E-mail de usuário já cadastrado!");
                                return res.status(200).send(responseForRequest('E-mail de usuário já cadastrado!', false, true));

                            }
                        })
                    } catch (error) {
                        console.log("APP ===>", error);
                    }

            }
            //Multiple Insertion
            else {
                console.log("App ====> insertUsuario else ");

                var dataResp = { existem: [], inseridos: [], mensagem: [] };

                var count = 0;
                var exists = "";
                var qtdRecebidos = usuario.length;
                console.log('>>>> Usuarios', usuario);
                var usuarioEEmails = [];
                for (let i=0; i < usuario.length; i ++) {
                    usuarioEEmails.push( {"usuario": usuario[i], "email": email[i]});
                }
                console.log('>>>> ARRAY!!!!! ', usuarioEEmails);

                    try {

                        for (let element of usuarioEEmails) {
                            count++;

                            let email = element.email;
                            let usuario = element.usuario;
                            console.log('Email e usuario: ', element, '>>>>', email, usuario);
                            //continuar depois do almoço

                            exists = await knexPostgre('login_tbl').withSchema('dbo')
                                .select('id_login')
                                .where('email', email)
                                .then(async (rows) => {
                                    if (rows.length > 0) return true;
                                    if (rows.length == 0) {
                                        console.log('>>> Busca dos usuarios, usuário não encontrados no banco de dados');
                                        dataResp.inseridos.push(element.usuario)
                                        return false;
                                    }

                                })

                            //Se não existe, insere
                            if (!exists) {
                                console.log('Email não existe');
                               await  knexPostgre('login_tbl').withSchema('dbo')
                                        .insert({'email': email,
                                                'usuario': usuario,
                                                'id_escritorio': id_escritorio})
                                            //.returning('usuario')
                                            //.into('dbo.login_tbl')
                                        .then(async (rows) => {
                                            if (rows.rowCount > 0){
                                            console.log('Rowscount: ', rows.rowCount )
                                            console.log('INseriu elemento no pg');
                                            var mailOptions = {
                                                subject: "Email de Confirmação - Notas Entrada Mezzomo",
                                                to: element.email,
                                                from: ''
                                              }
                                              const reqHost = process.env.MAIL_HOST;
                                              const htmlPage = "validacaoCadastroUsuario.html";
                                              const emailRedirectLink = `${reqHost}${emailRedirect.validacaoCadastroUsuario}?email=${element.email}`;
                                              const effieEndPoint = '/effie/escritorio/enviar-email-confirmacao-usuario';
                                              const senderToEffie = await sender.emailReady(mailOptions, htmlPage, emailRedirectLink, effieEndPoint);


                                        }

                                    }).catch((error) => {
                                        console.log("knexPostgre ==> insertUsuario ", error.message);

                                    })
                            } else {
                                dataResp.existem.push(element.usuario)
                            }

                            if (count == qtdRecebidos) {
                                console.log('Caiu nesse if de (count == qtdRecebidos')
                                console.log('dataResp: ', dataResp);
                                return res.status(200).send(responseForRequest('Operação concluída!', true, false, dataResp));
                            }

                        }

                    } catch (error) {
                        console.log("APP ===> : ", error.message);
                        return res.status(200).send(responseForRequest('Erro interno', false, true));
                    }

                //console.log("Multiple Insertion")
                /* console.log('>>>> Usuario ', usuario, email)
                var atributos_usuarios = []

                for (var i = 0; i < usuario.length; i++) {
                    atributos_usuarios.push({ usuario: usuario[i], email: email[i], id_escritorio: id_escritorio })
                    //console.log("testando=> ", atributos_usuarios)
                }

                if (!atributos_usuarios > 1 || !id_escritorio) {
                    return res.send("Formulário incompleto");
                }

                    try {
                        knexPostgre('login_tbl').withSchema('dbo')
                            .insert(atributos_usuarios)
                            .returning('id_login')
                            .into('login_tbl')
                            .then(async (id_login) => {
                                const rowsAffected = id_login;
                                if (Array.isArray(rowsAffected)) {
                                    const envioResp = await dispatchMultiplesEmails(email, req)
                                    if (envioResp.length == rowsAffected.length) {
                                        return res.send("Usuários inseridos com sucesso!")
                                    } else {
                                        return res.send("Erro ao gravar novos dados!")
                                    }

                                } else {
                                    return res.send("Erro ao gravar novos dados!")
                                }
                            }).catch((error) => {
                                console.log("APP ===>", error);
                                return res.send("Erro ao gravar novos dados!")

                            });

                    } catch (error) {
                        console.log(error)
                        return res.send("Erro ao gravar novos dados!");

                    } */


            }


    },


    async downloadTemplateXLSX(req, res) {
        try {
            var rootPath = global.__basedir
            // Convert fs.readFile into Promise version of same
            const readFile = util.promisify(fs.readFile);
            const getStuff = async () => await readFile(`${rootPath}/storage/excel_download/InserirUsuarios.xlsx`);
            await getStuff().then(data => {
                if (!data) return res.send(responseForRequest("Erro ao localizar Planilha de Inserção de Usuários!", false, true));
                console.log('Avançou para o if');
                console.log('Data: ', data);
                if (data) return res.send(responseForRequest("Planilha de Usuários carregada com sucesso", true, false, data));
            }).catch((error) => {
                console.log("APP ====> getStuff().catch()", error.message);
                return res.send(responseForRequest("Falha ao tentar obter a planilha de Usuários", false, true));
            });
        } catch (error) {
            console.log("APP ====> ", error.message);
            return res.send(responseForRequest("Erro ao localizar Planilha de Inserção de Usuários!", false, true));
        }

    },

    async insertUsuariosXLSX(req, res) {
        var {
            administrador,
            id_escritorio
        } = req.session.userData;
        const { usuariosXLSX } = req.body;
        var dataResp = { existem: [], inseridos: [], mensagem: [] };
        var count = 0;
        var exists = "";
        var qtdRecebidos = usuariosXLSX.length;
            try {
                for (let element of usuariosXLSX) {
                    count++;
                    let email = element.email;
                    let usuario = element.usuario;
                    console.log('Email e usuario: ', element, '>>>>', email, usuario);
                    //continuar depois do almoço

                    exists = await knexPostgre('login_tbl').withSchema('dbo')
                        .select('id_login')
                        .where('email', email)
                        .then(async (rows) => {
                            if (rows.length > 0) return true;
                            if (rows.length == 0) {
                                console.log('>>> Busca dos usuarios, usuário não encontrados no banco de dados');
                                dataResp.inseridos.push(element.usuario)
                                return false;
                            }
                        })
                    //Se não existe, insere
                    if (!exists) {
                        console.log('Email não existe');
                       await  knexPostgre('login_tbl').withSchema('dbo')
                                .insert({'email': email,
                                        'usuario': usuario,
                                        'id_escritorio': id_escritorio})
                                    //.returning('usuario')
                                    //.into('dbo.login_tbl')
                                .then(async (rows) => {
                                    if (rows.rowCount > 0){
                                    console.log('Rowscount: ', rows.rowCount )
                                    console.log('INseriu elemento no pg');
                                    var mailOptions = {
                                        subject: "Email de Confirmação - Notas Entrada Mezzomo",
                                        to: element.email,
                                        from: ''
                                      }
                                      const reqHost = process.env.MAIL_HOST;
                                      const htmlPage = "validacaoCadastroUsuario.html";
                                      const emailRedirectLink = `${reqHost}${emailRedirect.validacaoCadastroUsuario}?email=${element.email}`;
                                      const effieEndPoint = '/effie/escritorio/enviar-email-confirmacao-usuario';
                                      const senderToEffie = await sender.emailReady(mailOptions, htmlPage, emailRedirectLink, effieEndPoint);
                                }

                            }).catch((error) => {
                                console.log("knexPostgre ==> ", error.message);
                            })
                    } else {
                        dataResp.existem.push(element.usuario)
                    }
                    if (count == qtdRecebidos) {
                        console.log('Caiu nesse if de (count == qtdRecebidos')
                        console.log('dataResp: ', dataResp);
                        return res.status(200).send(responseForRequest('Operação concluída!', true, false, dataResp));
                    }
                }
            } catch (error) {
                console.log("APP ===> insertUsuariosXLSX: ", error.message);
                return res.status(200).send(responseForRequest('Erro interno', false, true));
            }
    },

}
