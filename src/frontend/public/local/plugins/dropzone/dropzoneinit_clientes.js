//DROPZONE


!function ($) {

    "use strict";

    // Global Onyx object
    var Onyx = Onyx || {};


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

                var onyxDropzone = new Dropzone(target, {
                    autoQueue: false,
                    url: ($(target).attr("action")) ? $(target).attr("action") : "/gerenciar/insert-cliente",                       // Check that our form has an action attr and if not, set one here
                    parallelUploads: 20,
                    maxFiles: 1,
                    init: function () {
                        this.on("maxfilesexceeded", function (file) {
                            this.removeAllFiles();
                            this.addFile(file);
                        });
                    },
                    maxFilesize: 1,
                    acceptedFiles: ".p12",
                    previewTemplate: previewTemplate,
                    previewsContainer: "#previews",
                    clickable: ".fileinput-button, .files-container",                                                                     // Define the element that should be used as click trigger to select files.
                    createImageThumbnails: true,
                    dictDefaultMessage: "Insira o Certificado Digital aqui",                                      // Default: Drop files here to upload
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
                        $('.dz-message').empty().append('<div class="thumb-container"><center><img style="width: 60px; height: 60px; display: flex;" src="../images/icon/certificado_ico_b.svg" data-dz-thumbnail /> <span><center style="font-size: 8pt;"> ' + file.name + ' <span> </div>')
                    } else { $('.dz-message').empty().append('<span style="font-size: 10pt;>Insira um certificado P12</span>') }

                    //$('.preview-container').css('visibility', 'visible');
                    //file.previewElement.classList.add('type-' + base.fileType(file.name)); // Add type class for this element's preview

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

                    console.log("reSUCESSO?sponse: ", response)
                    //console.log("foi executado ou não ?")
                    if (response.length > 0) {
                        //console.log("ENTREI")
                        var gif = ""
                        if (response == "Processando Nota(s), aguarde...") {
                            gif = "info"
                        }

                        if (response == "Ops! Não foi possível enviar as notas, tente novamente.") {
                            gif = "warning"
                        }
                        let timerInterval;
                        Swal.fire({
                            position: 'center',
                            icon: gif,
                            title: response,
                            html: ' <b></b> ',
                            showConfirmButton: false,
                            timer: timedelayreq,
                            timerProgressBar: true,
                            onBeforeOpen: () => {
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
                            },
                            onClose: () => {
                                clearInterval(timerInterval)
                            }
                        });
                        onyxDropzone.removeAllFiles(true); //LIMPAR FILES PREVIEW
                    }
                });

                document.querySelector("#actions .cancel").onclick = function () {
                    onyxDropzone.removeAllFiles(true);
                };



                // Setup the buttons for all transfers
                // The "add files" button doesn't need to be setup because the config
                // `clickable` has already been specified.
                var timedelayreq;
                //TRIGGER DE ENVIO DE TODOS OS ARQUIVOS + AJAX QUE VERIFICA STATUS DO PYTHON
                document.querySelector("#actions .start").onclick = function () {
                    onyxDropzone.enqueueFiles(onyxDropzone.getFilesWithStatus(Dropzone.ADDED));
                    var nomesdasnotas = []
                    for (var i = 0; i < onyxDropzone.files.length; i++) {
                        nomesdasnotas.push(onyxDropzone.files[i].name)
                    }
                    timedelayreq = (onyxDropzone.files.length * 1000);
                    //console.log("timedelayreq: ", timedelayreq)


                    // verifica seoarquivo chegoun no servidor de fato
                    window.setTimeout(function () {
                        //var namenotas = "";
                        //console.log("AJAX Enviando nomes da notas", nomesdasnotas)
                        //AJAX PYTHON
                        $.ajax({
                            async: "false",
                            url: "/antecipados/statusnotapy",
                            type: "get",
                            data: {
                                Nnota: nomesdasnotas,
                            }
                            //data: form_data
                        }).done(function (response) {
                            //console.log("RESPONSE CHEGOU: ", response)


                            if (response.length > 0) {
                                var gif = "warning"
                                var msg_erro = "As notas abaixo não puderam ser processadas"

                                Swal.fire({
                                    position: 'center',
                                    width: 800,
                                    icon: gif,
                                    title: msg_erro,
                                    html: '<ul id="notaserror"></ul>',
                                    showConfirmButton: false,
                                    timer: 0
                                })

                                showErros(response)
                            } else {
                                var gif = "success";
                                var msg_success = "Nota(s) processada(s) com Sucesso!";

                                Swal.fire({
                                    position: 'center',
                                    icon: gif,
                                    title: msg_success,
                                    showConfirmButton: false,
                                    timer: 0
                                })
                            }
                        });
                    }, timedelayreq)

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