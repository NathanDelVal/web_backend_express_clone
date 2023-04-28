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
            console.log("ids marcados(): ", ids);
        }

    });
}
//SELECIONAR TODOS OS CHECK BOXs VISIVEIS
function marcartodos() {
    ids = [];
    // experimentar com o ".each"
    $("#checkall").each(function () {
        console.log("Marcando todos checkeboxes do body... ")
        $(".bodycheckbox").prop("checked", $(this).prop("checked"))


        if (checkall.checked == true) {
            console.log("true")
            $('#mytable :checkbox:checked').each(function (index) {
                var currentRow = this.parentNode.parentNode.parentNode.parentNode;
                var closestTr = currentRow.getElementsByTagName("td")[1];
                $(".bodycheckbox").prop("checked", $(this).prop("checked"))

                if (typeof closestTr !== "undefined") {
                    ids.push(closestTr.textContent);
                }
                console.log("ids nf: ", ids);
            });
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










