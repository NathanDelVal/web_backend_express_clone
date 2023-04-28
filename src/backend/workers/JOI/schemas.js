const Joi = require ('joiptbr')

 const schemaTenhoInteresse = Joi.object().keys({
    Nome: Joi.string().min(2).max(40).required(),
    Email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'br'] } }).min(7).max(50).regex(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
        .messages({
            "string.pattern.base": 'Formato do "Email" inválido'
        }).required(),
    Mensagem: Joi.string().min(2).max(2000).required()
});

 const schemaCadastrarEscritorio = Joi.object().keys({
    plano: Joi.string().min(1).max(40).required(),
    nome_completo: Joi.string().min(2).max(40).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).min(7).max(50).regex(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
        .messages({
        "string.pattern.base": 'Formato do "Email" inválido'
        }).required(),
    numero_contato: Joi.string().min(10).required().messages({
        'string.min': `"Número de Contato" precisa deve ter no mínimo {#limit} caracteres`
      }),
    cnpj: Joi.string().min(11).max(14).required(),
    razao_social: Joi.string().min(4).required(),
    nome_fantasia: Joi.string().min(4).required(),
    formapagamento: Joi.string().min(1).max(40),
    cpf: Joi.string().required(),
    cep: Joi.string().min(8).required(), 
    endereco: Joi.string().min(2).required(),
    numero_endereco: Joi.string().required(),
    tipo_conta: Joi.string().min(1).max(2).required(),
    municipio: Joi.string().min(3),
    uf: Joi.string().max(2),
    website: Joi.string().allow('').optional(),
    bairro: Joi.string().required()
    /*contrato: Joi.string().min(1).required().messages({
        'any.required': `"O Contrato" precisa ser aceito`
      }),
    */
});


const schemaEmail = Joi.object().keys({
    Email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).min(4).max(50).regex(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
        .messages({"string.pattern.base": 'Formato do "Email" inválido'}).required(),
    Senha: Joi.string().min(2).max(50).required()
});


/** Validação das Etiquetas */
const schemaEtiquetaNF = Joi.object().keys({
    id_escritorio: Joi.number().required(),
    nome_etiqueta: Joi.string().required(),
    cor:  Joi.string().required(),
});

/* Schema etiquetas - Notas fiscais */
const schemadeleteEtiquetaNF = Joi.object().keys({
    id_escritorio: Joi.string().required(),
    nome_etiqueta: Joi.string().required(),
});

/* Schema GED - Controle de obrigações */
const schemaControleObrigacoes = Joi.object().keys({
    gedmg_cliente: Joi.string(),
    gedmg_regime: Joi.string(),
    gedmg_status: Joi.string(),
    gedmg_mes_referencia: Joi.string(),
});


const schemaCriarAcumulador = Joi.object().keys({
    cfop : Joi.string().required(),
    select_new_antecipado_acumulador : Joi.array().required(),
    mva : Joi.string(),
    acumulador : Joi.string().required(),
    cnpj_novo_acumulador : Joi.string().required()
});


const schemaCorrigirAprovadosUpdateSingle = Joi.object().keys({  
    id_produto: Joi.string().min(1).required(),
    descricao_produtos: Joi.string().min(1).max(1000).required(),
    mva_4: Joi.string().max(6).allow(''),  
    //Joi.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9\-]+[a-zA-Z0-9]$/).optional()
    //Joi.string().allow('').optional()
    mva_7: Joi.string().max(6).required(),
    mva_12: Joi.string().max(6).required(),
    tipoantecipado: Joi.string().min(5).required(),
    cst_icms: Joi.string().min(3).required(),
    csosn_icms: Joi.string().min(3).required(),
    cst_piscofins_entrada: Joi.string().min(2).required(),
    cst_piscofins_saida: Joi.string().min(2).required(),
    red_bc_icms_sai_pa: Joi.string().min(2),
    natureza: Joi.string().min(1).allow(''), 
    nt_saida_reducao_base_pa: Joi.string().allow('').optional(),    
    nt_saida_reducao_base_fora_pa: Joi.string().allow('').optional()  //Joi.string().min(2).allow('')
});


const schemaAgendamento = Joi.object().keys({
    /* Plano: Joi.string().min(1).max(40).required(), */
    nome_completo: Joi.string().min(2).max(40).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).min(7).max(50).regex(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
        .messages({
            "string.pattern.base": 'Formato do "Email" inválido'
        }).required(),
    numero_contato: Joi.string().min(10).required().messages({
        'string.min': `"Número de Contato" precisa deve ter no mínimo {#limit} caracteres`
    }),
    cnpj: Joi.string().min(14).required(),
    razao_social: Joi.string().min(4).required(),
    cpf: Joi.string().max(14).allow('', null),
    disponibilidade: Joi.string().required()
    
});



const schemaGedLogin = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).min(4).max(50).regex(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
        .messages({"string.pattern.base": 'Formato do "Email" inválido'}).required(),
    senha: Joi.string().min(2).max(50).required()
});


module.exports = {
    schemaEmail,
    schemaTenhoInteresse, 
    schemaCadastrarEscritorio, 
    schemaEtiquetaNF, 
    schemadeleteEtiquetaNF, 
    schemaControleObrigacoes,
    schemaCriarAcumulador,
    schemaCorrigirAprovadosUpdateSingle,
    schemaAgendamento,
    schemaGedLogin
}