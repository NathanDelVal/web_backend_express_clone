// --------------- adiciona no filtro a nova opção adicionada após o ajax ter acontecido 
async function addNewTicketFilter(nome, cor) {

    //Atualiza a variável local userEtiquetas
    userEtiquetas[nome] = cor
    $("#nf_etiquetas").append(`<option value="${nome}" style="background-color:${cor}" >${nome}</option>`).selectpicker('refresh')
}

async function addNewTicketTable() {
    //Reload options dos selects do corpo da tabela
    setOptionsEtiquetasOffline(userEtiquetas)
}

//insere uma nova etiqueta no mongodb 
$("#inserirSuggestionEtiqueta").submit(function (e) {
    e.preventDefault();

    //uncomment to be optimistic
    /*
    var novo_nome = $("#nome_etiqueta").val()
            var nova_cor = document.getElementById("cor_etiqueta").value;
            addNewTicketFilter(novo_nome, nova_cor)
            addNewTicketTable(novo_nome, nova_cor)
    */

    var post_url = $(this).attr("action");
    var request_method = $(this).attr("method");
    var form_data = $(this).serialize();
    $.ajax({
        url: post_url,
        type: request_method,
        data: form_data
    }).done(function (response) {
        if (response.msg == "Nova etiqueta inserida com sucesso") {

            //comment when optimistic
            addNewTicketFilter(response.etiqueta, response.cor)
            addNewTicketTable()

            document.getElementById("inserirSuggestionEtiqueta").reset();
            $('#modal_add_tag').modal('hide')
            //$('#form_busca').submit()


            setOptionsEtiquetasOffline(userEtiquetas)

            //realoadTable(dadosTabelaNotasFiscais)
            //setOptionsEtiquetasOffline()
            //pickerSetSelected()

            //OR
            //$("#btn_buscar").submit()
        }
    })
})

async function setOptionsEtiquetasOffline(userEtiquetas) {
    selectOptions = ''

    if (userEtiquetas) {
        Object.entries(userEtiquetas).forEach(([key, value]) => {
            selectOptions += `<option value="${key}" style="background-color:${value}">${key}</option>`
        });
        setTimeout(() => {
            addSuggetionsToSelectTableBody(selectOptions)
        }, 100)
    }
}

//adicionando options na tabela
async function addSuggetionsToSelectTableBody(selectOptions) {
    $(".dropdown-toggle-suggestions-target").each((index, el) => {
        var count = $(el).children('option').length
        if (count == 1) {
            $(el).append(selectOptions).selectpicker('refresh')
        }
    })
    return true
}


//primeira inicialização da tabela
async function getSuggestionsEtiquetas() {
    var result;
    $.ajax({
        url: '/notas/get-suggestions-etiquetas',
        type: 'GET',
    }).done((response) => {
        userEtiquetas = response
        /*let selectOptions = ''
        if (userEtiquetas) {
            Object.entries(userEtiquetas).forEach(([key, value]) => {
                selectOptions += `<option value="${key}" style="background-color:${value}">${key}</option>`
            });

            setTimeout(() => {
                addSuggetionsToSelectTableBody(selectOptions)
            }, 100)
        } else {
            result = false
        }
        */
    })
    if (result) return result
}



//---------------------------------------------- AINDA NÃO REFATORADO----------------------------------------------
async function realoadTable(data) {
    if (data) {
        $("#mytable").DataTable().clear().rows.add(data).draw()
        buttonBackgroudColor()
    }
}







/* atribui o valor do select com o valor da inicialização da tabela */
async function pickerSetSelected() {
    setTimeout(() => {
        $(".dropdown-toggle-suggestions-target").each(function (index, el) {
            let value = $(el).data('tagvalue')
            if (value) {
                $(el).val(value).selectpicker('refresh')
            }
        })
        //setOptionsEtiquetasOffline()
        buttonBackgroudColor()
    }, 500)
}

const renderEtiquetasDataTables = function (data, type, row) {
    if (data == null) {
        data = 'Selecionar'
    }
    var selectPicker = ""
    selectPicker = '<div class="areaSelectTableBody" data-row="' + row + '">' +
        '</div>'

    /* colocar os dados da tabela para refresh após vir do banco*/
    if (type === 'display') {
        return selectPicker
    } else {
        return data;
    }

    //item = '<select onchange="updateEtiqueta(this, this.value,\'' + row.chavedeacesso + '\')" value="' + data + '" class="custom-select form-control selectpicker dropdown-toggle-suggestions-target">'

    /*
    Object.entries(userEtiquetas).forEach(function (nomeEt, corEt) {
        if (nomeEt == data) {
            if (corEt == "#eeeeee") {
                item = '<select onchange="updateEtiqueta(this, this.value, \'' + row.chavedeacesso + '\')" value="' + data + '" class="custom-select form-control selectpicker dropdown-toggle-suggestions-target">'
            } else {
                item = '<select onchange="updateEtiqueta(this, this.value, \'' + row.chavedeacesso + '\')" value="' + data + '" class="custom-select form-control selectpicker dropdown-toggle-suggestions-target">'
            }
        }
    })*/
    //
}




function rowReloadTicketColor(element, tag) {
    //Update button color according to ticket name
    var tagIcon = '<i class="material-icons tag-icon">sell</i>'

    if (userEtiquetas) {
        //console.log('cores:', userEtiquetas)
        var color = userEtiquetas[tag]
        if (color) {
            if (color == "#eeeeee") {
                $(element).next("button").attr('style', 'color: #272727 !important').css('background', color)
            } else {
                $(element).next("button").attr('style', 'color: #ffff !important').css('background', color)
            }
        }
    }
}



async function verificarExistentes() {
    $(".dropdown-toggle-suggestions-target").each((index, el) => {
        var conteudo = $(el).children().next('button').length

    })
}


async function buttonBackgroudColor() {
    setTimeout(() => {
        $('.btn.dropdown-toggle.btn-light').each((index, el) => {
            var descricaoiBtn = $(el).children().children().children().text()
            var tagIcon = '<i class="material-icons tag-icon">sell</i>'
            if (userEtiquetas) {
                var color = userEtiquetas[descricaoiBtn]
                if (color) {
                    if (color == "#eeeeee") {
                        $(el).attr("style", "color: #272727 !important").css('background', color)
                    } else {
                        $(el).attr("style", "color: #ffff !important").css('background', color)
                    }
                }
            }
        })
    }, 100)
}



$('#selecionarEtiqueta').attr('disabled', true).selectpicker('refresh')
//Setar etiqueta aos itens com o checkbox selecionado
function updateEtiquetaForSelected(elem) {
    let elemId = $(elem).attr('id')
    //console.log('ssssssss ', elemId)
    let selectedOption = $(`#${elemId} option:selected`)

    var tag = $(elem).val()
    var color = $(selectedOption).css("background-color")
    updateEtiqueta(elem, tag, ids)


    if (tag && color) {
        if (ids.length > 0) {
            setTimeout(() => {
                $('#form_busca').submit()
                //voltar o select para selecionar
                $(elem).val('')
                $(`#${elemId}`).parent().next('button').css('background', '')
                $(elem).selectpicker('refresh')
            }, 1000)
        }

    }
}


