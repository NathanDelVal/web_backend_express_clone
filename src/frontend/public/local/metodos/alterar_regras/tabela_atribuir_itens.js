function MarcarItensAtribuir() {
  selecionados_para_atribuir = [];
  console.log("ok até aqui");

  $("#tabela_atribuir_itens :checkbox:checked").each(function (index) {
    var currentRow = this.parentNode.parentNode.parentNode.parentNode;

    var closestTr = currentRow.getElementsByTagName("td")[1];
    console.log("oq ? ", closestTr);

    if (typeof closestTr !== "undefined") {
      selecionados_para_atribuir.push(closestTr.textContent);
    }
  });

  if (selecionados_para_atribuir.length == 0) {
    console.log("Todos itens desmarcados", selecionados_para_atribuir);
  } else {
    console.log(
      "Itens selecionados_para_atribuir = ",
      selecionados_para_atribuir
    );
  }
  //Habilita botão remover  selecionados
  $("button[id='deletar_selecionados_tbl']").prop(
    "disabled",
    !$("input[name='checkbox']:checked").length
  );
}

//SELECIONAR TODOS OS CHECK BOXs VISIVEIS
function marcartodos_itens_atribuir(thisCheckbox) {
  //const actualTableID = $(thisCheckbox).closest('table').attr('id')
  $(checkall_atribuir_itens).each(function () {
    $(checkall_atribuir_itens).prop("checked", $(thisCheckbox).prop("checked"));
    if (checkall_atribuir_itens.checked == true) {
      $('#tabela_atribuir_itens :input[type="checkbox"]:unchecked').prop(
        "checked",
        checkall_atribuir_itens.checked
      );
      MarcarItensAtribuir();
    } else {
      $('#tabela_atribuir_itens :input[type="checkbox"]:checked').prop(
        "checked",
        checkall_atribuir_itens.checked
      );
      MarcarItensAtribuir();
    }
  });
}

//QUANDO MUDAR A PAGINA DA TABELA DESMARCAR TODOS OS CHECKBOXES
$("#tabela_atribuir_itens")
  .on("page.dt", function () {
    desmarcartodos_itens_atribuidos();
  })
  .on("search.dt", function () {
    desmarcartodos_itens_atribuidos();
  });


