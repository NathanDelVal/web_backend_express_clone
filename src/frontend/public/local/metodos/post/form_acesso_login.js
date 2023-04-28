
$("#formulario_login").submit(function (event) {
  event.preventDefault(); //prevent default action 
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission
  //desativar_btn();

  $.ajax({
    async: "false",
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function (response) { 
    console.log(response)

  
  });
});

/*

//QUANDO OS INPUTS SOFREREM ALTERAÕES REATIVAR O SUBMIT BUTTON
$('.form-control').bind('input', function () {
  // $(this).val() // get the current value of the input field.
  reativar_btn();
});

//$("#server-results").html(response);
var reativar_btn = function () {
  var btn = document.querySelector('#btn-cadastro');
  // Restore the button text
  btn.value = "Cadastrar";
  btn.classList.remove('disabled');
}

//Habilita botão alterar data se algum check box estiver selecionado
var desativar_btn = function () {
  var btn = document.querySelector('#btn-cadastro');
  btn.classList.add('disabled');
  // Update the button text
  btn.value = "Enviando...";
}

*/


