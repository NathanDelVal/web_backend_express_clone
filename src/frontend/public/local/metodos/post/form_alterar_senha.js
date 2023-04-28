const redirectURL = async(url, time) => {
    setTimeout(function() {
        window.location.replace(url);
    }, time)
}

$("#form-alterar-senha").submit(function(event) {
    event.preventDefault(); //prevent default action
    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = $(this).serialize(); //Encode form elements for submission
    desativar_btn();
    $.ajax({
        url: post_url,
        type: request_method,
        data: form_data
    }).done(function(response) { //
        console.log(response)

        var {msg, status, error} = response;

        var btn = document.querySelector('#btn-salvar');
        btn.value = "Enviado";

        var gif = "warning";
        var tempURL = window.location.origin;
        let url = `${tempURL + '/acesso'}`;

        if (msg == "Senha alterada com sucesso!") {
            gif = "success"
        }

        if(error) gif = 'warning';
       
       
        Swal.fire({
            customClass: {
                confirmButton: 'btn btn-black',
            },
            position: 'center',
            icon: gif,
            title: msg,
            showConfirmButton: true,
            timer: 0
        }).then(() => {
            redirectURL(url, 100)
        })

    });
});



//QUANDO OS INPUTS SOFREREM ALTERAÕES REATIVAR O SUBMIT BUTTON
$('.form-control').bind('input', function() {
    // $(this).val() // get the current value of the input field.
    reativar_btn();
});

//$("#server-results").html(response);
var reativar_btn = function() {
    var btn = document.querySelector('#btn-salvar');
    // Restore the button text
    btn.value = "Salvar";
    btn.classList.remove('disabled');
}

//Habilita botão alterar data se algum check box estiver selecionado
var desativar_btn = function() {
    var btn = document.querySelector('#btn-salvar');
    btn.classList.add('disabled');
    // Update the button text
    btn.value = "Salvando...";
}