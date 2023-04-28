//____________________________________DOCUMENT READY_________________________________________
$(document).ready(function () {
  //-------------------------------------------------------------------DEFINIÇPÇÕES DA TABELA
  $('#tabela-NCM').DataTable({
    fixedHeader: {
      header: true,
      footer: true
    },
    dom: 'Blfrtip',
    buttons: [
      { extend: 'excel', text: 'Exportar' }
    ],
    pagingType: "full_numbers",
    lengthMenu: [
      [20, 25, 50, -1],
      [20, 25, 50, "Todos "]
    ],
    responsive: false,
    language: {
      "url": "../assets/js/plugins/dataTables.ptbr.lang",
      search: "_INPUT_",
      searchPlaceholder: "",
    },
    columnDefs: [{
      orderable: false,
      targets: [0, 1, 8]
    }],
    order: [[3, 'asc']]
  });
  //_________________________________________________________________________________________x

//___________________________________BOTÃO EDITAR__________________________________________
//----------------------------------------------------------OUVINTE DO BOTÃO EDITAR - MODAL
$(document).on('click', '#editar_linha_tbl', function (e) {
  e.preventDefault;
  const id_linha = $(this).closest('tr').find('td[data-id]').data('id');
  const descricao_linha = $(this).closest('tr').find('td[data-descricao]').data('descricao');
  const capitulo_linha = $(this).closest('tr').find('td[data-capitulo]').data('capitulo');
  const ncm_linha = $(this).closest('tr').find('td[data-ncm]').data('ncm');
  const mva_7_linha = $(this).closest('tr').find('td[data-mva_7]').data('mva_7');
  const mva_12_linha = $(this).closest('tr').find('td[data-mva_12]').data('mva_12');
  const tipo_antecipado_linha = $(this).closest('tr').find('td[data-tipo_antecipado]').data('tipo_antecipado');
  $('#id_modal').val(id_linha);
  $('#descricao_modal').val(descricao_linha);
  $('#ncm_linha_modal').val(ncm_linha);
  $('#mva_7_modal').val(mva_7_linha);
  $('#mva_12_linha_modal').val(mva_12_linha);
  //$('#tipo_antecipado_modal').val(tipo_antecipado_linha);
  //$(this).attr("placeholder", "Type your answer here");
  $('#EditModal_RegrasNCM').modal('show');
});

$("#form_update-regras-ncm").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  //console.log("form_data")
  //console.log(form_data);
  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    //$("#server-results").html(response);
    var gif = "";
    if (response == "Dados da tabela NCM atualizados!") {
      gif = "success";
    }
    if (response == "Erro ao gravar novos dados!") {
      gif = "warning";
    }
    Swal.fire({
      position: 'center',
      icon: gif,
      title: response,
      showConfirmButton: false,
      timer: 2000
    });
    setTimeout(function () {
      modal_hide();
      btnbusca_trigger();
    }, 2000);
  });
});
//________________________________________________________________________________________x




//___________________________________BOTÃO EDITAR MULTIPLOS (HEADER TABLE)__________________________________________
  //------------------------------------------------------OUVINTE DO BOTÃO EDITAR MULTIPLOS - MODAL
  $(document).on('click', '#editar_selecionados_tbl', function (ee) {
    ee.preventDefault;
    const flag = "multiplos";
    //console.log("Pdsds");
    const id_linha = itens_selecionados;
    //console.log("PEGUEI OS ITES MARTCADOS: ", itens_selecionados)
    $('#marcados_modal_multiplos').val(id_linha);
    $('#flag_modal_multiplos').val(flag)

    $('#EditModal_RegrasNCM_Multiplos').modal('show');
  });

  $("#form_update-regras-ncm-multiplos").submit(function (event) {
    event.preventDefault(); //prevent default action
    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = $(this).serialize(); //Encode form elements for submission
    //console.log("form_data")
   //console.log(form_data);
    $.ajax({
      async: "false",
      url: post_url,
      type: request_method,
      data: form_data
    }).done(function (response) { //
      //$("#server-results").html(response);
      var gif = "";
      if (response == "Dados da tabela NCM atualizados!") {
        gif = "success";
      }
      if (response == "Erro ao gravar novos dados!") {
        gif = "warning";
      }
      Swal.fire({
        position: 'center',
        icon: gif,
        title: response,
        showConfirmButton: false,
        timer: 2000
      });
      setTimeout(function () {
        modal_hide_multiplos();
        btnbusca_trigger();
      }, 2000);
    });
  });
  //________________________________________________________________________________________x




















//___________________________________FUNÇÕES DIVERSAS______________________________________
//-------------------------------------------------------------------------------MODAL HIDE
function modal_hide() {
  $('#EditModal_RegrasNCM').modal('hide')
}

function modal_hide_multiplos() {
  $('#EditModal_RegrasNCM_Multiplos').modal('hide')
}

//-------------------------------------------------------------------------BTNBUSCA TRIGGER
function btnbusca_trigger() {
  $("#btnbusca-NCM").trigger("click");
}
//--------------------------------------------------------------------MASK PARA FORMULÁRIOS
jQuery(function ($) {
  $("#datamodal").mask("99/99/9999", { placeholder: "DD/MM/AAAA" });
});
});
//________________________________________________________________________________________x