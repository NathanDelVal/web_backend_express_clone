const {knexPostgre} = require("../../database/knex");
const {redisClient, redisCache} = require('../../database/redis')
const {capitalize}= require('./capitalize')


async function UniqueToArray(rows){
  var output = []
  await rows.forEach(async function (el, index) {
      await Object.entries(el).forEach(([key, value]) => {
      if(value){
        if (value.indexOf(',') > -1) {
          let arrayValue = value.split(',')
          arrayValue.forEach((value, index)=>{
              value = capitalize(value)
          if(!output.includes(value)){
            output.push(value)
          }
          })
        }else{
            value = capitalize(value)
            if(value){
              if(!output.includes(value)){
                output.push(value)
              }
            }
        }
      }})
  })
return output;
}







module.exports = {

  async suggestions(nome_fantasia) {
    if (nome_fantasia) {
      var target = `Suggestions:escritorios:${nome_fantasia}`
      return await redisClient.get(target).then(async function(redis_suggestions) {
          var expirationTIME = await redisClient.ttl(target);
              if(redis_suggestions && expirationTIME > 0){
               //console.log(JSON.parse(redis_suggestions));
               //console.log("PEGUEI NO REDIS ")
                return Promise.all(JSON.parse(redis_suggestions))
                //return suggestions
              }

              if(!redis_suggestions || expirationTIME < 0){
                //console.log("PEGUEI NO SQL ")
                const suggestions = await knexPostgre
                                  .from("empresas_tbl_view").withSchema('dbo')
                                  .distinct("cliente")
                                  .where("nome_fantasia", nome_fantasia)
                                  .andWhere("situacao", "Ativa")
                                  .orderBy("cliente", "ASC")
                                  .then(async(rows) => {
                                   //console.log(rows)
                                   //console.log("BUSCA NO BANCO CONCLUIDA")
                                    return rows;
                                  })
                                  .catch((error) => {
                                   //console.log(error);
                                  });
                  if(suggestions){
                    if(suggestions.length > 0){
                      var expire = 300; //Expiration time in seconds
                      await redisClient.set(`Suggestions:escritorios:${nome_fantasia}`, JSON.stringify(suggestions), 'EX', expire);
                    }
                  }
                return Promise.all(suggestions)
              }
            });

    } else {
      var response = {
        redirect: "/acesso",
        error: "Sessão sem Nome Fantasia do Escritorio"
      }
      return(response);
    }
  },

  async suggestionsAnotacoes(nome_fantasia, id_escritorio) {
    if (nome_fantasia) {
      var target = `Suggestions:anotacoes:${nome_fantasia}`
      return await redisClient.get(target).then(async function(redis_suggestions) {
          var expirationTIME = await redisClient.ttl(target);
              //Tem no redis e ainda não expirou
              if(redis_suggestions && expirationTIME > 0){
                return Promise.all(JSON.parse(redis_suggestions))
              }
              //Não tem no Redis ou já expirou
              if(!redis_suggestions || expirationTIME <= 0){
                const suggestions = await knexPostgre
                                  .from("dbo.notas_view")
                                  .distinct("anotacoes")
                                  .where("nome_fantasia", nome_fantasia)
                                  .orderBy("anotacoes", "ASC")
                                  .then(async(rows) => {
                                  return await UniqueToArray(rows, nome_fantasia)
                                  })
                                  .catch((error) => {
                                   console.log(error);
                                  });
                return Promise.all(suggestions)
              }
            });

    } else {
      var response = {
        redirect: "/acesso",
        error: "Sessão sem Nome Fantasia do Escritorio"
      }
      return(response);
    }
  },

  //Only CEOs Can Access
  async suggestionsEscritorio() {
      return await knexPostgre
        .from("dbo.escritorios_tbl")
        .select("razao_social")
        .orderBy("razao_social", "ASC")
        .then((rows) => {
          return rows;
        })
        .catch((error) => {
         //console.log(error);
          res.status(500);
        });
  },

};
