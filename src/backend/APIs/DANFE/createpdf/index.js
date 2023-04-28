var fs = require("fs");
const path = require("path");
const NfeModel = require("./NfeModel");
const {
  nfe,
  validacoes,
  dados,
  formatacoes,
  bancos,
  boleto,
} = require("../core/brasil/brazilian"); //formatacoes.removerMascara
const {
  Gerador,
  Danfe,
  Emitente,
  Destinatario,
  Transportador,
  Endereco,
  Protocolo,
  Impostos,
  Volumes,
  Item,
} = require("../core/danfe/app");

const getStream = require("get-stream");
const webdanfe = require("../webdanfe");

module.exports = {
  async makePDF(xmlFile, logoDIR, callback) {
    //console.log("APP ===> makePDF(x, y, z)");
    const view = xmlFile;
    const Nfe = NfeModel(view);
    //const nfeLOGO = path.join(__dirname, '/logoMezzomo.png') || ''

    if (Nfe.informacoesComplementares().length > 1800) {
      //Então iremos gerar o pdf usando a api online webdanfe

      webdanfe.gerarDanfe(view, function (error, pdf) {
        if (error) {
          console.log(`APP --> - (PDF Maker) - ${error}`);
        } else {
          console.log(
            "APP ===> Gerando PDF de Nota Fiscal através da APi WebDanfe"
          );
          callback(null, pdf);
        }
        /*
                fs.writeFileSync('danfepelowebdanfe.pdf', pdf, {
                        encoding: 'binary'
                    });

                */
      });
    } else {
      /* ------------   Iremos gerar o pdf usando a api local ------------  */

      /* -----------------------  EMITENTE ------------------------ */
      var emitente = new Emitente();
      var emitenteEndereco = new Endereco();
      //if (nfeLOGO) emitente.comLogotipo(nfeLOGO);

      try {
          var inscricaoEstadual = Nfe.inscricaoEstadual(view);
          if (inscricaoEstadual != "ISENTO") {
              inscricaoEstadual = formatacoes.inscricao_estadual(inscricaoEstadual);
            }
            emitente.comInscricaoEstadual(inscricaoEstadual);
      } catch (error) {
        console.log("APP --> Erro ao coletar do xml a inscricaoEstadual do Emitente da nota");
      }


      try {
        emitente.comRegistroNacional(Nfe.emitente().inscricaoNacional())
      } catch (error) {
        if (error)
          console.log("APP --> Emitente inexistente - CPF/CNPJ não encontrado - (PDF Maker)");
      }

      try {
        emitente.comTelefone(formatacoes.telefone(Nfe.telefone(view)));
      } catch (error) {
        if (error) {
          console.log(
            "APP --> Erro ao obter numero de telefone do Emitente da nota - (PDF Maker)"
          );
        }
      }

      try {
        emitente.comNome(Nfe.nome(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter nome do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitente.comEmail(Nfe.email(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter email do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comLogradouro(Nfe.logradouro(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter logradouro do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comMunicipio(Nfe.emitente().municipio());
      } catch (error) {
        console.log(
          "APP --> Erro ao obter municipio do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comNumero(Nfe.numero(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter numero do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comComplemento(Nfe.complemento(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter complemento do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comBairro( Nfe.bairro(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter bairro do Emitente da nota - (PDF Maker)"
        );
      }

      try {
        emitenteEndereco.comUf(Nfe.uf(view));
      } catch (error) {
        console.log(
          "APP --> Erro ao obter uf do Emitente da nota - (PDF Maker)"
        );
      }

      if (emitenteEndereco) emitente.comEndereco(emitenteEndereco);



      /* -----------------------  DESTINATARIO ------------------------ */
      var destinatario = new Destinatario();
      var enderecoDestinatario = new Endereco();


      try {
        destinatario.comNome(Nfe.dest_nome(view));
      }catch (error) {
        console.log("Erro ao obter nome do Destinatário da nota - (PDF Maker)");
      }

      try {
        destinatario.comRegistroNacional( Nfe.destinatario().inscricaoNacional());
      } catch (error) {
        if (error)
          console.log("APP --> Emitente inexistente - CPF/CNPJ não encontrado - (PDF Maker)");
      }

      try {
        destinatario.comTelefone(formatacoes.telefone(Nfe.dest_fone(view)));
      } catch (error) {
        if (error) {
          console.log("APP --> Erro ao obter numero de telefone do Destinatário da nota - (PDF Maker)");
        }
      }

      try {
        var nfeInscricaoEstadualdestinatario = Nfe.destinatario().inscricaoEstadual();
        if (!nfeInscricaoEstadualdestinatario == "ISENTO") {
          nfeInscricaoEstadualdestinatario = formatacoes.inscricao_estadual(
            nfeInscricaoEstadualdestinatario
          );
        }
        destinatario.comInscricaoEstadual(nfeInscricaoEstadualdestinatario);
      } catch (error) {
        nfeInscricaoEstadualdestinatario = false;
        console.log("APP --> Erro ao coletar do xml a InscricaoEstadual do Destinatario da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comLogradouro(Nfe.dest_logradouro(view));
      }catch (error) {
        console.log("Erro ao obter logradouro do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comNumero(Nfe.dest_numero(view));
      }catch (error) {
        console.log("Erro ao obter numero do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comComplemento(Nfe.dest_complemento(view));
      }catch (error) {
        console.log("Erro ao obter complemento do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comBairro(Nfe.dest_bairro(view));
      }catch (error) {
        console.log("Erro ao obter bairro do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comMunicipio(Nfe.dest_municipio(view));
      }catch (error) {
        console.log("Erro ao obter municipio do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comCidade(Nfe.dest_cidade(view));
      }catch (error) {
        console.log("Erro ao obter cidade do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comUf(Nfe.dest_uf(view));
      }catch (error) {
        console.log("Erro ao obter UF do Destinatário da nota - (PDF Maker)");
      }

      try {
        enderecoDestinatario.comCep(Nfe.dest_cep(view));
      }catch (error) {
        console.log("Erro ao obter CEP do Destinatário da nota - (PDF Maker)");
      }


      //const nfeEmailDestinatario = Nfe.dest_email(view); //verificar se em alguma nota existe
      if (enderecoDestinatario) destinatario.comEndereco(enderecoDestinatario);

      /* -----------------------  TRANSPORTADOR ------------------------ */
      var transportador = new Transportador();
      var enderecoTransportador = new Endereco();

      try {
        transportador.comNome(Nfe.transportador().nome());
      } catch (error) {
        console.log(
          "APP --> Erro ao coletar do xml o Nome do Transportador - (PDF Maker)"
        );
      }

      try {
        transportador.comInscricaoEstadual(
          Nfe.transportador().inscricaoEstadual()
        );
      } catch (error) {
        console.log(
          "APP --> Erro ao coletar do xml a Inscricao Estadual do Transportador - (PDF Maker)"
        );
      }

      try {
        enderecoTransportador.comLogradouro(Nfe.transportador().logradouro());
      } catch (error) {
        console.log(
          "APP --> Erro ao coletar do xml o Logradouro do Transportador - (PDF Maker)"
        );
      }

      try {
        enderecoTransportador.comMunicipio(Nfe.transportador().municipio());
      } catch (error) {
        console.log(
          "APP --> Erro ao coletar do xml o Municipio do Transportador - (PDF Maker)"
        );
      }

      try {
        enderecoTransportador.comUf(Nfe.transportador().uf());
      } catch (error) {
        console.log(
          "APP --> Erro ao coletar do xml a UF do Transportador - (PDF Maker)"
        );
      }

      //endereço do transportador
      if (enderecoTransportador) transportador.comEndereco(enderecoTransportador);

      try {
          transportador.comRegistroNacional( Nfe.transportador().inscricaoNacional());
      } catch (error) {
        if (error)
          console.log("APP --> Transpostador inexistente - CPF/CNPJ não encontrado - (PDF Maker)");
      }


      /* -----------------------  PROTOCOLO ------------------------ */
      var protocolo = new Protocolo();

      try {
        protocolo.comCodigo(Nfe.protocolo(view));
      } catch (error) {
        if (error) console.log("APP --> Código de protocolo não encontrado - (PDF Maker)");
      }

      try {
        protocolo.comData(Nfe.dataHoraRecebimento(view));
      } catch (error) {
        if (error) console.log("APP --> Data e hora de protocolo não encontrados  - (PDF Maker)");
      }


      /* -----------------------  IMPOSTOS  ------------------------ */
      var impostos = new Impostos();

      try {
        impostos.comBaseDeCalculoDoIcms(Nfe.totalIcmsNota().baseCalculoIcms());
      } catch (error) {
        if (error) console.log("APP --> base do calculo icms de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorDoIcms(Nfe.totalIcmsNota().valorIcms());
      } catch (error) {
        if (error) console.log("APP --> valor icms de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comBaseDeCalculoDoIcmsSt(Nfe.totalIcmsNota().baseCalculoIcmsST());
      } catch (error) {
        if (error) console.log("APP --> base icmsst de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorDoIcmsSt(Nfe.totalIcmsNota().valorIcmsST());
      } catch (error) {
        if (error) console.log("APP --> valor icmsst de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorDoImpostoDeImportacao(Nfe.totalIcmsNota().valorII(view));
      } catch (error) {
        if (error) console.log("APP --> valor imposto importação de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorDoPis(Nfe.totalIcmsNota().valorPIS());
      } catch (error) {
        if (error) console.log("APP --> valor pis de imposto não encontrado  - (PDF Maker)");
      }
      try {
        impostos.comValorTotalDoIpi(Nfe.totalIcmsNota().valorIPI());
      } catch (error) {
        if (error) console.log("APP --> valor pis de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorDaCofins(Nfe.totalIcmsNota().valorCOFINS());
      } catch (error) {
        if (error) console.log("APP --> valor pis de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comBaseDeCalculoDoIssqn("-");
      } catch (error) {
        if (error) console.log("APP --> valor pis de imposto não encontrado  - (PDF Maker)");
      }

      try {
        impostos.comValorTotalDoIssqn(Nfe.servico(view));
      } catch (error) {
        if (error) console.log("APP --> valor pis de imposto não encontrado  - (PDF Maker)");
      }


      /* -----------------------  VOLUMES  ------------------------ */
      var volumes = new Volumes();

      try {
        volumes.comQuantidade(Nfe.quantidadeVolumes(view));
      } catch (error) {
        if (error) console.log("APP --> quantidade de volume não encontrado  - (PDF Maker)");
      }

      try {
        volumes.comEspecie(Nfe.especie(view));
      } catch (error) {
        if (error) console.log("APP --> especie de volume não encontrado  - (PDF Maker)");
      }

      try {
        volumes.comMarca(Nfe.marca(view));
      } catch (error) {
        if (error) console.log("APP --> marca pis de volume não encontrado  - (PDF Maker)");
      }

      try {
        volumes.comNumeracao(Nfe.numeracao(view));
      } catch (error) {
        if (error) console.log("APP --> valor pis de volume não encontrado  - (PDF Maker)");
      }

      try {
          var pesobruto = Nfe.pesoBruto(view)
          if(pesobruto) pesobruto = formatacoes.numero(pesobruto)
        volumes.comPesoBruto(pesobruto);
      } catch (error) {
        if (error) console.log("APP --> comPesoBruto pis de volume não encontrado  - (PDF Maker)");
      }

      try {
          var pesoliquido = Nfe.pesoLiquido(view)
          if(pesoliquido) pesoliquido = formatacoes.numero(pesoliquido)
        volumes.comPesoLiquido(pesoliquido);
      } catch (error) {
        if (error) console.log("APP --> comPesoLiquido pis de volume não encontrado  - (PDF Maker)");
      }


      /* -----------------------  DANFE  ------------------------ */
      var danfe = new Danfe();

        try {
            danfe.comTipo(Nfe.operacao());
        } catch (error) {
            if (error) console.log("APP --> tipo operação de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comNaturezaDaOperacao(Nfe.naturezaOperacao());
        } catch (error) {
            if (error) console.log("APP --> natureza de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comNumero(Nfe.nrNota());
        } catch (error) {
            if (error) console.log("APP --> numero nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comSerie(Nfe.serie());
        } catch (error) {
            if (error) console.log("APP --> série de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comDataDaEmissao(Nfe.dataEmissao());
        } catch (error) {
            if (error) console.log("APP --> data emissão nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comDataDaEntradaOuSaida(Nfe.dataEntradaSaida());
        } catch (error) {
            if (error) console.log("APP --> data entrada ou saída emissão nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comModalidadeDoFrete(Nfe.modalidadeFreteTexto());
        } catch (error) {
            if (error) console.log("APP --> modalidade frete emissão nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comInscricaoEstadualDoSubstitutoTributario( Nfe.inscricaoEstadualST());
        } catch (error) {
            if (error) console.log("APP --> inscrição estadual substituto tributário nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comInformacoesComplementares(Nfe.informacoesComplementares());
        } catch (error) {
            if (error) console.log("APP --> informações complementares nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comValorTotalDaNota(Nfe.totalIcmsNota().valorNota());
        } catch (error) {
            if (error) console.log("APP --> valor total da nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comValorTotalDosProdutos(Nfe.totalIcmsNota().valorProdutos());
        } catch (error) {
            if (error) console.log("APP --> valor total dos produtos da nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comValorTotalDosServicos(Nfe.valorTotalServicoNaoIncidente());
        } catch (error) {
            if (error) console.log("APP --> valor total servico não incidente da nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comValorDoFrete(Nfe.totalIcmsNota().valorFrete());
        } catch (error) {
            if (error) console.log("APP --> total icms nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comValorDoSeguro(Nfe.totalIcmsNota().valorSeguro());
        } catch (error) {
            if (error) console.log("APP --> valor do seguro da nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comDesconto(Nfe.totalIcmsNota().valorDesconto());
        } catch (error) {
            if (error) console.log("APP --> desconto da nota de DANFE não encontrado  - (PDF Maker)");
        }

        try {
            danfe.comOutrasDespesas(Nfe.totalIcmsNota().valorOutrasDespesas());
        } catch (error) {
            if (error) console.log("APP --> outras despesas da nota de DANFE não encontrado  - (PDF Maker)");
        }



      /* ---- configurações gerais danfe ---- */
      try {
        danfe.comChaveDeAcesso(Nfe.chave());
      } catch (error) {
        if (error) console.log("APP --> comPesoLiquido pis de volume não encontrado  - (PDF Maker)");
      }

      danfe.comEmitente(emitente);
      danfe.comDestinatario(destinatario);
      danfe.comTransportador(transportador);
      danfe.comProtocolo(protocolo);
      danfe.comImpostos(impostos);
      danfe.comVolumes(volumes);


      for (var i = 1; i <= Nfe.nrItens(); i++) {
        danfe.adicionarItem(
          new Item()
            .comCodigo(Nfe.item(i).codigo())
            .comDescricao(Nfe.item(i).descricao())
            .comNcmSh(Nfe.item(i).ncm())
            .comOCst(Nfe.item(i).origem() + Nfe.item(i).cst())
            .comCfop(Nfe.item(i).cfop())
            .comUnidade(Nfe.item(i).unidadeComercial())
            .comQuantidade(Nfe.item(i).quantidadeComercial())
            .comValorUnitario(Nfe.item(i).valorUnitario())
            .comValorTotal(Nfe.item(i).valorProdutos())
            .comBaseDeCalculoDoIcms(Nfe.item(i).baseCalculoIcms())
            .comValorDoIcms(Nfe.item(i).valorIcms())
            .comValorDoIpi(Nfe.item(i).valorIPI())
            .comAliquotaDoIcms(Nfe.item(i).porcentagemIcms())
            .comAliquotaDoIpi(Nfe.item(i).porcentagemIPI()) //caso exista valor do ipi informar a tag xml aqui
        );
      }

      new Gerador(danfe).gerarPDF(
        {
          ambiente: "producao", //homologacao
          ajusteYDoLogotipo: -4,
          ajusteYDaIdentificacaoDoEmitente: 4,
          creditos: "Escritório Mezommo https://mezzomo.cnt.br/",
        },
        async function (error, pdf) {
          if (error) {
            console.log(`APP --> - (PDF Maker) - ${error}`);
          } else {
            console.log("APP ===> Gerando PDF de  Nota Fiscal Localmente");
            callback(null, await getStream.buffer(pdf));
          }
            /*
                pdf.pipe(fs.createWriteStream(path.join(__dirname, `pdfpelomezzapp.pdf`)));
            */
        }
      );
    }
  },
};
