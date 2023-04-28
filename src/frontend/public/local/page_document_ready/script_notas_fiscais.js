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
            if($('#datainicial').val().length > 0){
            $('#datafinal').data('DateTimePicker').minDate(e.date); //Define a data minima para o "data final" - afim de impossibilitar data inferior a data inicial
            $('#datafinal').prop('required', true);                 //quando seleciona "data inicial", o campo "data final" passa a ser obrigatório ("required")
            $('#formdata1').addClass('is-filled', true);            //ao clicar em uma data, o formulario da data recebe a classe is-filled, assim a animação do label não volta a cair no input
            }else{
                $('#datainicial').prop('required', false);
                $('#datafinal').prop('required', false);
                }
        });
        $('#datafinal').on('dp.change', function (e) {
            $('#datainicial').data('DateTimePicker').maxDate(e.date);
            $('#datainicial').prop('required', true);
            $('#formdata2').addClass('is-filled', true);
        });


        $('#periodoinicial').datetimepicker({
            useCurrent: false,
            locale: 'pt-br',
            format: 'L',
        });
        $('#periodofinal').datetimepicker({
            useCurrent: false, //Important! See issue #1075
            locale: 'pt-br',
            format: 'L',
        });
        //________PERMITINDO SOMENTE OS DIAS POSTERIORES AO INICIAL NO DATEPICKER FINAL
        $('#periodoinicial').on('dp.change', function (e) {
            if($('#periodoinicial').val().length > 0){
            $('#periodofinal').data('DateTimePicker').minDate(e.date); //Define a data minima para o "data final" - afim de impossibilitar data inferior a data inicial
            $('#periodofinal').prop('required', true);                 //quando seleciona "data inicial", o campo "data final" passa a ser obrigatório ("required")
            $('#form_periodoinicial').addClass('is-filled', true);            //ao clicar em uma data, o formulario da data recebe a classe is-filled, assim a animação do label não volta a cair no input
            }else{
                $('#periodoinicial').prop('required', false);
                $('#periodofinal').prop('required', false);
                }
        });
        $('#periodofinal').on('dp.change', function (e) {
            $('#periodoinicial').data('DateTimePicker').maxDate(e.date);
            $('#periodoinicial').prop('required', true);
            $('#form_periodofinal').addClass('is-filled', true);
        });




        $('#datepickerDataDeEntrada').datetimepicker({
            viewMode : 'months',
            format : 'MM/YYYY',
            toolbarPlacement: "top",
            allowInputToggle: true,
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
        $("#datepickerDataDeEntrada").on("dp.show", function(e) {
            $(e.target).data("DateTimePicker").viewMode("months"); 
        });
        
        $('#datepickerCompetencia').datetimepicker({
            viewMode : 'months',
            format : 'MM/YYYY',
            toolbarPlacement: "top",
            allowInputToggle: true,
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

        $('#datepickerGed').datetimepicker({
            viewMode : 'months',
            format : 'MM/YYYY',
            toolbarPlacement: "top",
            allowInputToggle: true,
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
        $("#datepickerGed").on("dp.show", function(e) {
            $(e.target).data("DateTimePicker").viewMode("months"); 
        });

        $('#datepickerGuias').datetimepicker({
            viewMode : 'months',
            format : 'MM/YYYY',
            toolbarPlacement: "top",
            allowInputToggle: true,
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
        $("#datepickerGuias").on("dp.show", function(e) {
            $(e.target).data("DateTimePicker").viewMode("months"); 
        });
    });
    //---------------------------------------------------------------------------------X
    

    //-----------------------------------------------------------MASK PARA FORMULÁRIOS
    jQuery(function ($) {
        $("#datamodal").mask("99/99/9999", { placeholder: "DD/MM/AAAA" });
    });
    //------------------------------------------------------------------------------X


});