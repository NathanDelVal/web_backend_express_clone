$("#update-notas-dataentrada_form").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission


  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    //$("#server-results").html(response);

      var gif = "";
    if (response == "Data de Entrada atualizada!") {
      gif = "success"
    }
    if (response == "Erro ao gravar dados, tente novamente.") {
      gif = "warning"
    }
    Swal.fire({
      position: 'center',
      icon: gif,
      title: response,
      showConfirmButton: false,
      timer: 2000
    });
    setTimeout(function () {
      modal_data_hide();
      btnbusca_trigger();
  }, 2000);
  });
});



$("#update-notas-difaliquota_form").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    //$("#server-results").html(response);
    var gif = "";
    if (response == "Diferêncial de Alíquota atualizado!") {
      gif = "success"
    }
    else if (response == "Diferênciais de Alíquota atualizados!") {
      gif = "success"
    }
    else if (response == "Erro ao gravar dados, tente novamente.") {
      gif = "warning"
    }
    Swal.fire({
      position: 'center',
      icon: gif,
      title: response,
      showConfirmButton: false,
      timer: 2000
    });
    setTimeout(function () {
      modal_aliq_hide();
      btnbusca_trigger();
  }, 2000);
  });
});





$("#update-notas-devolvidas_form").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    //$("#server-results").html(response);
    var gif = "";
    if (response == "Status Nota Fiscal Devolvida atualizado com sucesso!") {
      gif = "success"
    }
    if (response == "Status Notas Fiscais Devolvidas atualizados com sucesso!") {
      gif = "success"
    }
    if (response == "Erro ao gravar dados, tente novamente.") {
      gif = "warning"
    }
    Swal.fire({
      position: 'center',
      icon: gif,
      title: response,
      showConfirmButton: false,
      timer: 2000
    });
    setTimeout(function () {
      modal_aliq_hide();
      btnbusca_trigger();
  }, 2000);
  });
});




$("#update-retorna-para-aprovacao_form").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    //$("#server-results").html(response);
    var gif = "";
    if (response == "Nota eviada para aprovação com sucesso!") {
      gif = "success"
    }
    if (response == "Notas eviadas para aprovação com sucesso!") {
      gif = "success"
    }
    if (response == "Erro ao gravar dados, tente novamente.") {
      gif = "warning"
    }
    Swal.fire({
      position: 'center',
      icon: gif,
      title: response,
      showConfirmButton: false,
      timer: 2000
    });
    setTimeout(function () {
      modal_aliq_hide();
      btnbusca_trigger();
  }, 2000);
  });
});







//-------------------------------MODAL HIDE
function modal_data_hide() {
  $('#ModalalterarData').modal('hide')
}
function modal_aliq_hide() {
  $('#ModalalterarAliquota').modal('hide')
}
//-----------------------------------------

//-------------------------BTNBUSCA TRIGGER
function btnbusca_trigger() {
  $("#btnbusca").trigger("click");
}
//-----------------------------------------
