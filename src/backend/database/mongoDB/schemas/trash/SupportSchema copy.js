
const mongoose = require('mongoose');


module.exports = {

    schemaGED: mongoose.model('ged_docs', {
        name: {
            type: String,
            required: true
        },
        isDirectory: {
            type: Boolean,
            required: true
        },
        itens: { 
        }
        ,
    }),

}







