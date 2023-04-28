function MarcarItensAtribuidos() {
  selecionados_atribuidos = [];
  $("#tabela_itens_atribuidos :checkbox:checked").each(function (index) {
    var currentRow = this.parentNode.parentNode.parentNode.parentNode;
    var closestTr = currentRow.getElementsByTagName("td")[1];
    //var a = closestTr.className.textContent;
    if (typeof closestTr !== "undefined") {
      selecionados_atribuidos.push(closestTr.textContent);
    }
  });

  if (selecionados_atribuidos.length == 0) {
    console.log("Todos itens desmarcados");
  } else {
    console.log("Itens Ma itens_regra_rcados = ", selecionados_atribuidos);
  }
  //Habilita botãoremover  selecionados
  $("button[id='deletar_selecionados_tbl']").prop(
    "disabled",
    !$("input[name='checkbox']:checked").length
  );
}

function marcartodos_itens_atribuidos(thisCheckbox) {
  const actualTableID = $(thisCheckbox).closest("table").attr("id");
  $(checkall_itens_atribuidos).each(function () {
    $(checkall_itens_atribuidos).prop(
      "checked",
      $(thisCheckbox).prop("checked")
    );
    if (checkall_itens_atribuidos.checked == true) {
      $('#tabela_itens_atribuidos :input[type="checkbox"]:unchecked').prop(
        "checked",
        checkall_itens_atribuidos.checked
      );
      MarcarItensAtribuidos();
    } else {
      $('#tabela_itens_atribuidos :input[type="checkbox"]:checked').prop(
        "checked",
        checkall_itens_atribuidos.checked
      );
      MarcarItensAtribuidos();
    }
  });
}

function desmarcartodos_itens_atribuidos() {
  $('input[type="checkbox"]:checked').prop("checked", false);
  MarcarItensAtribuidos();
}

//QUANDO MUDAR A PAGINA DA TABELA DESMARCAR TODOS OS CHECKBOXES
$("#tabela_regras")
  .on("page.dt", function () {
    desmarcartodos_itens_atribuidos();
  })
  .on("search.dt", function () {
    desmarcartodos_itens_atribuidos();
  });

//Zera selecionados_atribuidos
$("#itens_atribuidos_modal").on("hidden.bs.modal", function () {
  console.log(
    "Modal Atribuidos Fechou, desmarcando itens ",
    selecionados_atribuidos
  );
  selecionados_atribuidos = [];
  $("#checkall_itens_atribuidos").prop("checked", false);
  console.log("Desmarcado com sucesso ", selecionados_atribuidos);
});
