const axios = require('axios');
const { response } = require('express');
//const request = require("request");
const fetch = require('node-fetch');

const omieKey = process.env.OMIE_APP_KEY;
const omieSecret = process.env.OMIE_APP_SECRET;

module.exports = {

  async IncluirConta(params) {

    const data = {
      call: "IncluirConta",
      app_key: omieKey,
      app_secret: omieSecret,
      param: [params]
    }

    try {

      console.log('>>>> Entrou no Incluir Conta ');
      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/crm/contas/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      const responseApiOmie = await returnApiOmie.json();
      console.log('>>>> Incluir conta response.json() ', responseApiOmie);
      return responseApiOmie;

    } catch (error) {
      console.log("tryyyyy catch ", error.message);
      return error;
    }

  },

  async ConsultarConta(params) {

    const data = {
      call: "ConsultarConta",
      app_key: omieKey,
      app_secret: omieSecret,
      param: [params]
    }
    try {
      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/crm/contas/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      const responseApiOmie = await returnApiOmie.json();
      return responseApiOmie;
    } catch (error) {
      console.log('>>>> ConsultarConta try catch error: ', error.message);
    }
  },

  async VerficarConta(params) {
    try {

      const data = {
        call: "VerificarConta",
        app_key: omieKey,
        app_secret: omieSecret,
        param: [params]
      }

      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/crm/contas/', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });

      const responseApiOmie = await returnApiOmie.json();
      return responseApiOmie;
    } catch (error) {
      console.log('>>>> VerficarConta try catch error: ', error.message);
    }
  },

  async AlterarConta(params) {
    const data = {
      call: "AlterarConta",
      app_key: omieKey,
      app_secret: omieSecret,
      param: [params]
    }

    try {

      const returnApiOmie =  await fetch('https://app.omie.com.br/api/v1/crm/contas/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      const responseApiOmie = await returnApiOmie.json();
      console.log('>>>> AlterarConta ', responseApiOmie);
      return responseApiOmie;

    } catch (e) {
      console.log("tryyyyy catch ", e.message);
      return e;
    }

  },

/*   async Listartags(params) {
    //Listar tags de Clientes -- não é o nosso caso, pois cadastramos contas
    const data = {
      call: "ListarTags",
      app_key: omieKey,
      app_secret: omieSecret,
      param: [params]
    }
    try {
      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/geral/clientetag/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      const responseApiOmie = await returnApiOmie.json();
      return responseApiOmie;
    } catch (error) {
      console.log('>>>> ConsultarConta try catch error: ', error.message);
    }
  }, */

  async VerificarContato(params) {
    try {
      const data = {
        call: "VerificarContato",
        app_key: omieKey,
        app_secret: omieSecret,
        param: [params]
      }

      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/crm/contatos/', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });

      const responseApiOmie = await returnApiOmie.json();
      return responseApiOmie;
    } catch (error) {
      console.log('>>>> VerficarConta try catch error: ', error.message);
    }
  },

  async IncluirContato(params) {
    const data = {
      call: "IncluirContato",
      app_key: omieKey,
      app_secret: omieSecret,
      param: [params]
    }

    try {

      console.log('>>>> Entrou no Incluir Contato ');
      const returnApiOmie = await fetch('https://app.omie.com.br/api/v1/crm/contatos/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      const responseApiOmie = await returnApiOmie.json();
      console.log('>>>> Incluir contato response.json() ', responseApiOmie);
      return responseApiOmie;

    } catch (error) {
      console.log("tryyyyy catch ", error.message);
      return error;
    }
  }
}
