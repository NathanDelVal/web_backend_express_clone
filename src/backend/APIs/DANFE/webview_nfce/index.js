const handlebars = require('handlebars')
const NFCe = require("./main_nfce/djf-nfce")
const TEMPLATE_DANFE = __dirname + "/template-danfe-nfce.hbs"
const fs = require('fs')
const path = require('path')
//vitao nfce
/**
 * Retorna <valor> especificado com máscara do CPF.
 *
 * @param      {string}  valor
 * @return     {string}
 */
function mascaraCPF(valor) {
  var retorno
  var grupo01 = valor.substring(0, 3)
  retorno = grupo01
  var grupo02 = valor.substring(3, 6)
  if (grupo02 !== '') {
    retorno += '.' + grupo02
  }
  var grupo03 = valor.substring(6, 9)
  if (grupo03 !== '') {
    retorno += '.' + grupo03
  }
  var grupo04 = valor.substring(9)
  if (grupo04 !== '') {
    retorno += '-' + grupo04
  }
  return retorno
}

/**
 * Retorna <valor> especificado com máscara do CNPJ.
 *
 * @param      {string}  valor
 * @return     {string}
 */
function mascaraCNPJ(valor) {
  var retorno
  var grupo01 = valor.substring(0, 2)
  retorno = grupo01
  var grupo02 = valor.substring(2, 5)
  if (grupo02 !== '') {
    retorno += '.' + grupo02
  }
  var grupo03 = valor.substring(5, 8)
  if (grupo03 !== '') {
    retorno += '.' + grupo03
  }
  var grupo04 = valor.substring(8, 12)
  if (grupo04 !== '') {
    retorno += '/' + grupo04
  }
  var grupo05 = valor.substring(12)
  if (grupo05 !== '') {
    retorno += '-' + grupo05
  }
  return retorno
}

/**
 * Retorna <numero> especificado formatado de acordo com seu tipo (cpf ou cnpj).
 *
 * @param      {string}  numero
 * @return     {string}
 */
function formataInscricaoNacional(numero) {
  if (numero) {
    if (numero.length === 11) {
      return mascaraCPF(numero)
    }
    if (numero.length === 14) {
      return mascaraCNPJ(numero)
    }
  }
  return numero
}

/**
 * Formata data de acordo com <dt> esoecificado.
 * <dt> é no formato UTC, YYYY-MM-DDThh:mm:ssTZD (https://www.w3.org/TR/NOTE-datetime)
 *
 * @param      {string}  dt
 * @return     {string}
 */
function formataData(dt) {
  if (dt && dt.length != 0) {
    dt = dt ? dt.toString() : ''
    if (dt && dt.length === 10) {
      dt += 'T00:00:00+00:00'
    }
    var [data, hora] = dt.split('T')
    var [hora, utc] = hora.split(/[-+]/)
    var [ano, mes, dia] = data.split('-')
    var [hora, min, seg] = hora.split(':')
    var [utchora, utcmin] = utc ? utc.split(':') : ['', '']
    return dia.padStart(2, '0') + '/' + mes.toString().padStart(2, '0') + '/' + ano
  }

  if (!dt || dt.length == 0) {
    return ''
  }

}

function formataHora(dt) {
  if (dt.length > 0) {
    var data = new Date(dt)
    return data.getHours().toString().padStart(2, '0') + ':' + (data.getMinutes().toString().padStart(2, '0')) + ':' + data.getSeconds().toString().padStart(2, '0')
  }
  return ''
}

/**
 * Retorna o valor formatado em moeda de acordo com  <numero>  e <decimais> especificados.
 *
 * @param      {number}   numero
 * @param      {number}  decimais
 * @return     {string}
 */
function formataMoeda(numero, decimais) {
  decimais = decimais || 2
  var symbol = ''
  var decimal = ','
  var thousand = '.'
  var negative = numero < 0 ? '-' : ''
  var i = parseInt(numero = Math.abs(+numero || 0).toFixed(decimais), 10) + ''
  var j = 0

  decimais = !isNaN(decimais = Math.abs(decimais)) ? decimais : 2
  symbol = symbol !== undefined ? symbol : '$'
  thousand = thousand || ','
  decimal = decimal || '.'
  j = (j = i.length) > 3 ? j % 3 : 0
  return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (decimais ? decimal + Math.abs(numero - i).toFixed(decimais).slice(2) : '')
};

