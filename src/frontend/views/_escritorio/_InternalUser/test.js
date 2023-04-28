const { object } = require("@hapi/joi");
const { each } = require("async");
const { element } = require("xml");
const { tabelaIbgeDeEstados } = require("./src/backend/APIs/DANFE/core/brasil/brazilian/lib/dadosUtils");




// tabela ao carragar ela gera os  selects


tabela.every.row.contens = `<select 'data-tag'="Importante" class="dropdown-toggle-suggestions-target">   <option value="Selecionar">Selecionar</option>   </select>`


var userOptions = null

function getdata(params) {
    userOptions = ['...']
    setOptions(userOptions)
}


function setOptions(userOptions) {
    $('.dropdown-toggle-suggestions-target').each((element, index)=>{
        element.html('').append(userOptions)
    })
}

function getdataoffline(params) {
    userOptions = ['...']
    setOptions(userOptions)
}


function addTag(params) {
    //ajax post
    //push da variavel local
    userOptions.push({"Tag1":"#43243"})
    setOptions(userOptions)
}

function removerTag(params) {
    //ajax post
    //delete userOptions[Tag1]
    userOptions.push({"Tag1":"#43243"})
    setOptions(userOptions)
}

function atribuirTagAChaveDeacesso(data) {
    data // {Tag2:"#ccccc", chavedeacesso:"43254353"}
    reloadTable()
    setOptions(userOptions)
}
