const qs = require('qs');
const axios = require('axios')

const niboURLs = require('./nibo.json')


module.exports = {

    //Organization : "Escritorio Contabil Mezzomo"
    async consultarClientes(req, res) {

        var { id_login,
            usuario,
            email,
            nome_fantasia,
            id_escritorio,
            numero,
            bi,
            status,
            plano,
            logo_icon,
            prod1,
            prod2,
            prod3,
            prod4,
            ativo,
            administrador,
            root,
            suporte,
            google_id,
            google_fname,
            google_lname,
            google_picture,
            data_inicio,
            erp,
            token } = req.session.userData





        console.log(" session ", req.session.userData)

        const clientId = '';
        const IDQueRetorna = '';
        const SuaURLQueRecebeCodeEState = '';

        const urlApi = niboURLs.consultar_clientes.url

        const postOptionalParams = niboURLs.consultar_clientes.params.optional;
        const postRequiredParams = niboURLs.consultar_clientes.params.required; //in this route none params is required soo the const is {}

        console.log("postOptionalParams", postOptionalParams)
        console.log("target JSON", postRequiredParams)


        //const token = req.query.token //temporario
        const tokenStr = process.env.NIBO_TOKEN
        try {
            const response = await axios({
                method: 'get',
                url: urlApi,
                data: qs.stringify({ "Organization": "Escritorio Contabil Mezzomo" }),
                headers: {
                    'apitoken': tokenStr,
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            })
            res.send(response.data)
        } catch (error) {
            console.log(error)

            if (error.response.data.error_description) {
                var errorNiboDescription = error.response.data.error_description
                console.log("Nibo Error: ", errorNiboDescription)
            } else if (error) {
                console.log("Axios Error | Nibo 401", error)
                res.status(500)
            }
        }
    },


    async criarCliente(req, res) {

        var { administrador, root, plano, id_escritorio } = req.session.userData

        const urlApi = niboURLs.criar_cliente.url;
        const tokenStr = process.env.NIBO_TOKEN;

        const postOptionalParams = niboURLs.criar_cliente.params.optional;
        const postRequiredParams = niboURLs.criar_cliente.params.required;
        //postRequiredParams.name =

        /* //postRequiredParams on this route

postRequiredParams = {
  name: 'string',
  email: 'string',
  phone: 'string',
  document: { number: 'string' },
  Organization: 'string',
  communication: {
    contactName: 'string',
    email: 'string',
    phone: 'string',
    cellPhone: 'string',
    webSite: 'string'
  },
  address: {
    line1: 'string',
    line2: 'string',
    number: 0,
    district: 'string',
    city: 'string',
    state: 'string',
    zipCode: 'string',
    country: 'string',
    ibgeCode: 'string'
  },
  bankAccountInformation: { bank: 'string', agency: 'string', accountNumber: 'string' },
  companyInformation: { companyName: 'string', municipalInscription: 'string' }
}

*/

        //Populate like that:
        /*
        postRequiredParams.name = "Atacadão Jk"
        postRequiredParams.email = atacadaojk@gmail.com
        [...]
        */
        const response = await axios({
            method: 'get',
            url: urlApi,
            data: qs.stringify({}),
            query: qs.stringify({ "Organization": `${OrgName}` }),
            headers: {
                'apitoken': tokenStr,
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        })
        if (response) {
            console.log(response.data.items[0])
            return response.data.items
        }

    }

}


/*

const personal = {
    "name": "string",
    "email": "string",
    "phone": "string",
    "document": {
        "number": "string"
    }
}

const communication = {
    "contactName": "string",
    "email": "string",
    "phone": "string",
    "cellPhone": "string",
    "webSite": "string"
}
const address = {
    "line1": "string",
    "line2": "string",
    "number": 0,
    "district": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string",
    "ibgeCode": "string"
}
var bankAccountInformation = {
    "bank": "string",
    "agency": "string",
    "accountNumber": "string"
}
var companyInformation = {
    "companyName": "string",
    "municipalInscription": "string"
}

*/