/**
 * Retorna objeto representando os dados da <entidade> especificada.
 *
 * @param      {Object}  entidade  djf-nfce
 * @return     {Object}
 */
function dadosEntidade(entidade) {
  if (entidade) {
    return {
      nome: entidade.nome(),
      fantasia: entidade.fantasia(),
      ie: entidade.inscricaoEstadual(),
      ie_st: entidade.inscricaoEstadualST(),
      inscricao_municipal: entidade.inscricaoMunicipal(),
      inscricao_nacional: formataInscricaoNacional(entidade.inscricaoNacional()),
      telefone: entidade.telefone()
    }
  }
  return {}
}

/**
 * Retorna objeto representando os dados do <endereco> especificado.
 *
 * @param      {Object}  endereco   djf-nfce
 * @return     {Object}
 */
function endereco(endereco) {
  if (endereco) {
    return {
      endereco: endereco.logradouro(),
      numero: endereco.numero(),
      complemento: endereco.complemento(),
      bairro: endereco.bairro(),
      municipio: endereco.municipio(),
      cep: endereco.cep(),
      uf: endereco.uf()
    }
  }
  return {}
}

/**
 * Retorna a <cahve> da NFE formata.
 * Formatação: grupos de 4 números separados por espaço.
 * @param      {string}  chave
 * @return     {string}
 */
function formataChave(chave) {
  var out = ''
  if (chave && chave.length === 44) {
    for (var i = 0; i < chave.split('').length; i++) {
      if (i % 4 === 0) {
        out += ' ' + chave.charAt(i)
      } else {
        out += chave.charAt(i)
      }
    }
    return out
  }
  return chave
}

/**
 * Retorna array de objetos com os dados dos itens de acordo com <nfce> especificado.
 *
 * @param      {<object>}  nfce     djf-nfce
 * @return     {array}
 */
function itens(nfce) {
  var itens = []
  var nrItens = nfce.nrItens()
  for (var i = 1; i <= nrItens; i++) {
    var row = nfce.item(i)
    var item = {
      codigo: row.codigo(),
      descricao: row.descricao().replace(/&amp;/g, "&"),
      ncm: row.ncm(),
      cst: row.origem() + '' + row.cst(),
      cfop: row.cfop(),
      unidade: row.unidadeComercial(),
      quantidade: formataMoeda(row.quantidadeComercial()),
      valor: formataMoeda(row.valorUnitario()),
      desconto: formataMoeda(row.valorDesconto()),
      total: formataMoeda(row.valorProdutos()),
      base_calculo: formataMoeda(row.baseCalculoIcms()),
      icms: formataMoeda(row.valorIcms()),
      ipi: formataMoeda(row.valorIPI()),
      porcentagem_icms: formataMoeda(row.porcetagemIcms(), 2),
      porcentagem_ipi: formataMoeda(row.porcentagemIPI(), 2),
      itemPmvast: row.porcentagemMVAST(),
      itemValorIcmsST : row.valorIcmsST()
    }
    itens.push(item)
  }

  return itens
}

/**
 * Retorna array de objetos com os dados das duplicatas de acordo com <nfce> especificado
 *
 * @param      {object}  nfce     djf-nfce
 * @return     {array}
 */
function duplicatas(nfce) {
  var dups = []
  if (nfce.cobranca() && nfce.cobranca().nrDuplicatas() > 0) {
    var quant = nfce.cobranca().nrDuplicatas()
    for (var i = 1; i <= quant; i++) {
      var dup = nfce.cobranca().duplicata(i)
      dups.push({
        numero: dup.numeroDuplicata(),
        vencimento: formataData(dup.vencimentoDuplicata()),
        valor: formataMoeda(dup.valorDuplicata(), 2)
      })
    }
  }

  return dups
}

