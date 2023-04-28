//DROPZONE


! function ($) {

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
                    url: ($(target).attr("action")) ? $(target).attr("action") : "/ged/ged-files-upload", // Check that our form has an action attr and if not, set one here
                    parallelUploads: 20,
                    maxFiles: 20,
                    maxFilesize: 25,
                    acceptedFiles: ".xml,.pdf,image/jpeg,image/png",
                    previewTemplate: previewTemplate,
                    previewsContainer: "#previews",
                    clickable: ".fileinput-button, .files-container", // Define the element that should be used as click trigger to select files.
                    createImageThumbnails: false,
                    dictDefaultMessage: "Arraste e solte aqui seus arquivos XML.", // Default: Drop files here to upload
                    dictFallbackMessage: "Seu navegador não suporta upload por arrastar e soltar.", // Default: Your browser does not support drag'n'drop file uploads.
                    dictFileTooBig: "O arquivo é muito grande ({{filesize}}MiB). Tamanho máximo: {{maxFilesize}}MiB.", // Default: File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.
                    dictInvalidFileType: "Você não pode fazer upload desse tipo de arquivo, apenas XML.", // Default: You can't upload files of this type.
                    dictResponseError: "O servidor respondeu com o código {{statusCode}}.", // Default: Server responded with {{statusCode}} code.
                    dictCancelUpload: "Cancelar envio", // Default: Cancel upload
                    dictUploadCanceled: "Envio cancelado.", // Default: Upload canceled.
                    dictCancelUploadConfirmation: "Você tem certeza que deseja cancelar o envio?", // Default: Are you sure you want to cancel this upload?
                    dictRemoveFile: "Remover arquivo", // Default: Remove file
                    dictRemoveFileConfirmation: null, // Default: null
                    dictMaxFilesExceeded: "Você não pode enviar tantos arquivos de uma vez.", // Default: You can not upload any more files.
                    dictFileSizeUnits: { tb: "TB", gb: "GB", mb: "MB", kb: "KB", b: "b" },

                });

                Dropzone.autoDiscover = false;

                onyxDropzone.on("addedfile", function (file) {
                    $('.preview-container').css('visibility', 'visible');
                    file.previewElement.classList.add('type-' + base.fileType(file.name)); // Add type class for this element's preview

                    //COLOCANDO ICONE DE ARQUIVOS
                    var ext = file.name.split('.').pop();

                    //Os icones agora serão adicionados pelo css Style.css
                    //console.log("tipo == ", ext)

                    if (ext == "xml") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                        //console.log("tentei")
                        //xml_smallii_ico.png
                        //find(".dz-image img")
                    }
                    else if (ext == "pdf") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                    }
                    else if (ext == "jpg") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                    }
                    else if (ext == "png") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                        //Não está ficando visivel pq o proprio dropzone está criando uma previsualização de png
                    }
                    else if (ext == "txt") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                    }
                    else if (ext == "xml") {
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,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");
                    } else{
                        $(file.previewElement).find(".thumb-container img").attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOoAAADqCAYAAACslNlOAAAACXBIWXMAAC4jAAAuIwF4pT92AAAKvElEQVR4nO3dPYgUaR7H8ccbkTFQDIwUxItaMFkRX8JbRVPnMFZmU0VhIwWDuwsEw0VRuGgGTS4RNFWUjTW41cjK3GDMBNFoMdjj38zD1Tzzr7eemer6PfX9gCyOPdXV1fWteuqle3eFOZpMJj+EEP4WQjgwz/lAb1aLovjI4u5uLqFOJpOjIYSV9UgxIouLiz+9e/dulfe8m4W+n3A90v+GEI71/dyYv8XFxaUjR478vra29htvR3t/mcNzrjDUHb2VM2fOLI99IXTRa6iTyWSJ4S7WEWsHfe9RL/X8fBg2Ym2p71DZmyJFrC30HerRnp8PGoi1wTxOJgEeYq1BqBgSYq1AqBgaYnUQKoaIWBOEiqEi1hJCxZAR6zpCxdCNPtZAqBAx+lgJFSpGHSuhQsloYyVUqBllrIQKRaOLlVChalSxEiqUjSZWQoW6UcRKqMhB9rESKnKRdayEipxkGyuhIjdZxkqoyFF2sRIqcrVy8uTJf+by2ggV2dq9e/c/Tpw4sZLD6yNUZG3Pnj3LOcRKqMheDrESKkZBPVZCxWgox0qoGBXVWAkVo6MYK6FilNRiJVSMllKshIpRU4mVUDF6CrESKiAQK6EC64YcK6ECJUONlVCBxBBjJVTAMbRYCRWoMKRYCRWoMZRYCRVoMIRYCRVoYd6xEirQ0jxj3dXnk00mkz/7fD4Mz969e8PCwoL0O/P9+/ef379//0ufz0moQHdfQgh/LYriS1/LjqEv0N2BEMIPfS43QgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECoggFABAYQKCCBUQAChAgIIFRBAqIAAQgUEECogYDdvEpqcP38+HDt2LHz9+jW8fv06rK2tscx6Rqiodf/+/Wmo0e3bt8PNmzfDq1evWHA9YuiLSktLSxsijW7dusVC69lo9qh3794Nhw8f3vAzG8LduXNnbvM0dOnyiqp+jp0zilDt+Mr2DqlTp06FZ8+ehbdv3857FgfpzZs34dq1a5tmjWFv/0Yx9L1y5cpM/zZ2tgG7d+/ehqXw4cMHRiFzsKvPp5xMJn/2/RJtmPbixYvax1y8eJEzmTX27ds3HZV8+/ZtGiqmfiyK4te+FkX2e1RvyJvyhnf4PwvU9q5EOj9ZH6PanqDN0NbObNoQz1bIJrZnsemWlY9xbQ9ux772Xzv+rdtT2+Nsevv375/+3R5r04q/Y9M4dOjQht+xWNL5tOmkvMfN8jve642P8+YvJMujjjcPdb9r82J/yiez7Di66bXmIOtQLcB0JbN4QrKntcfY3588edI4TbuOmK5gx48fn/7s+vXrG/7NVqI0VHuuq1evTjcg6byV5/HRo0fTeUr39svLy5tW5tXV1U3T8B43y+94rzc+zubfm06bQwl7bXYmvsw7sReX16VLl9yzzXH52O/a+5frXj/roa83pLU3NMZatpWTSrbS2Qrr7SHKbG/w9OnT6XxVRRqnZ4+bTCYzz1MfLAovjDbL0ntMuqG05fny5cvp8mq6JBSXmW0sc5RtqLY39a6b2ha7PLyM7LFtjmc9ttdpYtO3mNteg7SQvZsNhsYbhTQtxziELUujjxu/ug2ax6JO99Q5yDZUb4ttw8lolhWsSpuVyVaeqscpn6yx0Ul6fBgPJao07U1tY1a38bPlZMur6rjUnju3y25Zhmpb63QYam9q+UK9N/y132kavtaxvbSdlLJjOPsTw7MVx5uuzZM97uzZs9P/Xr58eXp8p3ZDQZeNnhexLYfy+1G1UbPH2LKy5RSXm13T9YK1IXDXvfGQZRmqtzW1lb/8hqYrRzTrXtWmZZHZShuH1/H5zp07t+nxMdL05InFbje9K90tVbXRS4e3oWL5pntTb6Nmz+FFaT+/cePGpsc37dXVZBdq1bGmt9WvCrXrvaxN9wx7x5pNZyiV7v6x1++NArwNpvez8vtQtVFL75Aqs42a914qHOO3lV2oXqRVZye9k0phhjPA9hnNKlXR26WbOjZfSndLeRvC9PKYd4LPAi+/Tm8v3OY6qTcC2cphzNBkF6oXmb2J8fgz/eNFZrF3Ob6p2zN6NwSEljcFfPr0qfU8zJu30UvPXNu10FQauLdha7Oscr8FNKsbHqoCs3i77CW73AARZlxJbIXMbeWy5ZWerbXlbsNSe73pUDReLmtStbEbk6z2qNt5z+52nd6vWhG9IV5qK0O3uuPsNs89C+9STbxm2uYGh1CxvNrM7+nTpzf9LKcNYTahxvtrt8tWboBIzXIc3GVD4U2/LvKdusaYXgKLbAPadEkm8g4jvMttZTYC8obVOX3OOJtQvVvHynciNf3xVvbtCtU7DrYVr+oOGlsxu9wK563cVV+jYj/fycsWbU4qBedyWdPPHzx4ULlnteG2t5H2NgSqsjhGrbr2Zpc42m5VbWWyL/IqiyeetrpltpXXO36Ol4Js5bTY7FM0dnmia0i2IfCitNdj0y6KYvp3m/ZODXujeNdQ07C9fJdY6uHDh5uOdeMHAOKN+/aNiHFIXXUCKqc9ahahesembU9URPEyQfqmWzRbfcNtut7KF7bhbqiwPu82be9EmgXc9/VEi6nuNVWNYCLbsNk8p9OIH1tsGrrbHjm3b6GQH/pW3YFSt8Wu8vz5803/MssNEB5b+boOxdp+xnKWFXMnP7/Z9DncNsvB7jaaZQMZ7/jK7Yy6fKj2WcVU1UmNJo8fP3YfsV0nXyymth9Qt8d2uUnfXq/detg07Rj1Tn8AwNvohfXRRZtQY3C2wW27UbFlcOHChSw/kyo/9LXPbKZb3rpPVtSx37EVIx1yla/jeStBl+eKe9Z4sqf8DQrxDiqbB1uhux6r2opqdzzFaZdfh03XjmVtY2Tz6x2req9j1tdbNfztugG1QwabZ3s98Ri7PMKJnzqy5ZrzTQ/Zf7mZMu/D6E3f3IDe8OVmADYiVEAAoQICCBUQQKiAAP7/qANm11y9L7/G+BDqgBElIoa+gABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBhAoIIFRAAKECAggVEECogABCBQQQKiCAUAEBfYf6kZUCmfjS58voO9Sfen4+YCf8UhTFb30u2V5DLYri1xDCj31vjYBt9K+iKH7ue4Eu9P2Enz9//njw4MF/hxD+CCEcDSEc6HsegI5sx/KfEMLfi6J41vvCCyH8D7RWSQ5f8AFSAAAAAElFTkSuQmCC");
                    }

                    /*
                    else {
                        $(file.previewElement).find(".thumb-container img").attr("src", "../assets/img/ico/file_smallii_ico.png");
                    }                   
                    else if (ext.indexOf("doc") != -1) {
                        $(file.previewElement).find(".dz-image img").attr("src", "/Content/Images/word.png");
                    } else if (ext.indexOf("xls") != -1) {
                        $(file.previewElement).find(".dz-image img").attr("src", "/Content/Images/excel.png");
                    }   else if (ext.indexOf("pdf") != -1) {
                        $(file.previewElement).find(".dz-image img").attr("src", "/Content/Images/excel.png");
                    }
                    */

                    // Hookup the start button
                    //file.previewElement.querySelector(".start").onclick = function () { onyxDropzone.enqueueFile(file); };
                    //document.querySelector("#actions .start").onclick = function () { onyxDropzone.enqueueFile(file); };

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
                var contadorNotasEnviadas = 0;
                var nomesdasnotas = []
                onyxDropzone.on("success", function (file, response) {
                    contadorNotasEnviadas++
                    console.log(" monitor == ", 'contadorNotasEnviadas:', contadorNotasEnviadas, 'nomesdasnotas:', nomesdasnotas.length)
                    if (nomesdasnotas.length == contadorNotasEnviadas) {

                        //console.log("response: ", response)
                        //console.log("foi executado ou não ?")
                        if (response.length > 0) {
                            //console.log("ENTREI")
                            var gif = ""
                            if (response == "Processando Nota(s), aguarde...") {
                                gif = "info"
                            }

                            if (response == "Nota(s) envidas com sucesso!") {
                                gif = "success"
                            }

                            if (response == "Ops! Não foi possível enviar suas notas, tente novamente.") {
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
                                    }, 2000)
                                },
                                onClose: () => {
                                    clearInterval(timerInterval)
                                }
                            });
                        }
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


                    //AQUI PODEMOS FAZE UM AJAX PARA VERIFICAR OSE OS ARQUIVOS CHEGARAM NO SERVIDOR ANTES DE MOSTRAR O SWEET ALERT
                    let time = onyxDropzone.files.length * 100

                    setTimeout(function removeADDEDfiles(params) {
                        console.log("removendo arquivos ")
                        onyxDropzone.removeAllFiles(true);

                        Swal.fire({
                            position: 'center',
                            width: 800,
                            icon: 'success',
                            title: "Arquivos enviados com sucesso!",
                            showConfirmButton: true,
                            timer: 0
                        })

                    }, time)

                    /*
                    nomesdasnotas = []
                    for (var i = 0; i < onyxDropzone.files.length; i++) {
                        nomesdasnotas.push(onyxDropzone.files[i].name)
                    }
                    */
                    //=====>>> timedelayreq = (onyxDropzone.files.length * 1000);

                    timedelayreq = 2000;
                    //console.log("timedelayreq: ", timedelayreq)


                    // verifica seoarquivo chegoun no servidor de fato

                    //Não usamos mais por enquanto
                    /*
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
         */

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
        $('#dz_input').removeClass('hideElement')
    });

}(jQuery);
//DROPZONE