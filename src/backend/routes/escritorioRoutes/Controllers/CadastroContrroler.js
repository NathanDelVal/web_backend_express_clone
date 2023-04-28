var fs = require('fs');
const crypto = require('crypto');
const hbs = require('hbs')
const nodemailer = require('nodemailer');
const knex = require('../../database');
var localVariables = require('../localVariables');
//const keys = require('../../config/passport-keys');
const emailConfig = require('../../config/mail')


//var confirmacoes.cadastroKey = [];
//var confirmacoes_passkey = [];

//--------------------------------------------------[NODE MAILER]---------------------------------------------------------
var smtpTransport = nodemailer.createTransport(emailConfig);
var rand, mailOptions, host, link;
//------------------------------------------------------------------------------------------------------------------------x


module.exports = {

    async insert(req, res) {
        if (req.method == "POST") {
            var post = req.body;
            var nome = post.newuser;
            var senha = post.newpass;
            var email = post.newemail;
            var escritorio = post.newescritorio;

            try {
                knex('dbo.login_tbl_view')
                    .select('id', 'email', 'ativo')
                    .where('email', email)
                    .then((rows) => {

                        var rowsData = rows[0];
                        var rowsAffected = rows.length;
                        console.log("rowsAffected: ", rowsAffected)
                        console.log("rowsData: ", rowsData)


                        if (rowsAffected != 0) {
                            var consulta = rowsData;
                            var verifAtivo = consulta.ativo;
                            if (verifAtivo == "NÃO") {
                                const userid = consulta.id

                                knex('dbo.login_tbl_view')
                                    .where({
                                        email: email,
                                        id: userid
                                    })
                                    .update({
                                        usuario: nome,
                                        senha: senha
                                    })
                                    .then((rows) => {

                                        rowsAffected = rows;
                                        console.log("Update rowsAffected : ", rows)

                                        //ENVIANDO EMAIL DE CONFIRMAÇÃO
                                        console.log("MANDANDO EMAIL.. certo")

                                        function givemeaHash(len) {
                                            return crypto.randomBytes(Math.ceil(len / 2))
                                                .toString('hex') // convert to hexadecimal format
                                                .slice(0, len) // return required number of characters
                                        }
                                        rand = givemeaHash(12)
                                        host = req.get('host');
                                        const link = "http://" + req.get('host') + "/verificarcadastro?id=" + rand + "&email=" + email;


                                        //VAMOS PEGAR O HTML PARA ENVIAR POR EMAIL
                                        var readHTMLFile = (path, callback) => {
                                            fs.readFile(path, { encoding: 'utf-8' }, function(error, html) {
                                                if (error) {
                                                    ;
                                                } else {
                                                    return callback(null, html);
                                                }
                                            });
                                        };


                                        readHTMLFile(__dirname + '//../../../FRONTEND/views/emailpages/validacaoCadastro.html', function(error, html) {
                                            //console.log("CONSEGUI LER O ARQUIVO")
                                            var template = hbs.compile(html);
                                            var replacements = {
                                                linkar: link
                                            };

                                            htmlToSend = template(replacements);

                                            mailOptions = {
                                                    to: post.newemail,
                                                    subject: "Email de Confirmação - Notas Entrada Mezzomo",
                                                    html: htmlToSend
                                                }
                                                //console.log(mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(error, response) {
                                                if (error) {
                                                    return res.end("Ocorreu um erro na sua solicitação, verifique sua conexão com a internet.");
                                                } else {
                                                    //push
                                                    console.log("Antes push: ", localVariables.confirmacoes.cadastroKey);
                                                    localVariables.confirmacoes.cadastroKey.push(rand)
                                                    console.log("Depois push: ", localVariables.confirmacoes.cadastroKey);
                                                    return res.send("Confirme seu cadastro através do link enviado para seu email.")
                                                }
                                            });
                                        });
                                        //res.redirect("/");

                                    }).catch((error) => {
                                        console.log("APP ===>", error);
                                    });

                            } else {
                               return res.end("Seu login encontra-se ativo.");
                            }
                        } else {
                            return res.send("Você não possui pré-cadastro, solicite ao seu supervisor que envie seus dados.");
                        }


                    }).catch((error) => {
                        console.log("APP ===>", error);
                    });

            } catch (error) {
                return res.status(404);
            }
        }

    },

    async verify(req, res) {
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {

            var chave_cliente = req.query.id
            var rand = "";

            for (var x = 0; x < localVariables.confirmacoes.cadastroKey.length; x++) {
                if (localVariables.confirmacoes.cadastroKey[x] == chave_cliente) {
                    rand = localVariables.confirmacoes.cadastroKey[x];
                    var index = localVariables.confirmacoes.cadastroKey.indexOf(rand);
                    if (index > -1) {
                        localVariables.confirmacoes.cadastroKey.splice(index, 1);
                    }
                }
            }

            if (rand.length > 0) {
                try {
                    var email = req.query.email
                    knex('dbo.login_tbl_view')
                        .where('email', email)
                        .update('ativo', 'SIM')
                        .then((rows) => {
                            rowsAffected = rows;
                            if (rowsAffected > 0) {
                                var msgValidate = "Seu cadastro foi validado com sucesso!";
                                return res.render("acesso", { msgEmail: msgValidate })
                            } else {
                                var msgValidate = "Erro ao confirmar seu cadastro. Entre em contato com o suporte";
                                return res.render("acesso", { msgEmail: msgValidate })
                            }

                        }).catch((error) => {
                            console.log(error);

                        });
                } catch (error) {
                    console.log("APP ===>", error);

                }

            } else {
                var msgError = "Email não pode ser verificado, o link perdeu a validade. Tente cadastrar novamente.";
                return res.render("acesso", { msgEmail: msgError });

            }
        } else {
            //console.log("/verificarcadastro else")
            var msgError = "Email não pode ser verificado, o link perdeu a validade. Tente cadastrar novamente.";
            return res.render("acesso", { msgEmail: msgError });

        }

    }

}