/**
 * Retorna os dados da observação de acordo com <nfce> especificado.
 *
 * @param      {object}  nfce     djf-nfce
 * @return     {string}
 */
function observacoes(nfce) {
  var quant = nfce.nrObservacoes()
  var result = ''
  for (var i = 1; i <= quant; i++) {
    result += '\n' + nfce.observacao(i).texto()
  }

  return result
}

/**
 * Retorna o template html do Danfe preenchido com os dados em <data> especificado.
 * Retorna vazio se não gerado.
 * @param      {object}  data
 * @return     {string}
 */


function renderHtml(data) {
  if (!data) {
    return ''
  }
  var template = fs.readFileSync(TEMPLATE_DANFE, 'utf8')
  return handlebars.compile(template)(data)
}

/**
 * Retorna objeto com os dados do template de acordo com <nfce> especificado.
 *
 * @param      {object}  nfce     djf-nfce
 * @return     {object}
 */
function getTemplateData(nfce) {
  if (!nfce) {
    return null
  }

  var itensNfe = itens(nfce)
  var chave = formataChave(nfce.chave())
  itensNfe.forEach(function (item_nota, index) {
    dataextra.forEach(function (item_extra, index2) {

      if (item_nota.descricao == item_extra.descricao_item) {


        /*
        //mva_4
         if (item_extra.mva_4) {
          item_nota.mva_4_raw = item_extra.mva_4;
          item_nota.mva_4 = `${(parseFloat(item_extra.mva_4.replace(/,/g, ".")) * 100).toFixed(2)}%`;
        }else  {
          item_nota.mva_4_raw = 'null';
          item_nota.mva_4 = '';
        }

        //red_bc_icms_sai_pa
        if (item_extra.red_bc_icms_sai_pa) {
          item_nota.red_bc_icms_sai_pa_raw = item_extra.red_bc_icms_sai_pa;
          item_nota.red_bc_icms_sai_pa = `${(parseFloat(item_extra.red_bc_icms_sai_pa.replace(/,/g, ".")) * 100).toFixed(2)}%`;
        }else  {
          item_nota.red_bc_icms_sai_pa_raw = 'null';
          item_nota.red_bc_icms_sai_pa = '';
        }

        */



        //console.log("itens: ", item_extra)
        if (item_extra.aliquota == 12) {
          item_nota.mva_raw = item_extra.mva_12
          item_nota.mva = `${(parseFloat(item_extra.mva_12.replace(/,/g, ".")) * 100).toFixed(2)}%`
        } else if (item_extra.aliquota == 7) {
          item_nota.mva_raw = item_extra.mva_7
          item_nota.mva = `${(parseFloat(item_extra.mva_7.replace(/,/g, ".")) * 100).toFixed(2)}%`
        } else if (item_extra.aliquota == 17) {
          item_nota.mva_raw = 'null'
          item_nota.mva = ''
        }
        /* rows[0].mva_porcentagem = `${(parseFloat(rows[0].mva.replace(/,/g, ".")) * 100).toFixed(2)}%`;*/
        item_nota.chave_de_acesso = chave.replace(/ /g, '')
        if (item_extra.calculo_valor_antecipado) {
          item_nota.valor_ant = item_extra.calculo_valor_antecipado
          /* o custo é convertido pra float no calculo, podemos separar pra resolver o erro das casas decimais */
          /* antigo | var custo = (parseFloat(item_extra.calculo_valor_antecipado.replace(/,/g, ".")) / parseFloat(item_extra.valor_bruto.replace(/,/g, ".")) * 100).toFixed(2) */
          var custo = (parseFloat(item_extra.calculo_valor_antecipado.replace(/\s/g, "")) / parseFloat(item_extra.valor_bruto.replace(/\s/g, ""))) * 100
          custo = custo.toFixed(2)
          item_nota.custo = `${custo}%`
        } else {
          item_nota.valor_ant = '0'
          item_nota.custo = '0%'
        }
        if (item_extra.tipo_antecipado) {
          item_nota.tipo_antecipado_raw = item_extra.tipo_antecipado
          item_nota.tipo_antecipado = item_extra.tipo_antecipado.replace(/ANTECIPADO/g, 'ANT.').replace(/_/g, ' ')
        } else {
          item_nota.tipo_antecipado_raw = 'null'
          item_nota.tipo_antecipado = ''
        }
        if (item_extra.diferencial_de_aliquota == 'SIM') {
          item_nota.dif_aliquota = item_extra.diferencial_de_aliquota
        }

        // NÃO TEM NA NFCE //item_extra.cfop_entrada ? item_nota.cfop_entrada = item_extra.cfop_entrada : item_nota.cfop_entrada = ''
        item_extra.acumulador ? item_nota.acumulador = item_extra.acumulador : item_nota.acumulador = ''
        item_nota.forma_pagamento = nfce.formaPagamentoRaw()



        //VISUALIZAÇÂO DA TRIBUTAÇÂO DE PRODUTOS COM SUBSTITUIÇÂO TRIBUTARIA
        /*
        if (vICMSST != null && vICMSST > 0){

         # T.Ant tem que mostrar "Substituicao Tributaria"
         # coluna V. Ant tem mostar o valor que veio em vICMSST
         # coluna MVA tem que mostar oq veio na tag  pMVAST
        }
        */
        //item_nota.itemPmvast
        //item_nota.itemValorIcmsST

        if(item_nota.itemValorIcmsST && item_nota.itemValorIcmsST > 0){
          item_nota.tipo_antecipado = 'Subs. Tributária'
          item_nota.valor_ant = item_nota.itemValorIcmsST
          item_nota.mva = `${(parseFloat(item_nota.itemPmvast.replace(/,/g, "."))).toFixed(2)}%`;
        }

      }
    })



  })

  /* CÁLCULO DE VALOR DE CADA ANTECIPADO + TOTAL DE TODOS ANTECIPADOS  */
  var resultado_antecipados = { total: 0 }

  let group_antecipados = itensNfe.reduce((r, a) => {
    r[a.tipo_antecipado] = [...r[a.tipo_antecipado] || [], a];
    return r;
  }, {});

  Object.entries(group_antecipados).forEach(([idx_group, antecipado]) => {

    resultado_antecipados[idx_group] = 0

    antecipado.forEach(function (el, id) {
      if(el.tipo_antecipado_raw !='ISENTO'){
        if (el.valor_ant) {
          var total = parseFloat(resultado_antecipados.total);
          var vAnt = parseFloat(el.valor_ant.replace(/,/g, "."))
          if(typeof total == 'number' && typeof vAnt == 'number') {
            resultado_antecipados.total = (total + vAnt).toFixed(2);
            resultado_antecipados[idx_group] = (parseFloat(resultado_antecipados[idx_group]) + vAnt ).toFixed(2);
          }
        }
    }

    })
  })


  var data = {
    operacao: nfce.tipoOperacao(),
    natureza: nfce.naturezaOperacao(),
    numero: nfce.nrNota(),
    serie: nfce.serie(),
    chave: chave,
    protocolo: nfce.protocolo(),
    data_protocolo: formataData(nfce.dataHoraRecebimento()) + ' ' + formataHora(nfce.dataHoraRecebimento()),
    destinatario: Object.assign(dadosEntidade(nfce.destinatario()), endereco(nfce.destinatario())),
    emitente: Object.assign(dadosEntidade(nfce.emitente()), endereco(nfce.emitente())),
    data_emissao: formataData(nfce.dataEmissao()),
    data_saida: formataData(nfce.dataEntradaSaida()),
    base_calculo_icms: formataMoeda(nfce.total().baseCalculoIcms(), 2),
    imposto_icms: formataMoeda(nfce.total().valorIcms(), 2),
    base_calculo_icms_st: formataMoeda(nfce.total().baseCalculoIcmsST(), 2),
    imposto_icms_st: formataMoeda(nfce.total().valorIcmsST(), 2),
    imposto_tributos: formataMoeda(nfce.total().valorTotalTributos(), 2),
    total_produtos: formataMoeda(nfce.total().valorProdutos(), 2),
    total_frete: formataMoeda(nfce.total().valorFrete(), 2),
    total_seguro: formataMoeda(nfce.total().valorSeguro(), 2),
    total_desconto: formataMoeda(nfce.total().valorDesconto(), 2),
    total_despesas: formataMoeda(nfce.total().valorOutrasDespesas(), 2),
    total_ipi: formataMoeda(nfce.total().valorIPI(), 2),
    total_nota: formataMoeda(nfce.total().valorNota(), 2),
    transportador: Object.assign(dadosEntidade(nfce.transportador()), endereco(nfce.transportador())),
    informacoes_fisco: nfce.informacoesFisco(),
    informacoes_complementares: nfce.informacoesComplementares(),
    observacao: observacoes(nfce),
    modalidade_frete: nfce.modalidadeFrete(),
    modalidade_frete_texto: nfce.modalidadeFreteTexto(),
    itens: itensNfe,
    duplicatas: duplicatas(nfce),
    resultado_ant: JSON.stringify(resultado_antecipados),
    forma_pagamento: nfce.formaPagamento(),
    valor_pagamento: nfce.vPag(),
    detalhamento_pagamento: nfce.detPag(),
    grupo_cartoes: nfce.card(),
    valor_troco: nfce.vTroco(),
    qrcode: nfce.qrCode()
  }

  if (nfce.transporte().volume()) {
    let volume = nfce.transporte().volume()
    data.volume_quantidade = formataMoeda(volume.quantidadeVolumes())
    data.volume_especie = volume.especie()
    data.volume_marca = volume.marca()
    data.volume_numeracao = volume.numeracao()
    data.volume_pesoBruto = formataMoeda(volume.pesoBruto())
    data.volume_pesoLiquido = formataMoeda(volume.pesoLiquido())
  }

  if (nfce.transporte().veiculo()) {
    data.veiculo_placa = nfce.transporte().veiculo().placa()
    data.veiculo_placa_uf = nfce.transporte().veiculo().uf()
    data.veiculo_antt = nfce.transporte().veiculo().antt()
  }

  if (nfce.servico()) {
    data.total_servico = formataMoeda(nfce.servico().valorTotalServicoNaoIncidente())
    data.total_issqn = formataMoeda(nfce.servico().valorTotalISS())
    data.base_calculo_issqn = formataMoeda(nfce.servico().baseCalculo())
  }

  return data
}

