"use strict";

var control = 0;
$('tbody').on('click', 'td:not(:has(*))', function () {
  //console.log("clicado")
  if (control <= 0) {
    var content = $(this).text();
    /*{{!Target}}*/
    //console.log("Conteudo ", content)

    if (content) {
      control++; //console.log(content)

      var tmp = document.createElement('textarea');
      /*{{!creating temp input to save value of target}}*/

      tmp.value = content;
      /*{{!insert value on input}}*/

      tmp.setAttribute('readonly', '');
      /*{{!set attributes}}*/

      tmp.style.position = 'absolute';
      /*{{!style}}*/

      tmp.style.left = '-9999px';
      /*{{!style to not show on page screen}}*/

      document.body.appendChild(tmp);
      /*{{!style}}*/

      tmp.select();
      tmp.setSelectionRange(0, 99999);
      /*{{! For mobile devices }}*/

      document.execCommand('copy');
      /*{{!copy to clipboard}}*/

      $(this).append('<div class="quick-alert-msg quickclipboard">Texto copiado</div>');
      setTimeout(function () {
        var elements2remove = document.getElementsByClassName('quickclipboard');
        Array.prototype.forEach.call(elements2remove, function (el) {
          el.remove();
        });
        control--;
      }, 500);
      document.body.removeChild(tmp);
      /*{{! remove temp input from body}}*/
    }
  }
});
/*
$('tbody').on('click', 'td', function () {
    //console.log("chamei a função de seleção")
    //const element = tabelaAprovar.cell(this)
    //var prevCell = $(this)
    //var prevCellContent = $(this).text()
    //$(this).append('<h6 id="quickclipboard"> <i class="material-icons">save</i> Copiado! </h6>')
    $(this).append('<div class="quick-alert-msg quickclipboard">Texto copiado</div>')

    const content = $(this).data() //Target
    let tmp = document.createElement('textarea'); //creating temp input to save value of target
    tmp.value = content; //insert value on input
    tmp.setAttribute('readonly', ''); //set attributes
    tmp.style.position = 'absolute'; //style
    tmp.style.left = '-9999px'; //style to not show on page screen
    document.body.appendChild(tmp);//style
    tmp.select();
    tmp.setSelectionRange(0, 99999); /* For mobile devices
    document.execCommand('copy'); //copy to clipboard

    setTimeout(function () {
        const elements2remove = document.getElementsByClassName('quickclipboard')
        Array.prototype.forEach.call(elements2remove, function (el) {
            el.remove()
        });
    }, 1000)

    document.body.removeChild(tmp); //remove temp input from body
    //console.log(`${content} copiado!`);
*/