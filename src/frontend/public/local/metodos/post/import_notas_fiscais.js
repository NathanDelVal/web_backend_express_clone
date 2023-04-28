$(document).ready(function() {
    var collapsedGroups = {};
    $("#form_busca").submit(function(e) {
        e.preventDefault(); //prevent default action
        var post_url = $(this).attr("action"); //get form action url   /importnotas
        var request_method = $(this).attr("method"); //get form GET/POST method
        var form_data = $(this).serialize(); //Encode form elements for submission
        showLoading();

        $.ajax({
            url: post_url,
            type: request_method,
            data: form_data
        }).done(function(response) {
            hideLoading();
            let cardTitleNode = document.getElementById('cardTitle'); //Atribui o titulo do card 2 (CARD DA TABELA)
            cardTitleNode.textContent = (response.nomeBuscadoNotas);
            var dadosTabelaNotas = JSON.parse(response.datasend)
                //console.log("dadosTabelaNotas:", dadosTabelaNotas)
            if (dadosTabelaNotas.length > 0) {

                tablenotas = $('#mytable').DataTable({
                    destroy: true,
                    deferRender: true,
                    data: dadosTabelaNotas,
                    columns: [{
                            defaultContent: '<div class="form-check">' +
                                '<label class="form-check-label">' +
                                '<input name="checkbox" class="form-check-input bodycheckbox" type="checkbox" value="" onchange="marcados(this.checkbox)">' +
                                '<span class="form-check-sign">' +
                                '<span class="check"></span>' +
                                '</span>' +
                                '</label>' +
                                '</div>'
                        }, //CHECKBOXES 
                        { data: "id_nota" },

                        {
                            data: 'chavedeacesso',
                            render: function(data, type, row) {
                                return '<button type="button" onclick="getByRowChavedeAcesso(\'' + row.chavedeacesso + '\')" class="btn pull-right">' +
                                    '<i class="material-icons">visibility</i>' +
                                    '</button>'
                            }
                        },
                        { data: "numero_nota" },
                        { data: "cnpj_emitente" },
                        { data: "valor_nf" },
                        { data: "data_emissao", type: "date-eu" }, //data de abertura - inserido , type: "date-eu"
                        { data: "status" },
                        { data: "tag" },
                        { data: "chavedeacesso" },
                        { data: "cnpj_emitente" },
                        { data: "inscricao_estadual_emitente" },
                        { defaultContent: "2000/12/12" },
                        //{ data: "data_entrada", type: "date-eu" },
                        { data: "origem" },
                        { data: "modelo_doc" },
                        { data: "serie_nota" },
                        { data: "data_entrada" },
                        { data: "uf_origem" },
                        { data: "uf_destino" },
                        { data: "protocolada" }
                    ],
                    columnDefs: [
                        { orderable: false, targets: [0, 1, 2] },
                        { targets: 2, className: "td-actions" },
                        //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
                        { sClass: "hideIdTable", "aTargets": [1] } //id visivelmente oculto (presente)
                    ],
                    //aoColumnDefs: [{
                    //}],
                    processing: true,
                    order: [
                        [4, 'desc']
                    ],
                    fixedHeader: {
                        header: false,
                        footer: false
                    },
                    select: {
                        style: 'os',
                        items: 'cell'
                    },
                    dom: 'Blfrtip',
                    buttons: [
                        {
                            extend: 'excel',
                            text: 'Exportar'
                        },

                        {
                            extend: 'collection',
                            text: '<i class="material-icons">download</i>',
                            buttons: [{
                                    text: 'XML',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                },
                                {
                                    text: 'PDF',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                }
                            ]
                        },

                        {
                            extend: 'collection',
                            text: 'Periodo',
                            className: 'dropdown',
                            background: false,
                            buttons: [{
                                    text: 'Mês Atual',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                },
                                {
                                    text: 'Mês Anterior',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                },
                                {
                                    text: 'Ano Atual',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                },
                                {
                                    text: 'Ano Anterior',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                },
                                {
                                    text: 'Total',
                                    /*action: function ( ) {
                                        açao do clique
                                    }*/
                                }

                            ]
                        },
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
                    },



                    rowCallback: function(row, data) {
                        //Função que Habilita os botões de AÇÕES ao clicarem em qualquer checkbox do tbody
                        var element = $(row).find('.form-check-input');
                        element.on("change", function() {
                            //Habilita os botões de AÇÕES
                            $("button[name='btnalterardata']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnalteraliquota']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnnotadevolvida']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnretornarprovacao']").prop('disabled', !$("input[name='checkbox']:checked").length);


                        });

                    },
                });

            } else {
                if (tablenotas) {
                    tablenotas.clear().draw()
                }
            }
            $("#rowCard2").removeClass('hideRowCard')

            $('#mytable tbody').on('click', 'tr.group-start', function() {
                var numero = $(this).data('numero');
                collapsedGroups[numero] = !collapsedGroups[numero];
                tablenotas.draw(false);
            });
            //Função que Habilita os botões de AÇÕES ao clicarem marcar todos (Check box Thead)
            $('#checkall').on('click', function() {
                $("button[name='btnalterardata']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnalteraliquota']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnnotadevolvida']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnretornarprovacao']").prop('disabled', !$(this).prop("checked"));
            });


        });
    });
});