/**
 * Retorna modelo Danfe de acordo com objeto <nfce> especificado.
 *
 * @param      {<type>}  nfce     djf-nfce
 * @return     {Object}  { description_of_the_return_value }
 */
function model(nfce) {
  return {
    toHtml: () => renderHtml(getTemplateData(nfce))
  }
}

/**
 * Retorna modelo Danfe de acordo com objeto  <nfce> especificado.
 *
 * @param      {object}  nfce    djf-nfce
 * @return     {<object>}
 */
module.exports.fromNFe = function (nfce) {
  if (!nfce || typeof nfce.nrNota !== 'function') {
    return model(null)
  }
  return model(nfce)
}

var dataextra

/**
 * Retorna modelo Danfe de acordo com <xml> especificado.
 *
 * @param      {string}  xml
 * @return     {<object>}
 */


module.exports.fromXML = function (xml, extra) {

  if (extra) {
    //console.log("data index danfe ", extra)
    dataextra = extra
  }

  if (!xml || typeof xml !== 'string') {
    return model(null)
  }

  return model(NFCe(xml))
}

/**
 * Retorna modelo Danfe de acordo com <filePath> especificado.
 *
 * @param      {string}  filePath
 * @return     {<object>}
 */
module.exports.fromFile = function (filePath) {
  var content = ''

  if (!filePath || typeof filePath !== 'string') {
    return model(null)
  }

  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    throw new Error('File not found: ' + filePath + ' => ' + error.message)
  }

  return module.exports.fromXML(content)
}
