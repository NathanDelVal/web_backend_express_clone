const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// module.exports = {
//     limiter: rateLimit({
//         windowMs: 10 * 60 * 1000,
//         max: 1000,
//         message: 'Muitas requisições, tente mais tarde novamente.'
//     }),

//     slower: slowDown({
//         windowMs: 8 * 60 * 1000, //8 minutos por janela
//         delayAfter: 800, //máximo de 800 requisições por janela
//         delayMs: 100 //a partir de 100 requisições, incrementa-se 500 ms entre cada req
//     })

// };
const limiter = (minutes, maxRequests) => {
    minutes = minutes || 10;
    maxRequests = maxRequests || 300

    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: maxRequests,
        message: 'Muitas requisições, tente mais tarde novamente.'
    })
};

const slower = (minutes, maxRequests, incrementDelay) => {
    minutes = minutes || 8;
    maxRequests = maxRequests || 250;
    incrementDelay = incrementDelay || 100;
    
    return slowDown({
        windowMs: minutes * 60 * 1000,  //minutos por janela
        delayAfter: maxRequests,        //máximo de 800 requisições por janela
        delayMs: incrementDelay         //a partir de 100 requisições, incrementa-se 500 ms entre cada req
    })
};

module.exports = { limiter, slower };