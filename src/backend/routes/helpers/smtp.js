var fs = require('fs');
const hbs = require('hbs')
const axios = require('axios');
const { knexPostgre } = require('../../database/knex');
const {redisClient} = require('../../database/redis');

const nodemailer = require('nodemailer');
const keys = require('../../config/passport-keys');
const { SendEmail } = require('../escritorioRoutes/Controllers/AtendimentoConsumidorController');


const htmlPath = `${__dirname}/../../../frontend/views/emailpages/`

// const link = "http://" + req.get('host') + "/verificarcadastro?id=" + rand + "&email=" + email
//link = "http://" + req.get('host') + "/alterarsenha?id=" + rand + "&email=" + email;

//--------------------------------------------------[NODE MAILER]---------------------------------------------------------
const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: keys.email.user,
        pass: keys.email.pass,
        //user: "104543243942601679442"
    }
});

const reqAddress = {
    validacaoCadastroEscritorio: '/verificarcadastro',
    validacaoCadastroUsuario: '/cadastro-usuario/pagina-confirmar-cadastro-usuario',
    recuperarSenha: '/alterarsenha'
}

const readHTMLFile = async (path) => {
    try {
        return fs.readFileSync(path, { encoding: 'utf-8' })
    } catch (error) {
        console.log(error)
        return false
    }
};

/*
const accounts = () => fs.readFileSync(__dirname + '/accounts.json', { endoding: 'utf8'})
const accRead = JSON.parse(accounts())
*/

//-----------------------------------------------------------------------------------------------------------------------x



const dispatchEmail = async (targetEmail, subject, htmlPage, redirectLink) => {

    var mailOptions, reqHost, route;
    reqHost = process.env.MAIL_HOST + ':' + process.env.MAIL_PORT; //req.get('host');
    //console.log("smpt link", redirectLink)
    const html = await readHTMLFile(`${htmlPath}${htmlPage}`)
    if (html) {
        var template = hbs.compile(html);
        var replacements = {
            linkar: redirectLink
        };
        var htmlToSend = template(replacements);
        mailOptions = {
            to: targetEmail,
            from: keys.email.user,
            subject: subject,
            html: htmlToSend
        }

        delete mailOptions.from

        /* Novo Bull */
        const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message; });
        const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message; });
        /* Novo Bull */
        if (redis_token1 || redis_token2) {
            await axios({
                method: 'post',
                url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}/effie/escritorio/recuperar-senha`,
                data: { 'data': mailOptions },
                headers: {
                    'token1': redis_token1,
                    'token2': redis_token2,
                    'content-type': 'application/json'
                }
            }).then(async (response) => {
                console.log("Novo Bull response ", response.data);
                return true;
            }).catch(async (error) => {
                console.log("Novo Bull error ", error);
                return false
                //return res.send(error.message).status(500);
            });

        } else {
            return false;
        }


        return //await smtpTransport.sendMail(mailOptions)
    } else {
        console.log("Não foi possivel ler o html");
    }
}

const dispatchMultiplesEmails = async (emails, req) => {
    const subject = "Email de recuperação de senha - Notas Entrada Mezzomo"
    const htmlPage = "validacaoCadastroUsuario.html"
    const reqHost = process.env.MAIL_HOST + ':' + process.env.MAIL_PORT //req.get('host');

    var retorno = []
    for (var i = 0; i < emails.length; i++) {
        const redirectLink = `${reqHost}${reqAddress.validacaoCadastroUsuario}?email=${emails[i]}`;
        var x = await dispatchEmail(emails[i], subject, htmlPage, redirectLink)
        retorno.push(x.accepted)
        //console.log(retorno[i].accepted)
    }
    console.log("retorno===> ", retorno)
    return retorno



}



module.exports = { dispatchEmail, dispatchMultiplesEmails }
