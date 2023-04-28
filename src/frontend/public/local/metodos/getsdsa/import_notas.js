$("#form_busca").submit(function(event) {
    event.preventDefault(); //prevent default action
    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = $(this).serialize(); //Encode form elements for submission

    $.ajax({
        url: post_url,
        type: request_method,
        data: form_data
    }).done(function (response) { //

        var DadosChamados = JSON.parse(response.dataTableChamados)
        console.log("dadosConsulta : ", DadosChamados)

        console.log("data=> ", DadosChamados.id)

        if (DadosChamados.length > 0) {


          /* var tablenotas = tablenotas.draw(true); */

          $('#tableChamadosAbertos').DataTable({
            destroy: true, //retirar essa linha caso você nunca recarregar a tabela
            data: DadosChamados,
            columns: [
              { data: "id" }, //id (hidden)
              { data: "numerochamado" }, //Numero do Chamado
              { data: "assunto" }, //Assunto
              { data: "status" }, //Status
              { data: "inserido" }, //DATA DE ABERTURA - INSERIDO , type: "date-eu"
              {
                "defaultContent": '<button id="tbl_td_btn_editarlinha" name="tbl_td_btn_editarlinha"' +
                  'type="button" rel="tooltip" class="btn btn-warning" disabled>' +
                  '<i class="material-icons">mode_comment</i>' +
                  '</button>'
              } //AÇÕES
            ],
            columnDefs: [
              //{ visible: false, targets: 0 }, //ocultar ID Porém desse modo não conseguiremossalvar o id numa var posteriormente (caso necessario)
              { orderable: false, targets: 0 }
            ],
            order: [[4, 'desc']],

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
              [20, 25, 50, -1],
              [20, 25, 50, "Todos"]
            ],
            responsive: false,
            language: {
              "url": "../assets/js/plugins/dataTables.ptbr.lang",
              search: "_INPUT_",
              searchPlaceholder: "",
            }
          });

        }
        console.log('Ok notas table')


      });
});