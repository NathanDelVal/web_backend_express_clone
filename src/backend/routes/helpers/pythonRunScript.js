const { spawn, exec } = require("child_process");

const { setNotaProcessada } = require("../../database/mongoDB")


module.exports = {
async processarXml(arrayFileNames){
    /**
     * @param {Array} arrayFileNames // Array com os nomes dos arquivos que serão processados
     */
    var processTest = spawn('python', ["src/python/call_from_web.py", arrayFileNames], { detached: true });
    processTest.stdout.on("data", function(data) {
        var msg = String(data).replace("\r\n", "");
        //console.log("PYTHON FROM WEB ===> ", msg)
        txt = msg.replace("\r\n", "");
        if (txt.match("COD0 ")) {
            var resultado_python = txt.split(" ")
            console.log("=== Nota processada com sucesso ===>", resultado_python[1])
            setNotaProcessada(resultado_python[1])
        }
        if (txt.match("COD1 ")) {
            var resultado_python = txt.split(" ")
            console.log("=== Nota já havia sido processada anteriormente ===> ", resultado_python[1])
            setNotaProcessada(resultado_python[1])
        }
        if (txt.match("COD2 ")) {
            console.log("==========================> erro ao executar nota")
        }
    });
},



async manifestarNota(manifestacao, dataParaManifestacao){
    console.log("arrive manifestarNota")
    /**
     * @param {String} manifestacao        //  '1'
     * @param {Array} dataParaManifestacao //  [[id_chavedeacesso, chavedeacesso, cnpj_destinatario, destinatario], [*,*,*,*]...]
     *
     *
     * @param {Array} id_chavedeacesso     // ['*', ...]
     * @param {Array} chavedeacesso        // ['*', ...]
     * @param {Array} cnpj_destinatario    // ['*', ...]
     * @param {Array} destinatario         // ['*', ...]
     */


   dataParaManifestacao = JSON.stringify(dataParaManifestacao);
    var processTest = spawn('python3', ["./src/python/operacoes_manifestacao.py", manifestacao, dataParaManifestacao ], { detached: true });
    processTest.stdout.on("data", function(data) {
        var data = String(data).replace("\r\n", "");
        if(data){
            console.log("Python operacoes_manifestacao.py ->> ", data);
        }
    });
}


};


/*
//await a async// -> https://stackoverflow.com/questions/15515549/node-js-writing-a-function-to-return-spawn-stdout-as-a-string

function run(cmd, callback) {
    var spawn = require('child_process').spawn;
    var command = spawn(cmd);
    var result = '';
    command.stdout.on('data', function(data) {
         result += data.toString();
    });
    command.on('close', function(code) {
        return callback(result);
    });
}

run("ls", function(result) { console.log(result) });

*/
