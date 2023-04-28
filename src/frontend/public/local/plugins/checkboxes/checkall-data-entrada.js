//PEGA O ID DOS ITENS MARCADOS-----------------------------------------------
var ids = [];
function marcados(temp) {
  ids = [];

  $('#mytable :checkbox:checked').each(function (index) {
    var currentRow = this.parentNode.parentNode.parentNode.parentNode;
    var closestTr = currentRow.getElementsByTagName("td")[1];
    //var a = closestTr.className.textContent;
    if (typeof closestTr !== "undefined") {
      ids.push(closestTr.textContent);
      console.log("ids: ", ids);
    }

  });
}
//SELECIONAR TODOS OS CHECK BOXs VISIVEIS
function marcartodos() {
  // experimentar com o ".each"
  $("#checkall").each(function () {
    console.log("$(this: ", $(this))
    $(".form-check-input:visible").prop("checked", $(this).prop("checked"))
    if (checkall.checked == true) {
      marcados();
    }
  })
}

//DESMARCA TODOS OS CHECKBOXs
function desmarcartodos() {
  $('input[type="checkbox"]:checked').prop('checked', false);
  marcados();
}
//QUANDO MUDAR A PAGINA DA TABELA DESMARCAR TODOS OS CHECKBOXES
$('#mytable').on('page.dt', function () {
  desmarcartodos()
}).on('search.dt', function () {
  desmarcartodos()
});
