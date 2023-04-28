function visualizarNota(numero, nome) {
    if (numero && nome) {
console.log({ "numero_nota": numero, "cliente": nome })
        $.ajax({
            url: '/antecipados/visualizar-nota',
            type: 'POST',
            data: { "numero_nota": numero, "cliente": nome }
        }).done(function (response) {
            if (response) {
                //console.log('dados da requisição: ', response)
                if (response.danfe == "Nenhuma nota encontrada") {
                    gif = 'warning';
                    Swal.fire({
                        customClass: {
                            confirmButton: 'btn btn-black btn-login',
                        },
                        buttonsStyling: false,
                        position: 'center',
                        icon: gif,
                        title: response.danfe,
                        showConfirmButton: true,
                        timer: 0
                    });
                } else {
                    localStorage.setItem('chave_de_acesso', response.chave_de_acesso)

                    $('#viewer_by_chave_acesso').empty().append(response.danfe)
                    $("#coddebarras_chavedeacesso").JsBarcode(response.chave_de_acesso, {
                        displayValue: false
                    });
                    $('#modal_view_by_chave_acesso').modal('show')
                }
            } else {
                gif = 'warning';
                Swal.fire({
                    customClass: {
                        confirmButton: 'btn btn-black btn-login',
                    },
                    buttonsStyling: false,
                    position: 'center',
                    icon: gif,
                    title: response.danfe,
                    showConfirmButton: true,
                    timer: 0
                });
            }

        })

    }
}

function downloadPDF() {
    let chave_de_acesso = localStorage.getItem('chave_de_acesso')
    if (chave_de_acesso) {
        $.ajax({
            url: '/antecipados/download-pdf',
            type: 'post',
            data: {
                "chave_de_acesso": chave_de_acesso
            },
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 2) {
                        if (xhr.status == 200) {
                            xhr.responseType = "blob";
                        } else {
                            xhr.responseType = "text";
                        }
                    }
                };
                return xhr;
            },
        }).done(function (data) {
            if (data == "Arquivo não encontrado") {
                //sweetalert aqui
            } else {
                //Convert the Byte Data to BLOB object.
                var blob = new Blob([data], {
                    type: "application/octet-stream"
                });
                //Check the Browser type and download the File.
                var isIE = false || !!document.documentMode;
                if (isIE) {
                    window.navigator.msSaveBlob(blob, `${chave_de_acesso}.pdf`);
                } else {
                    var url = window.URL || window.webkitURL;
                    var link = url.createObjectURL(blob);
                    var a = $("<a />");
                    a.attr("download", `${chave_de_acesso}.pdf`);
                    a.attr("href", link);
                    $("body").append(a);
                    a[0].click();
                    $("body").remove(a);
                }
            }
        })
    }
}

function downloadXML() {
    let chave_de_acesso = localStorage.getItem('chave_de_acesso')
    if (chave_de_acesso) {
        $.ajax({
            url: '/antecipados/download-xml',
            type: 'post',
            data: {
                "chave_de_acesso": chave_de_acesso
            },
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 2) {
                        if (xhr.status == 200) {
                            xhr.responseType = "blob";
                        } else {
                            xhr.responseType = "text";
                        }
                    }
                };
                return xhr;
            },
        }).done(function (data) {
            if (data == "Arquivo não encontrado") {
                //sweetalert aqui
            } else {
                //Convert the Byte Data to BLOB object.
                var blob = new Blob([data], {
                    type: "application/xml"
                });
                //Check the Browser type and download the File.
                var isIE = false || !!document.documentMode;
                if (isIE) {
                    window.navigator.msSaveBlob(blob, `${chave_de_acesso}.xml`);
                } else {
                    var url = window.URL || window.webkitURL;
                    link = url.createObjectURL(blob);
                    var a = $("<a />");
                    a.attr("download", `${chave_de_acesso}.xml`);
                    a.attr("href", link);
                    $("body").append(a);
                    a[0].click();
                    $("body").remove(a);
                }
            }
        })
    }
}

function printPDF() {
    let chave_de_acesso = localStorage.getItem('chave_de_acesso')
    if (chave_de_acesso) {
        $.ajax({
            url: '/antecipados/download-pdf',
            type: 'post',
            data: {
                "chave_de_acesso": chave_de_acesso
            },
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 2) {
                        if (xhr.status == 200) {
                            xhr.responseType = "blob";
                        } else {
                            xhr.responseType = "text";
                        }
                    }
                };
                return xhr;
            },
        }).done(function (data) {
            if (data == "Arquivo não encontrado") {
                //sweetalert aqui
            } else {
                //Convert the Byte Data to BLOB object.
                var blob = new Blob([data], {
                    type: "application/octet-stream"
                });
                //Check the Browser type and download the File.
                var isIE = false || !!document.documentMode;
                if (isIE) {
                    window.navigator.msSaveBlob(blob, `${chave_de_acesso}.pdf`);
                } else {
                    var pdfFile = new Blob([data], {
                        type: "application/pdf"
                    });
                    var pdfUrl = URL.createObjectURL(pdfFile);
                    //window.open(pdfUrl);
                    printJS(pdfUrl);
                }
            }
        })
    }
}


$("#btn_imprimir_pdf").on('click', function () {
    printPDF()
})
$("#btn_download_pdf").on("click", function () {
    downloadPDF()
})
$("#btn_download_xml").on("click", function () {
    downloadXML()
})

