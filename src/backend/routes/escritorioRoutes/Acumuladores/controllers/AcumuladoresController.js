const { knexPostgre } = require("../../../../database/knex");

module.exports = {

    async getAcumuladores(req, res) {
        var { id_escritorio } = req.session.userData

        var objteste = []
        console.log("rota encontrada", id_escritorio)
        try {
            console.log("rota gg")
            const cfopHeader = await knexPostgre.from('dbo.operacoes_fora_do_estado_antecipado_view').distinct('cfop', 'resumo').where('id_escritorio', id_escritorio).then(function (rows) {
                return rows
            })

            /*
            cfop	resumo
            2101	Compra p/ Industrialização
            2102	Compra p/ Comercialização
            2152	Transferência de Mercadorias
            2201	Devolução de Compra Ind
            2202	Devolução de Mercadorias
            2910	Bonificação

             knexPostgre("dbo.produtos_tbl_view").distinct("descricao_item", "ncm", "mva_7", "mva_12", "tipo_antecipado").whereNull("pendente") //.whereNotNull("cst_piscofins_saida") //just4test

            const queryResult = await knexPostgre.select("arquivo_xml").from("dbo.xml_recebidos_processados_view").where("chavedeacesso", chave_de_acesso).andWhere('id_escritorio', id_escritorio).limit(1)
                            .then((result) => { return result[0] })
             */

            const cfopData = await knexPostgre.from('dbo.operacoes_fora_do_estado_antecipado_view').where('id_escritorio', id_escritorio).andWhere('cnpj', '05391441001319').then(function (rows) { return rows })
            /*
            id_op_fora_ant	cnpj	            tipo_antecipado	            mva	        cfop	acumulador	   resumo	                        id_escritorio	      cliente
            984	          05391441001319	    ANTECIPADO_DE_ENTRADAS      0,2	        2101	NULL	        Compra p/ Industrialização	    1	                  FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda
            990	          05391441001319	    ANTECIPADO_DE_ENTRADAS      0,3	        2101	NULL	        Compra p/ Industrialização	    1	                  FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda
            1176	        05391441001319	    ANTECIPADO_DE_ENTRADAS      0,4843	    2101	NULL	        Compra p/ Industrialização	    1	                  FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda
            1182	        05391441001319	    MEDICAMENTOS	              0,5837	    2101	NULL	        Compra p/ Industrialização	    1	                  FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda
            1188	        05391441001319	    MEDICAMENTOS	              0,4986	    2101	NULL	        Compra p/ Industrialização	    1	                  FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda
            */

            cfopHeader.forEach(function(element, index){

              cfopData.forEach(function(element1, index) {

                if(element.cfop == element1.cfop && element.resumo == element1.resumo) {

                  objteste.push({ [element1.tipo_antecipado] : { [element1.cfop]: element1.mva} })

                }
                //element.tipo_antecipado == 'ANTECIPADO_DE_ENTRADAS' && element.resumo != 'Compra p/ Industrialização'

              })

            })

            console.log('resultado: ', objteste)



            /*
            [
              {"ANTECIPADO_DE_ENTRADAS":{"2101": "3", "2102": "4", "2910": "7"}},
              {"medicamentos":{"2101": "3", "2102": "4", "2910": "7"}}
            ]
          */


            var header = [
                { cfop: '2101', resumo: 'Compra p/ Industrialização' },
                { cfop: '2102', resumo: 'Compra p/ Comercialização' },
                { cfop: '2152', resumo: 'Transferência de Mercadorias' },
                { cfop: '2201', resumo: 'Devolução de Compra Ind' },
                { cfop: '2202', resumo: 'Devolução de Mercadorias' },
                { cfop: '2910', resumo: 'Bonificação' }
            ]
            var data = [
                {
                    id_op_fora_ant: 1017,
                    cnpj: '05391441001319',
                    tipo_antecipado: 'ANTECIPADO_DE_ENTRADAS',
                    mva: '0,4566',
                    cfop: '2152',
                    acumulador: null,
                    resumo: 'Transferência de Mercadorias',
                    id_escritorio: 1,
                    cliente: 'FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda'
                },
                {
                    id_op_fora_ant: 1011,
                    cnpj: '05391441001319',
                    tipo_antecipado: 'ANTECIPADO_DE_ENTRADAS',
                    mva: '0,7',
                    cfop: '2152',
                    acumulador: null,
                    resumo: 'Transferência de Mercadorias',
                    id_escritorio: 1,
                    cliente: 'FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda'
                }
                ]


        } catch (error) {

        }
      },
    async getCFOP(req, res) {}


    }
        /*
        var { administrador, root, nome_fantasia, email, suporte, bi } = req.session.userData;

        try {
            res.redirect("/gerenciar/usuarios");
        } catch (error) {
            //res.status(500)
            res.redirect("/");
        }
        */


       /*
       12851238000100 : {
"ANTECIPADO_DE_ENTRADAS" : {

	2101 : {
		20: {		mva: 0,2
				cfop: 2101
				acumulador: NULL
				},
			2102: {
				tipo_antecipado: CESTA_BASICA,
				mva: 0,2
				cfop: 2102
				acumulador: 69
				}
 			}
		},

},
	30" :{
			 2101: {
				tipo_antecipado: CESTA_BASICA,
				mva: 0,2
				cfop: 2102
				acumulador: NULL
				},
			2102: {
				tipo_antecipado: CESTA_BASICA,
				mva: 0,2
				cfop: 2102
				acumulador: 69
				}
 			}
		},

},



       */




