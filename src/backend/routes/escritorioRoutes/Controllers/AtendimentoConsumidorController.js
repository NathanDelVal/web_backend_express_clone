const Joi = require('joiptbr')
const nodemailer = require('nodemailer');
var keys = require('../../../config/passport-keys');

const { schemaTenhoInteresse } = require('../../../workers/JOI/schemas');

module.exports = {

    async SendEmail(req, res) {

        if (req.body) {

            var { Nome, Email, Menssagem } = req.body
            var receveidObj = req.body

            try {
                const { error, value } = await schemaTenhoInteresse.validate(receveidObj);

                if (error) {
                    return  res.send(error.message);
                }
                if (!error && value ) {
                    console.log("joi validou ", value);

                    var smtpTransport = nodemailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: keys.email.user,
                            pass: keys.email.pass
                        }
                    });

                    var TargetEmail = 'projetoxcontabil@gmail.com'
                    mailOptions = {
                            from: '' + value.Nome + ' - ' + value.Email + ' -  <' + value.Email + '>',
                            to: '' + TargetEmail + ', ContatoMezz <' + TargetEmail + '>',
                            subject: "Dúvidas - Mezz",
                            html: ' <br> <hr> <h3> ' + value.Mensagem + ' <h3> <hr> <br> <h4>Clique para responder ' + value.Nome + ' => <a href="mailto:' + value.Email + '?subject=Suporte%20Dúvidas%20-%20Antecipados%20Mezz" target="_blank">bbraga@gmail.com</a></h4>'
                        }

                    smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {

                            return res.end("Ops! tente novamente.");

                        } else {
                            return  res.send("Obrigado pelo interesse! Entraremos em contato o mais breve possível.");
                        }
                    });
                }


            } catch (error) {
                console.log("APP ===>", error);
            }
        }
    },
};
