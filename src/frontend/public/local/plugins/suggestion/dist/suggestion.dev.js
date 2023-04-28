"use strict";

//PREVINE QUE O ENTER EXECUTE O FORMULARIO /importnotas
//PREVINE QUE O ENTER EXECUTE O FORMULARIO /importnotas
$('#form_busca').on('keyup keypress', function (e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode === 13) {
    e.preventDefault();
    return false;
  }
});
document.addEventListener("keypress", function (e) {
  if (e.key === 'Enter') {
    if ($('#nomeBuscadoNotas').val()) {
      $('#form_busca').submit();
    }
  }
});
document.querySelector("#nomeBuscadoNotas").addEventListener("keyup", handleKeyUp);
var time = null;
var textinput = "";

function handleKeyUp(event) {
  var keyCode = event.keyCode || event.which;

  if (keyCode != 39) {
    if (keyCode != 37) {
      if (keyCode != 40) {
        if (keyCode != 38) {
          if (keyCode != 13) {
            clearTimeout(time);
            time = setTimeout(function () {
              //textinput = event.target.value
              //post_sugestions(textinput);
              if (suggestions_nomepj) {
                get_sugestions(suggestions_nomepj);
              }
            }, 200);
          }
        }
      }
    }
  }
}
/*
async function post_sugestions(nomepj) {
    await $.post({
        url: '/suggestions',
        data: {
            'nomepj': nomepj
        },
        dataType: 'json',
        function(data) {
            return data;
            //get_sugestions(data)
        }
    }).then(get_sugestions)
}
*/
//console.log("foooooooooo: ", nomepj);


function get_sugestions(suggestions_nomepj) {
  //console.log("recebi o json: ", suggestions_nomepj)
  var arraySuggestions = suggestions_nomepj; //var nomepjexistente = JSON.stringify(buffer);

  var selectedSuggestionIndex = -1;
  var searchInput = document.querySelector('#nomeBuscadoNotas'); //console.log("filter texto: ", searchInput.value);

  var suggestionsPanel = document.querySelector('#suggestions_span');

  function resetSelectedSuggestion() {
    for (var i = 0; i < suggestionsPanel.children.length; i++) {
      suggestionsPanel.children[i].classList.remove('selected');
    }
  }

  suggestionsPanel.classList.add('show');
  var input = searchInput.value;
  suggestionsPanel.innerHTML = ''; //const suggestions = arraySuggestions.filter(function (data) {
  //consoleconsole.log("nomepj? ", arraySuggestions[0].Nome_Pj_Emitente)
  //    return data[0].Nome_Pj_Emitente.toLowerCase().indexOf(input.toLowerCase()) > -1;
  //});

  var suggestions = arraySuggestions.filter(function (el) {
    return el.cliente.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }); // Nome_Pj_Emitente.toLowerCase(input.toLowerCase());

  suggestions.forEach(function (suggested) {
    var div = document.createElement('div');
    div.innerHTML = suggested.cliente;
    div.setAttribute('class', 'suggestion');
    suggestionsPanel.appendChild(div);
  });

  if (input === '') {
    suggestionsPanel.innerHTML = '';
  }

  searchInput.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowDown') {
      resetSelectedSuggestion();
      selectedSuggestionIndex = selectedSuggestionIndex < suggestionsPanel.children.length - 1 ? selectedSuggestionIndex + 1 : suggestionsPanel.children.length - 1;

      if (suggestionsPanel.children[selectedSuggestionIndex]) {
        suggestionsPanel.children[selectedSuggestionIndex].classList.add('selected');
      }

      return;
    }

    if (e.key === 'ArrowUp') {
      resetSelectedSuggestion();
      selectedSuggestionIndex = selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : 0;

      if (suggestionsPanel.children[selectedSuggestionIndex]) {
        suggestionsPanel.children[selectedSuggestionIndex].classList.add('selected');
      }

      return;
    }

    if (e.key === 'Enter') {
      if (suggestionsPanel.children[selectedSuggestionIndex]) {
        searchInput.value = suggestionsPanel.children[selectedSuggestionIndex].textContent;
        /* O innerHTML estava 'transformando' '&' em '&amp;' o dado era enviado errado para o backend, textContent resolveu o problema */
        //searchInput.value = suggestionsPanel.children[selectedSuggestionIndex].innerHTML;

        suggestionsPanel.classList.remove('show');
        selectedSuggestionIndex = -1;
        $('#form_busca').submit();
      }

      return;
    }
  }); //Substituido pela estrutura a baixo

  /*
  document.addEventListener('click', function (e) {
      if (e.target.className === 'suggestion') {
          console.log("CLICado ==>>", e.target.innerHTML)
          searchInput.value = e.target.innerHTML;
          suggestionsPanel.classList.remove('show');
      }
  });
  */

  var optionsSuggestions = document.getElementsByClassName('suggestion');

  for (var i = 0; i < optionsSuggestions.length; i++) {
    optionsSuggestions[i].addEventListener('click', function (e) {
      searchInput.value = e.target.innerHTML;
      suggestionsPanel.classList.remove('show');
    });
  }
}