/**
var header = [{ cfop: '2101', resumo: 'Compra p/ Industrialização' },
{ cfop: '2102', resumo: 'Compra p/ Comercialização' },
{ cfop: '2152', resumo: 'Transferência de Mercadorias' }]
  var data = [{
    id_op_fora_ant: 1017,
    cnpj: '05391441001319',
    tipo_antecipado: 'ANTECIPADO_DE_ENTRADAS',
    mva: '0,4566',
    cfop: '2152',
    acumulador: null,
    resumo: 'Transferência de Mercadorias'}]

var json_result = []

data.forEach(function(item, index) {
item.mva = parseFloat(item.mva.replace(',', '.')).toFixed(2)*100]

json_result.push({
  [item.cnpj] : [
    {[item.tipo_antecipado] : [{
    		[item.cfop]: [{
          [item.resumo]: [{
             	[item.mva] : {
               "mva": item.mva,
               "acumulador": item.acumulador
               }
          }]
      	}]
   		}]
  	}]
	})

})
console.log(json_result)

 */

/*
//xing ultimo codigo
var data = [{id_op_fora_ant: 1011,
  cnpj: '05391441001319',
  tipo_antecipado: 'ANTECIPADO_DE_ENTRADAS',
  mva: '0,7',
  cfop: '2152',
  acumulador: null,
  resumo: 'Transferência de Mercadorias',
  id_escritorio: 1,
  cliente: 'FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda'
 },
 {
   id_op_fora_ant: 1005,
   cnpj: '05391441001319',
   tipo_antecipado: 'ANTECIPADO_DE_ENTRADAS',
   mva: '0,5',
   cfop: '2152',
   acumulador: null,
   resumo: 'Transferência de Mercadorias',
   id_escritorio: 1,
   cliente: 'FEIRAO DOS MOVEIS MAGAZINE LTDA - Jacunda'
 }]

var json_result = []

data.forEach(function(item, index) {
  //varificar a partir da segunda execução

  console.log('indice ',index)
  if(index > 0) {
    if(json_result) {
      console.log('entrou no if ', json_result[index-1][item.cnpj])
    }
  }

json_result.push({[item.cnpj] : [
{[item.tipo_antecipado] : [{
[item.cfop]: [{
[item.resumo]: [
 {
  [parseFloat(item.mva.replace(',', '.')).toFixed(2)*100] : {
     "mva": parseFloat(item.mva.replace(',', '.')).toFixed(2)*100,
     "acumulador": item.acumulador
     }

 }]}]}]}]
})

})



*/
