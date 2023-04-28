//DROPZONE
var Onyx;

!function ($) {

  "use strict";

  // Global Onyx object
  Onyx = Onyx || {};


  Onyx = {

    /**
   * Fire all functions
   */
    init: function () {
      var self = this,
        obj;

      for (obj in self) {
        if (self.hasOwnProperty(obj)) {
          var _method = self[obj];
          if (_method.selector !== undefined && _method.init !== undefined) {
            if ($(_method.selector).length > 0) {
              _method.init();
            }
          }
        }
      }
    },


    /**
     * Files upload
     */
    userFilesDropzone: {
      selector: 'form.dropzone',
      init: function () {
        var base = this,
          container = $(base.selector);

        base.initFileUploader(base, 'form.dropzone');
      },
      initFileUploader: function (base, target) {
        var previewNode = document.querySelector("#onyx-dropzone-template"), // Dropzone template holder
          warningsHolder = $("#warnings"); // Warning messages' holder
        previewNode.id = "";

        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);

        $('.areaClick').append('<span id="txtarea" class="txtarea">Insira o Certificado Digital aqui</span>')

        var onyxDropzone = new Dropzone(target, {
          autoQueue: false,
          url: ($(target).attr("action")) ? $(target).attr("action") : "insert-cliente",                       // Check that our form has an action attr and if not, set one here
          parallelUploads: 20,
          maxFiles: 20,
          maxFilesize: 25,
          acceptedFiles: ".p12",
          previewTemplate: previewTemplate,
          previewsContainer: "#previews",
          clickable: ".fileinput-button, .areaClick",                                                                     // Define the element that should be used as click trigger to select files.
          createImageThumbnails: true,
          dictDefaultMessage: "Arraste e solte aqui seus arquivos XML.",                                      // Default: Drop files here to upload
          dictFallbackMessage: "Seu navegador não suporta upload por arrastar e soltar.",                     // Default: Your browser does not support drag'n'drop file uploads.
          dictFileTooBig: "O arquivo é muito grande ({{filesize}}MiB). Tamanho máximo: {{maxFilesize}}MiB.",  // Default: File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.
          dictInvalidFileType: "Você não pode fazer upload desse tipo de arquivo, apenas XML.",               // Default: You can't upload files of this type.
          dictResponseError: "O servidor respondeu com o código {{statusCode}}.",                             // Default: Server responded with {{statusCode}} code.
          dictCancelUpload: "Cancelar envio",                                                                 // Default: Cancel upload
          dictUploadCanceled: "Envio cancelado.",                                                             // Default: Upload canceled.
          dictCancelUploadConfirmation: "Você tem certeza que deseja cancelar o envio?",                      // Default: Are you sure you want to cancel this upload?
          dictRemoveFile: "Remover arquivo",                                                                  // Default: Remove file
          dictRemoveFileConfirmation: null,                                                                   // Default: null
          dictMaxFilesExceeded: "Você não pode enviar tantos arquivos de uma vez.",                           // Default: You can not upload any more files.
          dictFileSizeUnits: { tb: "TB", gb: "GB", mb: "MB", kb: "KB", b: "b" },

        });

        Dropzone.autoDiscover = false;

        onyxDropzone.on("addedfile", function (file) {
          //COLOCANDO ICONE DE ARQUIVOS
          var ext = file.name.split('.').pop();
          if (ext == "p12") {
            $('.areaClick').empty().append('<div id="iconArea"class="thumb-container"><center><img style="width: 50px; height: 50px; display: flex;" src="../images/icon/certificado_ico_b.svg" data-dz-thumbnail /> <span><center style="font-size: 8pt;"> ' + file.name + ' <span> </div>')
          } else { $('.areaClick').empty().append('<span style="font-size: 10pt;>Insira um certificado P12</span>') }

        });

        onyxDropzone.on("totaluploadprogress", function (progress) {

          var progr = document.querySelector(".progress .determinate");

          if (progr === undefined || progr === null) return;

          progr.style.width = progress + "%";
        });

        onyxDropzone.on('dragenter', function () {
          $(target).addClass("hover");
        });

        onyxDropzone.on('dragleave', function () {
          $(target).removeClass("hover");
        });

        onyxDropzone.on('drop', function () {
          $(target).removeClass("hover");
        });

        onyxDropzone.on('addedfile', function () {

          // Remove no files notice
          $(".no-files-uploaded").slideUp("easeInExpo");


        });

        onyxDropzone.on("success", function (file, response) {

          //console.log("response: ", response)
          //console.log("foi executado ou não ?")
          if (response.length > 0) {
            var gif = "";
            if (response == "Cliente inserido com sucesso!") {
              gif = "success";
            }
            if (response == "Clientes inseridos com sucesso!") {
              gif = "success";
            }
            if (response == "Erro ao inserir novo cliente. Tente Novamente!") {
              gif = "waning";
            }
            if (response == "Erro ao inserir novos clientes. Tente Novamente!") {
              gif = "waning";
            }
            if (response == "Você não possui as permissões necessárias!") {
              gif = "waning";
            }

            Swal.fire({
              position: 'center',
              icon: gif,
              title: response,
              showConfirmButton: false,
              timer: 2000
            });
            setTimeout(function () {
              modal_hide_Multiplos();
              reloadPage();
            }, 2000);

            onyxDropzone.removeAllFiles(true); //LIMPAR FILES PREVIEW

          } else {
            var gif = "warning";
            var msg_warning = "Erro ao se comunicar com o servidor, tente novamente";

            Swal.fire({
              position: 'center',
              icon: gif,
              title: msg_warning,
              showConfirmButton: false,
              timer: 0
            })

          }
        });


        document.querySelector("#actions .cancel").onclick = function () {
          onyxDropzone.removeAllFiles(true);
          $('.areaClick').empty().append('<span id="txtarea" class="txtarea">Insira o Certificado Digital aqui</span>')
        };

        //TRIGGER DE ENVIO DE TODOS OS ARQUIVOS
        document.querySelector("#actions .start").onclick = function () {


          var inputs = document.getElementById('form_inserir_empresas');
          console.log("inputs >> ", inputs)
          console.log("testando 0 ", inputs[0].value)
          console.log("testando 1", inputs[1].value)
          console.log("testando 2", inputs[2].value)
          console.log("testando 3", inputs[3].value)
          console.log("testando 4", inputs[4].value)
          console.log("testando 5", inputs[5].value)

          var verifyInputs = [];
          var inputCHECKBOX = []
          inputCHECKBOX.push(inputs[6].checked)
          inputCHECKBOX.push(inputs[7].checked)
          var inputCHECKED = []


          for (var x = 0; x <= 4; x++) {
            if (inputs[x].value == "") {
              verifyInputs.push(x)
            }
          }

          for (var y = 0; y < inputCHECKBOX.length; y++) {
            if (inputCHECKBOX[y] == true) {
              inputCHECKED.push(y)

            }
          }

          console.log("blz")
          console.log("inputCHECKED.length : ", inputCHECKED.length)
          console.log("verifyInputs.length : ", verifyInputs.length)

          if (verifyInputs.length > 0 && inputCHECKED.length >= 0) {

            Swal.fire({
              position: 'center',
              icon: 'info',
              title: 'Preencha todos os campos antes de enviar',
              showConfirmButton: false,
              timer: 2000
            });

          } else if (verifyInputs.length == 0 && inputCHECKED.length > 0) {

            onyxDropzone.enqueueFiles(onyxDropzone.getFilesWithStatus(Dropzone.ADDED));

            let timerInterval
            Swal.fire({
              title: 'Enviando...',
              html: '<b></b>',
              timer: 2000,
              timerProgressBar: true,
              willOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                  const content = Swal.getContent()
                  if (content) {
                    const b = content.querySelector('b')
                    if (b) {
                      b.textContent = Swal.getTimerLeft()
                    }
                  }
                }, 100)
              }
            })


          }

        };



      },
      dropzoneCount: function () {
        var filesCount = $("#previews > .dz-success.dz-complete").length;
        return filesCount;
      },
      fileType: function (fileName) {
        var fileType = (/[.]/.exec(fileName)) ? /[^.]+$/.exec(fileName) : undefined;
        return fileType[0];
      }
    }
  }

  $(document).ready(function () {
    Onyx.init();
  });

}(jQuery);
//DROPZONE