//____________________________________DOCUMENT READY_________________________________________
$(document).ready(function () {
  //-------------------------------------------------------------------DEFINIÇPÇÕES DA TABELA
  $('#tabela-aprovar').DataTable({
    fixedHeader: {
      header: true,
      footer: true
    },
    dom: 'Blftip',
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
    },
    columnDefs: [{
      orderable: true,
      targets: 0,
    }],
    order: [[0, 'asc']]
  });
  //_________________________________________________________________________________________x

  //___________________________________BOTÃO EDITAR_____________________________________________
  //---------------------------------------------------------------------OUVINTE DO BOTÃO EDITAR
  $(document).on('click', '#editar_linha_tbl', function (e) {
    e.preventDefault;
    var id_linha = $(this).closest('tr').find('td[data-id]').data('id');
    var descricao_item_linha = $(this).closest('tr').find('td[data-descricao]').data('descricao');
    var ncm_linha = $(this).closest('tr').find('td[data-ncm]').data('ncm');
    var mva_7_linha = $(this).closest('tr').find('td[data-mva_7]').data('mva_7');
    var mva_12_linha = $(this).closest('tr').find('td[data-mva_12]').data('mva_12');
    var tipo_antecipado_linha = $(this).closest('tr').find('td[data-tipo_antecipado]').data('tipo_antecipado');

    var cst_icms = $(this).closest('tr').find('td[data-cst_icms]').data('cst_icms');
    var csosn_icms = $(this).closest('tr').find('td[data-csosn_icms]').data('csosn_icms')
    var ali_icms_saidainterna = $(this).closest('tr').find('td[data-ali_icms_saidainterna]').data('ali_icms_saidainterna');
    var ali_icms_saidaexterna = $(this).closest('tr').find('td[data-ali_icms_saidaexterna]').data('ali_icms_saidaexterna');
    var cst_piscofins = $(this).closest('tr').find('td[data-cst_piscofins_saida]').data('cst_piscofins_saida');
    var natureza_receita_monofasico_aliqzero = $(this).closest('tr').find('td[data-natureza_receita_monofasico_aliqzero]').data('natureza_receita_monofasico_aliqzero');

    $('#id_modal').val(id_linha);
    $('#descricao_modal').val(descricao_item_linha);
    $('#ncm_linha_modal').val(ncm_linha);
    $('#mva_7_modal').val(mva_7_linha);
    $('#mva_12_linha_modal').val(mva_12_linha);
    $('#tipo_antecipado_modal').val(tipo_antecipado_linha);

    //não estamos usando
    $('#cst_icms').val(cst_icms)
    $('#csosn_icms').val(csosn_icms)
    $('#ali_icms_saidaint').val(ali_icms_saidainterna)
    $('#ali_icms_saidaext').val(ali_icms_saidaexterna)
    $('#cst_pis').val(cst_piscofins_saida)
    $('#natur_rec').val(natureza_receita_monofasico_aliqzero)

    //$(this).attr("placeholder", "Type your answer here");
    $('#EditModal_Aprovar').modal('show');
  });

  $("#update_form_pendente").submit(function (event) {
    event.preventDefault(); //prevent default action
    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = $(this).serialize(); //Encode form elements for submission
    console.log(form_data);
    $.ajax({
      async: "false",
      url: post_url,
      type: request_method,
      data: form_data
    }).done(function (response) { //
      //$("#server-results").html(response);
      var gif = "";
      if (response == "Dados atualizados!") {
        gif = "success";
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
        reloadPage();
      }, 2000);
    });
  });
  //----------------------------------------------------------------------------------------x

  //____________________________________BOTÃO VALIDAR_______________________________________
  //--------------------------------------------------------------AJAX POST DO BOTÃO VALIDAR
  $(document).on('click', '#validar_linha_tbl', function (e) {
    e.preventDefault;
    const id_linha_validei = $(this).closest('tr').find('td[data-id]').data('id');
    console.log("id", id_linha_validei);
    const validei_flag = 1;
    $.ajax({
      async: "false",
      url: "/gerenciar/update-validar-pendente",
      type: "post",
      data: { id_linha_validei, valido_flag: validei_flag }
    }).done(function (response) { //
      //$("#server-results").html(response);
      var gif = "";
      if (response == "Linha Validada!") {
        gif = "success";
      }
      if (response == "Erro ao validar!") {
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
        //modal_hide();
        reloadPage();
      }, 2000);
    });
  });
  //-----------------------------------------------------------------OUVINTE DO BOTÃO VALIDAR
 // $(document).on('click', '#validar_linha_tbl', function (e) {
  //  e.preventDefault;
  //  var id = $(this).closest('tr').find('td[data-id]').data('id');
  //  console.log("id", id);
 // });
  //________________________________________________________________________________________x


  //___________________________________FUNÇÕES DIVERSAS______________________________________

  //-------------------------------------------------------------------------------MODAL HIDE
  function modal_hide() {
    $('#EditModal').modal('hide')
  }
  //----------------------------------------------------------------------RECARREGA A PÁGINA
  function reloadPage() {
    location.reload(true);
  }
  //--------------------------------------------------------------------MASK PARA FORMULÁRIOS
  jQuery(function ($) {
    $("#datamodal").mask("99/99/9999", { placeholder: "DD/MM/AAAA" });
  });

});
//________________________________________________________________________________________x