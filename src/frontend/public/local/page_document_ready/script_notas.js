$(document).ready(function () {

    //------------------------------------------------------DATA PICKER INICIAL E FINAL
    $(function () {
        $('#datainicial').datetimepicker({
            useCurrent: false,
            locale: 'pt-br',
            format: 'L',
        });
        $('#datafinal').datetimepicker({
            useCurrent: false, //Important! See issue #1075
            locale: 'pt-br',
            format: 'L',
        });
        //________PERMITINDO SOMENTE OS DIAS POSTERIORES AO INICIAL NO DATEPICKER FINAL
        $('#datainicial').on('dp.change', function (e) {
            $('#datafinal').data('DateTimePicker').minDate(e.date); //Define a data minima para o "data final" - afim de impossibilitar data inferior a data inicial
            $('#datafinal').prop('required', true); //quando seleciona "data inicial", o campo "data final" passa a ser obrigatório ("required")
            $('#formdata1').addClass('is-filled', true); //ao clicar em uma data, o formulario da data recebe a classe is-filled, assim a animação do label não volta a cair no input
        });
        $('#datafinal').on('dp.change', function (e) {
            $('#datainicial').data('DateTimePicker').maxDate(e.date);
            $('#datainicial').prop('required', true);
            $('#formdata2').addClass('is-filled', true);
        });

        $('#datepickerCompetencia').datetimepicker({
            viewMode : 'months',
            format : 'MM/YYYY',
            toolbarPlacement: "top",
            allowInputToggle: true,
            locale: 'pt-br',
            icons: {
                time: 'fa fa-time',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        });
        $("#datepickerCompetencia").on("dp.show", function(e) {
            $(e.target).data("DateTimePicker").viewMode("months"); 
        });
    });
    //---------------------------------------------------------------------------------X

    //-----------------------------------------------------------MASK PARA FORMULÁRIOS
    jQuery(function ($) {
        $("#datamodal").mask("99/99/9999", { placeholder: "DD/MM/AAAA" });
    });
    //------------------------------------------------------------------------------X



    //var table = $('#datatable').DataTable();
    //------------------------------------------------------------------------------X

    //-----------------------------------------------------------MODAL ALTERAR DATA
    $('#btnalterardata').on('click', function () {
        var rows_ids = ids;
        //console.log("ID DO MODAL");
        //console.log(rows_ids);
        //var Nome_PJ_Emitente = $(this).data('Nome_PJ_Emitente');
        //var Data_Entrada = $(this).data('Data_Entrada');
        //$('.Nome_PJ_Emitente').val(Nome_PJ_Emitente);
        //$('.Data_Entrada').val(Data_Entrada);
        $('#ModalalterarData').modal('show');
        $('#marcados_alterar_data').val(rows_ids);
    });
    //------------------------------------------------------------------------------X

    //---------------------------------------------------------MODAL ALTERAR ALíQUOTA
    $('#btnalteraliquota').on('click', function () {
        var rows_ids = ids;
        $('#ModalalterarAliquota').modal('show');
        $('.marcados_alterar_aliq').val(rows_ids);
    });
    //------------------------------------------------------------------------------X

    //-----------------------------------------------------MODAL ALTERAR NF DEVOLVIDA
    $('#btnnotadevolvida').on('click', function () {
        var rows_ids = ids;
        $('.marcados_nota_devolvida').val(rows_ids);
        $('#ModalNotaDevolvida').modal('show');
    });
    //------------------------------------------------------------------------------X


    //------------------------------------------MODAL ALTERAR RETORNAR PARA APROVAÇÃO
    $('#btnretornarprovacao').on('click', function () {
        var rows_ids = ids;
        $('#ModalNotaRetornaAprovacao').modal('show');
        $('.marcados_nota_aprovacao').val(rows_ids);
    });
    //------------------------------------------------------------------------------X






});