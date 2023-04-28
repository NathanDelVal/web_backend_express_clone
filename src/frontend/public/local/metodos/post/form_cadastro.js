//QUANDO OS INPUTS SOFREREM ALTERAÕES REATIVAR O SUBMIT BUTTON

$('.form-control').bind('input', function() {
    // $(this).val() // get the current value of the input field.
    reativar_btn();
});


//$("#server-results").html(response);

var reativar_btn = function() {
    var btn = document.querySelector('#nextBtn');
    //console.log("btn == ", btn)
    // Restore the button text
    //btn.value = "Cadastrar";
    //btn.classList.remove('disabled');
}

//Habilita botão alterar data se algum check box estiver selecionado
var desativar_btn = function() {
    var btn = document.querySelector('#btn-cadastro');
    btn.classList.add('disabled');
    // Update the button text
    btn.value = "Enviando...";
}