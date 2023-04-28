const NodeEnviroment = require('../../../../config');
const { responseForRequest } = require("../../routes/helpers/responseToRequest");

module.exports = {
    //------------------------------------------------[SESSION VALIDATE]------------------------------------------------------
    async sessionValidate(req, res, next) {
        if (!req.session.userData) return res.redirect("/acesso");  //Isso não funciona quando a requisição é diferente de GET
        if (!req.session.userData.status || req.session.userData.status != 'Ativa') return res.status(200).send(responseForRequest('Status do Escritório encontra-se inativo.', false, true))
        if (req.session.userData.status == 'Ativa') {
            if (req.session.userData.ativo != 'SIM') return res.send(responseForRequest("Seu usuário encontra-se inativo!", false, true));
            return next();
        }
    },

    async mustBeRoot(req, res, next) {
        if (!req.session.userData) return res.redirect("/acesso");
        //if (!req.session.userData) return res.status(200).send(responseForRequest("Sessão expirada!", false, true));
        if (!req.session.userData.root) return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        if (req.session.userData.root != 'SIM') return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        return next();
    },

    async mustBeAdministrador(req, res, next) {
        if (!req.session.userData) return res.redirect("/acesso");
        //if (!req.session.userData) return res.status(200).send(responseForRequest("Sessão expirada!", false, true));
        if (!req.session.userData.administrador) return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        if (req.session.userData.administrador != 'SIM') return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        return next();
    },

    async mustBeEscritorio(req, res, next) {
        if (!req.session.userData) return res.redirect("/acesso");
        //if (!req.session.userData) return res.status(200).send(responseForRequest("Sessão expirada!", false, true));
        if (!req.session.userData.conta_escritorio) return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        if (req.session.userData.conta_escritorio === true) return next();
    },
    
    async mustBeEmpresa(req, res, next) {
        if (!req.session.userData) return res.redirect("/empresa");
        //if (!req.session.userData) return res.status(200).send(responseForRequest("Sessão expirada!", false, true));
        if (!req.session.userData.status === "Ativa") return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        if (!req.session.userData.situacao === "Ativa") return res.status(200).send(responseForRequest("Sua empresa está inativa, entre em contato com o escritóriro contábil.", false, true));
        if (req.session.userData.status === "Ativa" && req.session.userData.situacao === "Ativa") return next();
    },

    async sessionValidateDev(req, res, next) {
        var { password } = req.query
        if (password != "@cliente2020") return res.redirect("/acesso");
        return next();
    },


    async mustBeEscritorioGED(req, res, next) {
        if (!req.session.userData) return res.send(responseForRequest("Sessão inativa.", false, true));
        //if (!req.session.userData) return res.status(200).send(responseForRequest("Sessão expirada!", false, true));
        if (!req.session.userData.conta_escritorio) return res.status(200).send(responseForRequest("Você não possui as permissões necessárias.", false, true));
        if (req.session.userData.conta_escritorio === true) return next();
    },


    async mustBeValidToken(req, res, next) {
        if (req.headers['x-access-token'] === NodeEnviroment.UPLOAD_TOKEN){
            return next()
        }
        return res.status(401).send('Unauthorized')
    },

}
