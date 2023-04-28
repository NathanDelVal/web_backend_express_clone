$("#update_form_pendente").submit(function(event) {
    event.preventDefault(); //prevent default action 
    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = $(this).serialize(); //Encode form elements for submission
    console.log("form_data")
    console.log(form_data);
    $.ajax({
        async:"false",
        url: post_url,
        type: request_method,
        data: form_data
    }).done(function(response) { //
        //$("#server-results").html(response);
        alert(response);
        modal_hide();
        reloadPage();
    });
});

  //MODAL HIDE
  function modal_hide(){
    $('#EditModal_Aprovar').modal('hide')
  }

  function reloadPage(){
    location.reload(true);
}