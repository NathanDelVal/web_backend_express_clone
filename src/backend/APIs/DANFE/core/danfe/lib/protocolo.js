'use strict';
const moment = require('moment')

var brasil = require('../../../core/brasil/brazilian'),
    formatarDataEHora = brasil.formatacoes.dataEHora;

var Protocolo = (function() {
    function Protocolo() {

    }

    Protocolo.prototype.getCodigo = function() {
        return this._codigo || '';
    };

    Protocolo.prototype.comCodigo = function(_codigo) {
        this._codigo = _codigo;
        return this;
    };

    Protocolo.prototype.getData = function() {
        return this._data;
    };

    Protocolo.prototype.getDataFormatada = function() {
        if(this.getData()) {
            return formatarDataEHora(this.getData());
        }

        return '';
    };

    Protocolo.prototype.comData = function(_data) {

        /* formatar data e hora */
        _data = moment(_data, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')

        /* var teste = '2021-04-03T08:14:36-03:00'

    var x = moment(teste, 'yyyy-mm-dd HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
    alert(x);
    */
     
        console.log('data e hora', _data)
        this._data = _data;
        return this;

    };

    Protocolo.prototype.getFormatacao = function() {
        var resultado = '';

        if(this.getCodigo()) {
            resultado += this.getCodigo();
        }

        if(this.getCodigo() && this.getData()) {
            resultado += ' - ';
        }

        if(this.getData()) {
            resultado += this.getDataFormatada();
        }

        return resultado;
    };

    return Protocolo;
})();

module.exports = Protocolo;