$(document).ready(function () {
    var collapsedGroups = {};
    var nome_empresa

    $("#form_busca").submit(function (e) {
        e.preventDefault(); //prevent default action
        var post_url = $(this).attr("action"); //get form action url   /importnotas
        var request_method = $(this).attr("method"); //get form GET/POST method
        var form_data = $(this).serialize(); //Encode form elements for submission
        showLoading();

        $.ajax({
            url: post_url,
            type: request_method,
            data: form_data
        }).done(function (response) {
            hideLoading();
            let cardTitleNode = document.getElementById('cardTitle'); //Atribui o titulo do card 2 (CARD DA TABELA)
            cardTitleNode.textContent = (response.nomeBuscadoNotas);

            nome_empresa = cardTitleNode.textContent
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
                    }, //CHECKBOXES //[0]
                    { data: "id_produto" }, //id [1]
                    { data: "descricao_item" },
                    { data: "nome_pj_emitente" }, //[2]
                    { data: "destinatario" }, //[3]
                    { data: "numero" }, //[4]
                    { data: "data_emissao", type: "date-eu" }, //[5]
                    { data: "data_entrada", type: "date-eu" }, //data de abertura - inserido , type: "date-eu"
                    { data: "uf_origem" },
                    { data: "ean" },
                    { data: "ncm" },
                    { data: "cest" },
                    { data: "cfop" },
                    { data: "unidade" },
                    { data: "valor_bruto" },
                    { data: "mva_7" },
                    { data: "mva_12" },
                    { data: "tipo_antecipado" },
                    { data: "cst_icms" },
                    { data: "csosn_icms" },
                    { data: "cst_piscofins_entrada" },
                    { data: "cst_piscofins_saida" },
                    { data: "natureza_receita_monofasico_aliqzero" },
                    { data: "diferencial_de_aliquota" },
                    { data: "nf_devolvida" }
                    ],
                    columnDefs: [{
                        orderable: false,
                        targets: [0]
                    },
                    //{ visible: false, targets: 1 }, //ocultar coluna ID desse modo não teremos id no corpo da tabela > solução abaixo
                    { sClass: "hideIdTable", "aTargets": [1] } //id visivelmente oculto (presente)
                    ],
                    //aoColumnDefs: [{
                    //}],
                    processing: true,

                    fixedHeader: {
                        header: false,
                        footer: false
                    },
                    select: {
                        style: 'os',
                        items: 'cell'
                    },
                    dom: 'Blfrtip',
                    buttons: [{
                        extend: 'excel',
                        text: 'Exportar'
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
                    orderFixed: [5, 'asc'],
                    rowGroup: {
                        // Uses the 'row group' plugin
                        dataSrc: "numero",
                        startRender: function (rows, group) {
                            var collapsed = !!collapsedGroups[group];
                            rows.nodes().each(function (r) {
                                r.style.display = collapsed ? 'none' : '';
                            });

                            // Add category name to the <tr>. NOTE: Hardcoded colspan
                            return $('<tr/>')
                                .append('<td colspan="24" style="background-color: #333; color: white; text-align: left!important;">' +
                                    '<button type="button" onclick="visualizarNota(\'' + group + '\',\'' + nome_empresa + '\')" class="btn pull-right td-actions" style="margin-right: 95.99%!important; padding: 5px; margin: 0;">' +
                                    '<i class="material-icons">visibility</i>' +
                                    '</button>' +
                                    'NFe: ' + group + ' (' + rows.count() + ')</td>')
                                .attr('data-numero', group)
                                .toggleClass('collapsed', collapsed);
                        }
                    },
                    rowCallback: function (row, data) {
                        //Função que Habilita os botões de AÇÕES ao clicarem em qualquer checkbox do tbody
                        var element = $(row).find('.form-check-input');
                        element.on("change", function () {
                            //Habilita os botões de AÇÕES
                            $("button[name='btnalterardata']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnalteraliquota']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnnotadevolvida']").prop('disabled', !$("input[name='checkbox']:checked").length);
                            $("button[name='btnretornarprovacao']").prop('disabled', !$("input[name='checkbox']:checked").length);
                        });
                    },
                    initComplete: function (settings, json) {
                        setTimeout(function(){
                        // Enable TFOOT scoll bars
                        $('.dataTables_scrollFoot').css('overflow', 'auto');

                        $('.dataTables_scrollHead').css('overflow', 'auto');

                        // Sync TFOOT scrolling with TBODY
                        $('.dataTables_scrollFoot').on('scroll', function () {
                            $('.dataTables_scrollBody').scrollLeft($(this).scrollLeft());
                        });

                        $('.dataTables_scrollHead').on('scroll', function () {
                            $('.dataTables_scrollBody').scrollLeft($(this).scrollLeft());
                        });
                    }, 1000)

                    }

                });


            } else {
                if (tablenotas) {
                    tablenotas.clear().draw()
                }
            }
            $("#rowCard2").removeClass('hideRowCard')

            $('#mytable tbody').on('click', 'tr.group-start', function () {
                var numero = $(this).data('numero');
                collapsedGroups[numero] = !collapsedGroups[numero];
                tablenotas.draw(false);
            });
            //Função que Habilita os botões de AÇÕES ao clicarem marcar todos (Check box Thead)
            $('#checkall').on('click', function () {
                $("button[name='btnalterardata']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnalteraliquota']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnnotadevolvida']").prop('disabled', !$(this).prop("checked"));
                $("button[name='btnretornarprovacao']").prop('disabled', !$(this).prop("checked"));
            });




        });
    });
});