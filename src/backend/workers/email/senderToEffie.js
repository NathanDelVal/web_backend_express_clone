const fs = require('fs');
const hbs = require('hbs');
const axios = require('axios');
const {redisClient} = require('../../database/redis');
const path = require('path');

const htmlPath = path.resolve(__dirname, '..', '..', '..', 'frontend', 'views', 'emailpages')
const readHTMLFile = async (path) => {
    try {
        return fs.readFileSync(path, { encoding: 'utf-8' })
    } catch (error) {
        console.log(error)
        return false
    }
};

module.exports = {

     async emailReady(mailOptions, htmlPage, emailRedirectLink, effieEndPoint) {

        // Verificando se o objeto mailOptions contém os atributos necessários e se são válidos
        if (!htmlPage || !emailRedirectLink || !effieEndPoint) {
            console.log('>>>> emailReady: 1 ou mais argumentos chegou vazio');
            return false;
        }

        checkObject = true;

        mailOptions.hasOwnProperty('to')? null: checkObject = false ;
        mailOptions.hasOwnProperty('subject')? null: checkObject = false ;

        const atributosObrigatorios = ['to', 'subject'];
         Object.entries(mailOptions).forEach(([key, value]) => {
            if(atributosObrigatorios.includes(key)){
                if (value.length == 0) checkObject = false;
            }
        });

        if (!checkObject) {
            console.log('>>>> emailReady: mailOptions não contém os atributos necessários');
            return false;
        }

        reqHost = process.env.MAIL_HOST + ':' + process.env.MAIL_PORT; //req.get('host');
        //console.log("smpt link", emailRedirectLink)
        const html = await readHTMLFile(`${htmlPath}/${htmlPage}`)
        if (html) {
            var htmlToSend = hbs.compile(html);
            if (emailRedirectLink){
                var replacements = {
                    linkar: emailRedirectLink
                };
                htmlToSend = htmlToSend(replacements);
            }
           /*  console.log('>>>> emailReady: emailRedirectLink', emailRedirectLink);
            console.log('>>>> emailReady: html completo  \n\n\n htmll \n\n\n', htmlToSend);  */
            mailOptions.html = htmlToSend;

            /* Novo Bull */
            const redis_token1 = await redisClient.get("Effie:token1").catch(function (error) { console.log(error.message); return error.message; });
            const redis_token2 = await redisClient.get("Effie:token2").catch(function (error) { console.log(error.message); return error.message; });
            /* Novo Bull */
            if (redis_token1 || redis_token2) {
                return await axios({
                    method: 'post',
                    url: `http://${process.env.API_BULL_HOST}:${process.env.API_BULL_PORT}${effieEndPoint}`,
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
                    return false;
                    //return res.send(error.message).status(500);
                });

            } else {
                return false;
            }


            return //await smtpTransport.sendMail(mailOptions)
        } else {
            console.log('\n\n\n\n\n ELSE do HTML!!!!!!!!!!!!!');

            console.log("Não foi possivel ler o html");
            return false;
        }
    },

}
