//____________________________________DOCUMENT READY_________________________________________
$(document).ready(function() {
    //-------------------------------------------------------------------DEFINIÇPÇÕES DA TABELA
    $.ajax({
        url: "/gerenciar/get-tabela-regras",
        type: "GET",
    }).done(function(response) {
        if (response.length > 0) {
            let dadosTabela = response;
            //console.log("done = ", dadosTabela)
            var tablenotas = $("#tabela_regras").DataTable({
                destroy: true, //retirar essa linha caso você nunca recarregar a tabela
                deferRender: true,
                data: dadosTabela,
                columns: [
                    { data: "id_regra" },
                    { data: "descricao" }, //numero do chamado
                    { data: "data_inicio" }, //assunto
                    { data: "numero_decreto" }, //status
                    { data: "mva_7_antigo" }, //data de abertura - inserido , type: "date-eu"
                    { data: "mva_12_antigo" },
                    { data: "tipo_antecipado_antigo" },
                    { data: "mva_7_novo" }, //data de abertura - inserido , type: "date-eu"
                    { data: "mva_12_novo" },
                    { data: "tipo_antecipado_novo" },
                    { data: "cst_icms_antigo" },
                    { data: "cst_icms_novo" },
                    { data: "csosn_antigo" },
                    { data: "csosn_novo" },
                    { data: "cst_piscofins_entrada_antigo" },
                    { data: "cst_piscofins_entrada_novo" },
                    { data: "cst_piscofins_saida_antigo" },
                    { data: "cst_piscofins_saida_novo" },
                    { data: "natureza_antigo" },
                    { data: "natureza_novo" },
                    { data: "regra_anterior" },
                    { data: "status" },
                    {
                        defaultContent: '<button id="editar_linha_tbl" name="editar_linha_tbl" type="button" rel="tooltip" class="btn btn-warning">' +
                            '<i class="material-icons">edit</i>' +
                            "</button> " +
                            '<button id="itens_atribuidos_linha_tbl" name="itens_atribuidos_linha_tbl" type="button" rel="tooltip" class="btn">' +
                            '<i class="material-icons">list_alt</i>' +
                            "</button> " +
                            '<button id="atribuir_itens_linha_tbl" name="atribuir_itens_linha_tbl" type="button" rel="tooltip" class="btn btn-success">' +
                            '<i class="material-icons">fact_check</i>' +
                            "</button> ",
                    },
                ],
                columnDefs: [
                    { orderable: false, targets: [0, 22] },
                    { targets: 22, className: "td-actions" },
                    { targets: 0, className: "deixarNegrito text-center" },
                    {
                        targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                        className: "text-center",
                    },
                    //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
                    //{ sClass: "hideIdTable", "aTargets": [1] } //id visivelmente oculto (presente)
                ],
                //aoColumnDefs: [{
                //}],
                processing: true,

                order: [
                    [0, "desc"]
                ],

                fixedHeader: {
                    header: false,
                    footer: false,
                },
                dom: "Blfrtip",
                buttons: [{ extend: "excel", text: "Exportar" }],
                pagingType: "full_numbers",
                lengthMenu: [
                    [50, 100, 1000, -1],
                    [50, 100, 1000, "Todos"],
                ],
                responsive: false,
                language: {
                    url: "../assets/js/plugins/dataTables.ptbr.lang",
                    search: "_INPUT_",
                    searchPlaceholder: "",
                },
            });
        }
    });
    //_________________________________________________________________________________________x

    //___________________________________BOTÃO ATRIBUIR ITENS__________________________________________
    $(document).on("click", "#atribuir_itens_linha_tbl", function(e) {
        e.preventDefault;

        const currentRow = $(this).closest("tr").find("td");
        table_id_linha = currentRow[0].innerHTML;
        document.getElementById(
            "id_regra_atribuir_itens"
        ).innerHTML = table_id_linha;

        $("#atribuir_itens_modal").modal("show");
    });
    //__________________________________________________________________________________________

    //SALVAR BUTTON SUBMIT - DELETE
    $("#form_busca_atribuir").submit(function(e) {
        e.preventDefault();
        var post_url = $(this).attr("action");
        var request_method = $(this).attr("method");
        var form_data = $(this).serialize();

        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            if (response.length > 0) {
                let dadosTabela = response;
                tableAtribuirItens = $("#tabela_atribuir_itens").DataTable({
                    destroy: true,
                    deferRender: true,
                    data: dadosTabela,
                    columns: [{
                            defaultContent: '<div class="form-check">' +
                                '<label class="form-check-label">' +
                                '<input name="checkbox" class="form-check-input" type="checkbox" value="" ' +
                                'onchange="MarcarItensAtribuir(this.checkbox)">' +
                                '<span class="form-check-sign">' +
                                '<span class="check"></span>' +
                                "</span>" +
                                "</label>" +
                                "</div>",
                        },
                        { data: "id_produto" },
                        { data: "descricao_item" },
                        { data: "ncm" },
                        { data: "mva_7" },
                        { data: "mva_12" },
                        { data: "tipo_antecipado" }, //data de abertura - inserido , type: "date-eu"
                        { data: "cst_icms" },
                        { data: "csosn_icms" },
                        { data: "cst_piscofins_entrada" },
                        { data: "cst_piscofins_saida" },
                        { data: "natureza_receita_monofasico_aliqzero" },
                        {
                            defaultContent: "",
                        },
                    ],
                    columnDefs: [
                        { targets: 7, className: "td-actions text-center" },
                        { targets: [0, 2, 3, 4, 5, 6, 7], className: "text-center" },
                        { orderable: false, targets: [0, 7] },
                        //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
                        { sClass: "hideIdTable", aTargets: [1] }, //id visivelmente oculto (presente)
                    ],
                    //aoColumnDefs: [{
                    //}],
                    processing: true,

                    order: [
                        [1, "desc"]
                    ],

                    fixedHeader: {
                        header: false,
                        footer: false,
                    },
                    dom: "Blfrtip",
                    buttons: [{ extend: "excel", text: "Exportar" }],
                    pagingType: "full_numbers",
                    lengthMenu: [
                        [50, 100, 1000, -1],
                        [50, 100, 1000, "Todos"],
                    ],
                    responsive: false,
                    language: {
                        url: "../assets/js/plugins/dataTables.ptbr.lang",
                        search: "_INPUT_",
                        searchPlaceholder: "",
                    },
                });
            }
        });
    });
    //_________________________________________________________________________________________x

    /*
      //___________________________________BOTÃO BUSCAR PARAMETROS__________________________________________
      $(document).on('click', '#atribuir_itens_linha_tbl', function (e) {
        e.preventDefault;

        var regraId = document.getElementById("id_regra_atribuir_itens").innerHTML
        console.log("REGRA ATUAL = ", regraId)
        //Construindo tabela e buscando ultimositens atribuidos
        //-------------------------------------------------------------------DEFINIÇPÇÕES DA TABELA

      });
      //__________________________________________________________________________________________

    */

    //___________________________________BOTÃO EDITAR__________________________________________
    $(document).on("click", "#create_regra_th", function(e) {
        e.preventDefault;
        $("#create_regra_modal").modal("show");
    });
    //__________________________________________________________________________________________

    var table_id_linha = 0;
    var table_itens_atribuidos = $("#tabela_itens_atribuidos").DataTable({
        ajax: {
            type: "POST",
            url: "/gerenciar/get-tabela-itens-atribuidos",
            data: function(d) {
                d.id_regra = table_id_linha;
            },
            dataSrc: "",
        },
        columns: [{
                defaultContent: '<div class="form-check">' +
                    '<label class="form-check-label">' +
                    '<input name="checkbox" class="form-check-input" type="checkbox" value="" ' +
                    'onchange="MarcarItensAtribuidos(this.checkbox)">' +
                    '<span class="form-check-sign">' +
                    '<span class="check"></span>' +
                    "</span>" +
                    "</label>" +
                    "</div>",
            },
            { data: "id_produto" },
            { data: "descricao_item" },
            { data: "ncm" },
            { data: "mva_7" },
            { data: "mva_12" },
            { data: "tipo_antecipado" }, //data de abertura - inserido , type: "date-eu"
            {
                defaultContent: '<button id="deletar_linha_tbl" name="deletar_linha_tbl" type="button"' +
                    'rel="tooltip" class="btn btn-danger" onchange="habilitarDelete(this.checkbox)">' +
                    '<i class="material-icons">close</i>' +
                    "</button>",
            },
        ],
        columnDefs: [
            { targets: 7, className: "td-actions text-center" },
            { targets: [0, 2, 3, 4, 5, 6, 7], className: "text-center" },
            { orderable: false, targets: [0, 7] },
            //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
            { sClass: "hideIdTable", aTargets: [1] }, //id visivelmente oculto (presente)
        ],
        //aoColumnDefs: [{
        //}],
        processing: true,

        order: [
            [1, "desc"]
        ],

        fixedHeader: {
            header: false,
            footer: false,
        },
        dom: "Blfrtip",
        buttons: [{ extend: "excel", text: "Exportar" }],
        pagingType: "full_numbers",
        lengthMenu: [
            [50, 100, 1000, -1],
            [50, 100, 1000, "Todos"],
        ],
        responsive: false,
        language: {
            url: "../assets/js/plugins/dataTables.ptbr.lang",
            search: "_INPUT_",
            searchPlaceholder: "",
        },
    });

    //____________________________BOTÃO ITENS ATRIBUIDOS______________________________________
    $(document).on("click", "#itens_atribuidos_linha_tbl", function(e) {
        e.preventDefault;
        const currentRow = $(this).closest("tr").find("td");
        table_id_linha = currentRow[0].innerHTML;
        document.getElementById(
            "id_regra_itens_atribuidos"
        ).innerHTML = table_id_linha;
        //$('#id_regra_itens_atribuidos').val(id_linha)
        console.log("ID DA REGRA = ", currentRow[0].innerHTML);

        table_itens_atribuidos.ajax.reload();

        $("#itens_atribuidos_modal").modal("show");

        /*


    $.ajax({
      url: '/gerenciar/get-tabela-itens-atribuidos',
      type: 'POST',
      data: { id_regra: id_linha }
    }).done(function (response) {
      console.log("LENength = ", response.length)
      if (response.length >= 0) {
        var dadosTabela = response

        var table_itens_atribuidos = $('#tabela_itens_atribuidos').DataTable({
          destroy: true, //retirar essa linha caso você nunca recarregar a tabela
          deferRender: true,
          data: dadosTabela,
          columns: [
            {
              defaultContent:
                '<div class="form-check">' +
                '<label class="form-check-label">' +
                '<input name="checkbox" class="form-check-input" type="checkbox" value="" ' +
                'onchange="marcados(this.checkbox)">' +
                '<span class="form-check-sign">' +
                '<span class="check"></span>' +
                '</span>' +
                '</label>' +
                '</div>'
            },
            { data: "id_produto" },
            { data: "descricao_item" },
            { data: "ncm" },
            { data: "mva_7" },
            { data: "mva_12" },
            { data: "tipo_antecipado" }, //data de abertura - inserido , type: "date-eu"
            {
              defaultContent:
                '<button id="deletar_linha_tbl" name="deletar_linha_tbl" type="button"' +
                'rel="tooltip" class="btn btn-danger">' +
                '<i class="material-icons">close</i>' +
                '</button>'
            }
          ],
          columnDefs: [
            { targets: 7, className: 'td-actions text-center' },
            { targets: [0, 2, 3, 4, 5, 6, 7], className: 'text-center' },
            { orderable: false, targets: [0] },
            //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
            { sClass: "hideIdTable", "aTargets": [1] } //id visivelmente oculto (presente)

          ],
          //aoColumnDefs: [{
          //}],
          processing: true,

          order: [[1, 'desc']],

          fixedHeader: {
            header: false,
            footer: false
          },
          dom: 'Blfrtip',
          buttons: [
            { extend: 'excel', text: 'Exportar' }
          ],
          pagingType: "full_numbers",
          lengthMenu: [
            [50, 100, 1000, -1],
            [50, 100, 1000, "Todos"]
          ],
          responsive: false,
          language: {
            "url": "../assets/js/plugins/dataTables.ptbr.lang",
            search: "_INPUT_",
            searchPlaceholder: "",
          }
        });

  } else {
    console.log("ELSE LENGTH 0) = ", response.length)
  }
  });
  */
    });
    //_______________________________________________________________________________________________

    //___________________________________BOTÃO EDITAR__________________________________________
    //----------------------------------------------------------OUVINTE DO BOTÃO EDITAR - MODAL
    $(document).on("click", "#editar_linha_tbl", function(e) {
        e.preventDefault;
        const currentRow = $(this).closest("tr").find("td");

        const id_regra = currentRow[0].innerHTML;
        const descricao_item_linha = currentRow[1].innerHTML;
        const data_inicio_linha = currentRow[2].innerHTML;
        const numero_decreto_linha = currentRow[3].innerHTML;
        const mva_7_antigo_linha = currentRow[4].innerHTML;
        const mva_12_antigo_linha = currentRow[5].innerHTML;
        const tipo_antecipado_antigo_linha = currentRow[6].innerHTML;
        const mva_7_novo_linha = currentRow[7].innerHTML;
        const mva_12_novo_linha = currentRow[8].innerHTML;
        const tipo_antecipado_novo_linha = currentRow[9].innerHTML;
        const cst_icms_antigo_linha = currentRow[10].innerHTML;
        const cst_icms_novo_linha = currentRow[11].innerHTML;
        const csosn_antigo_linha = currentRow[12].innerHTML;
        const csosn_novo_linha = currentRow[13].innerHTML;
        const cst_piscofins_entrada_antigo_linha = currentRow[14].innerHTML;
        const cst_piscofins_entrada_novo_linha = currentRow[15].innerHTML;
        const cst_piscofins_saida_antigo_linha = currentRow[16].innerHTML;
        const cst_piscofins_saida_novo_linha = currentRow[17].innerHTML;
        const natureza_antigo_linha = currentRow[18].innerHTML;
        const natureza_novo_linha = currentRow[19].innerHTML;
        const regra_anterior_linha = currentRow[20].innerHTML;
        const status_linha = currentRow[21].innerHTML;

        $("#id_regra").val(id_regra);
        $("#descricao_item_linha").val(descricao_item_linha);
        $("#data_inicio_linha").val(data_inicio_linha);
        $("#numero_decreto_linha").val(numero_decreto_linha);

        $("#mva_7_antigo_linha").val(mva_7_antigo_linha);
        $("#mva_7_novo_linha").val(mva_7_novo_linha);

        $("#mva_12_antigo_linha").val(mva_12_antigo_linha);
        $("#mva_12_novo_linha").val(mva_12_novo_linha);

        $("#tipo_antecipado_antigo_linha")
            .val(tipo_antecipado_antigo_linha)
            .selectpicker("refresh");
        $("#tipo_antecipado_novo_linha")
            .val(tipo_antecipado_novo_linha)
            .selectpicker("refresh");
        $("#cst_icms_antigo_linha").val(cst_icms_antigo_linha);
        $("#cst_icms_novo_linha").val(cst_icms_novo_linha);
        $("#csosn_antigo_linha").val(csosn_antigo_linha);
        $("#csosn_novo_linha").val(csosn_novo_linha);
        $("#cst_piscofins_entrada_antigo_linha").val(cst_piscofins_entrada_antigo_linha);
        $("#cst_piscofins_entrada_novo_linha").val(cst_piscofins_entrada_novo_linha);
        $("#cst_piscofins_saida_antigo_linha").val(cst_piscofins_saida_antigo_linha);
        $("#cst_piscofins_saida_novo_linha").val(cst_piscofins_saida_novo_linha);
        $("#natureza_antigo_linha").val(natureza_antigo_linha);
        $("#natureza_novo_linha").val(natureza_novo_linha);
        $("#regra_anterior_linha").val(regra_anterior_linha).selectpicker("refresh");
        $("#status_linha").val(status_linha).selectpicker("refresh");

        $("#update_regra_modal").modal("show");
    });
    //_________________________________________________________________________________________

    //___________________________________BOTÃO DELETAR LINHA - ITEM ATRIBUIDO________________________________
    //----------------------------------------------------------OUVINTE DO BOTÃO DELETE - MODAL
    $(document).on("click", "#deletar_linha_tbl", function(e) {
        e.preventDefault;
        const currentRow = $(this).closest("tr").find("td");
        const id_item_regra = currentRow[1].innerHTML;
        const descricao_item_linha = currentRow[1].innerHTML;

        console.log(' pqp = ', id_item_regra)

        $("#id_regra_delete").val(id_item_regra);
        document.getElementById(
            "showRegraConfimacao"
        ).innerHTML = descricao_item_linha;
        //document.getElementById("showDescricaoConfimacao").innerHTML = descricao_item_linha

        $("#delete_item_regra_modal").modal("show");
    });

    //SALVAR BUTTON SUBMIT - DELETE
    $("#form_delete_item_atribuido").submit(function(e) {
        e.preventDefault();
        var post_url = $(this).attr("action");
        var request_method = $(this).attr("method");
        var form_data = $(this).serialize();

        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            var gif = "";
            if (response == "Item removido da regra com sucesso!") {
                gif = "success";
            }
            if (response == "Erro ao remover item da regra, tente novamente.") {
                gif = "warning";
            }

            Swal.fire({
                position: "center",
                icon: gif,
                title: response,
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(function() {
                modal_hide("#delete_item_regra_modal");
                table_itens_atribuidos.ajax.reload();
            }, 2000);
        });
    });
    //________________________________________________________________________________________x

    //___________________________________BOTÃO DELETAR LINHA - ITENS ATRIBUIDOS______________________________
    //----------------------------------------------------------OUVINTE DO BOTÃO DELETE - MODAL
    $(document).on("click", "#deletar_selecionados_tbl", function(e) {
        e.preventDefault;
        document.getElementById("showRegraConfimacaoMultiplo").innerHTML = $(
            "#id_regra_itens_atribuidos"
        ).text();
        //const currentRow = $(this).closest('tr').find('td');
        //const id_item_regra = currentRow[0].innerHTML
        //const descricao_item_linha = currentRow[1].innerHTML
        //$('#id_regra_delete').val(id_item_regra)
        //document.getElementById("showDescricaoConfimacao").innerHTML = descricao_item_linha
        $("#delete_itens_regra_modal").modal("show");
    });

    //SALVAR BUTTON SUBMIT - DELETE
    $("#form_delete_itens_atribuidos").submit(function(e) {
        e.preventDefault();
        var post_url = $(this).attr("action");
        var request_method = $(this).attr("method");
        var form_data = {
            selecionados_atribuidos: selecionados_atribuidos,
        };

        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            var gif = "";
            if (response == "Itens removidos da regra com sucesso!") {
                gif = "success";
            }
            if (response == "Erro ao remover itens da regra, tente novamente.") {
                gif = "warning";
            }

            Swal.fire({
                position: "center",
                icon: gif,
                title: response,
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(function() {
                modal_hide("#delete_item_regra_modal");
                table_itens_atribuidos.ajax.reload();
            }, 2000);
        });
    });
    //________________________________________________________________________________________x

    //CRIAR REGRA
    $("#form_create_regra").submit(function(e) {
        e.preventDefault();
        var post_url = $(this).attr("action");
        var request_method = $(this).attr("method");
        var form_data = $(this).serialize();

        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            var gif = "";
            if (response == "Regra criada com sucesso!") {
                gif = "success";
            }
            if (response == "Regra já criada anteriormente.") {
                gif = "warning";
            }
            if (response == "Erro ao criar regra, tente novamente.") {
                gif = "error";
            }

            Swal.fire({
                position: "center",
                icon: gif,
                title: response,
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(function() {
                modal_hide("#create_regra_modal");
                reloadPage();
            }, 2000);
        });
    });
    //________________________________________________________________________________________x

    //ALTERAR REGRA
    $("#form_update_regra").submit(function(e) {
        e.preventDefault();
        var post_url = $(this).attr("action");
        var request_method = $(this).attr("method");
        var form_data = $(this).serialize();

        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            var gif = "";
            if (response == "Regra atualizada com sucesso!") {
                gif = "success";
            }
            if (response == "Erro ao atualizar regra, tente novamente.") {
                gif = "error";
            }

            Swal.fire({
                position: "center",
                icon: gif,
                title: response,
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(function() {
                modal_hide("#create_regra_modal");
                reloadPage();
            }, 2000);
        });
    });
    //________________________________________________________________________________________x

    //___________________________________BOTÃO EDITAR MULTIPLOS (HEADER TABLE)__________________________________________
    //------------------------------------------------------OUVINTE DO BOTÃO EDITAR MULTIPLOS - MODAL
    $(document).on("click", "#editar_selecionados_tbl", function(e) {
        e.preventDefault;
        const flag = "multiplos";
        console.log("Pdsds");
        const id_linha = selecionados_itens_regra;
        console.log("PEGUEI OS ITES MARTCADOS: ", selecionados_itens_regra);
        $("#marcados_modal_multiplos").val(id_linha);
        $("#flag_modal_multiplos").val(flag);

        $("#update_regra_modal_Multiplos").modal("show");
    });

    $("#form_update-regras-mva-multiplos").submit(function(event) {
        event.preventDefault(); //prevent default action
        var post_url = $(this).attr("action"); //get form action url
        var request_method = $(this).attr("method");
        var form_data = $(this).serialize();
        console.log("form_data");
        console.log(form_data);
        $.ajax({
            async: "false",
            url: post_url,
            type: request_method,
            data: form_data,
        }).done(function(response) {
            //
            //$("#server-results").html(response);
            var gif = "";
            if (response == "Dados da tabela MVA atualizados!") {
                gif = "success";
            }
            if (response == "Erro ao gravar novos dados!") {
                gif = "warning";
            }
            Swal.fire({
                position: "center",
                icon: gif,
                title: response,
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(function() {
                modal_hide_multiplos();
                reloadPage();
            }, 2000);
        });
    });
    //________________________________________________________________________________________x

    //___________________________________FUNÇÕES DIVERSAS______________________________________
    //-------------------------------------------------------------------------------MODAL HIDE
    var modal_hide = (id_modal) => $(id_modal).modal("hide");

    function modal_hide_multiplos() {
        $("#update_regra_modal_Multiplos").modal("hide");
    }

    //-----------------------------------------------------------------------RECARREGA A PÁGINA
    function reloadPage() {
        location.reload(true);
    }
    //--------------------------------------------------------------------MASK PARA FORMULÁRIOS
    jQuery(function($) {
        $("#datamodal").mask("99/99/9999", { placeholder: "DD/MM/AAAA" });
    });
});
//________________________________________________________________________________________x