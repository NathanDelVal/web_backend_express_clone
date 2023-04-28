

$("#form_recuperarsenha").submit(function (event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  desativar_btn();

  Swal.fire({ title: 'Por favor aguarde...' })
  Swal.showLoading();

  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { //
    console.log("responseresponse ", response)
    var { msg, status, error } = response
    var gif = "";
    error ? gif = "warning" : "success";
    status ? gif = "success" : "warning";

    Swal.fire({
      position: 'center',
      icon: gif,
      title: msg,
      showConfirmButton: false,
      timer: 2000
    })
    modal_hide();
  });

});


//MODAL HIDE
function modal_hide() {
  $('#ModalRecuperar').modal('hide')
}


//QUANDO OS INPUTS SOFREREM ALTERAÕES REATIVAR O SUBMIT BUTTON
$('.form-control').bind('input', function () {
  // $(this).val() // get the current value of the input field.
  reativar_btn();
});

//$("#server-results").html(response);
var reativar_btn = function () {
  var btn = document.querySelector('#enviar_email');
  // Restore the button text
  btn.value = "Enviar";
  btn.classList.remove('disabled');
}

//Habilita botão alterar data se algum check box estiver selecionado
var desativar_btn = function () {
  var btn = document.querySelector('#enviar_email');
  btn.classList.add('disabled');
  // Update the button text
  btn.value = "Enviando...";
}


