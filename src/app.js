/* MODULOS */
require('dotenv').config();
require('./backend/config/init_project_directories');
const moment = require('moment');
const express = require('express');
const helmet = require('helmet');
//const responseTime = require('response-time')
const app = express();
//app.set('trust proxy', 1) // trust first proxy //Quando tiver https

app.use(helmet());
//cors = require('cors')
////app.use(cors());
//app.use(responseTime())
//middleware cors
//app.use(require('cors')())



const createError = require('http-errors');
const path = require('path');
const enviroment = require(`${path.resolve()}/config.js` )
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const hbs = require('hbs');
const indexRoutes = require('./backend/routes/router');
const authRoutes = require('./backend/routes/auth-routes');
const { knexPostgre } = require('./backend/database/knex');


//GOOGLE PASSPORT'
const passport = require('passport');
const passportSetup = require('./backend/config/passport-setup');
const keys = require('./backend/config/passport-keys');

//SOCKET.IO
const io = require('./backend/server/serverSocket.js');
const sharedsession = require('socket.io-express-session');

const session = require('express-session')

//REDIS
const RedisStore = require('connect-redis')(session)

const {redisClient} = require('./backend/database/redis')
//const redisConfig = require('./backend/config/redis.js')
//const redisClient = redis.createClient(redisConfig)

//importando rateLimit and slownDown
const { limiter , slower } = require("./backend/config/requestRate");
// app.use(limiter()); // all requests
// app.use(slower()); //all requests
app.set('trust proxy', 1);



var SessionMaxAGE = 3600000
var SessionExpires = moment().add(SessionMaxAGE, 'ms').format('YYYY-MM-DD HH:mm:ss.ms');
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: [process.env.COOKIE_KEY],
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: {
        //ttl : 20,
        expires: SessionExpires,
        maxAge: SessionMaxAGE,
        sameSite: true,
        secure: false,   //https
    },
    //keys: [keys.session.cookieKey]
}));

io.use(sharedsession(session({
    store: new RedisStore({ client: redisClient }),
    secret: [process.env.COOKIE_KEY],
    saveUninitialized: false,
    resave: true,
    rolling: true,
    //ttl : 20,
    cookie: {
        expires: SessionExpires,
        maxAge: SessionMaxAGE,
        sameSite: true,
        secure: false,          //https
    },
    //keys: [keys.session.cookieKey]
}), {
    autoSave: true
}));


app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.disable('x-powered-by');

//app.enable('view cache');
//app.use(logger('dev')); //Mostrar requisições HTTP no terminal

//app.set('view engine', 'hbs');
app.set('views', path.join(`${__dirname}/frontend/views`));
//HBS Helper Partials
hbs.registerPartials(`${__dirname}/frontend/views/partials`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(`${__dirname}/frontend/public/`)));
app.use(cookieParser());


global.__src = __dirname; //D:\PROJETOS\Mezzomo\MEZZ_APP\src
global.__basedir = path.resolve(`${__dirname}/../`); //D:\PROJETOS\Mezzomo\MEZZ_APP
global.__publicdir = path.resolve(`${__dirname}/frontend/public/images/gedimg/`); //D:\PROJETOS\Mezzomo


// ROUTER END FUNCTIONS
const AppAntecipados = require('./backend/routes/escritorioRoutes/Antecipados/antecipados');
const MenuApps = require('./backend/routes/escritorioRoutes/MenuApps');
const GerenciarMain = require('./backend/routes/escritorioRoutes/Gerenciar');
const AtendimentoConsumidor = require('./backend/routes/publicRoutes/atendimento-consumidor');
const CadastroEscritorio = require('./backend/routes/escritorioRoutes/CadastroEscritorio');
const CadastroUsuario = require('./backend/routes/escritorioRoutes/CadastroUsuario');
const CadastroEmpresa = require('./backend/routes/escritorioRoutes/CadastroEmpresa');
const CadastroAgendamento = require('./backend/routes/escritorioRoutes/CadastroAgendamento');
const NotasFiscais = require('./backend/routes/escritorioRoutes/NotasFiscais');
const RoboContabil = require('./backend/routes/escritorioRoutes/RoboContabil');
const GED = require('./backend/routes/escritorioRoutes/GED');
const RoboFiscal = require('./backend/routes/escritorioRoutes/RoboFiscal');
const Payments = require('./backend/routes/escritorioRoutes/Payments');
const Acumuladores = require('./backend/routes/escritorioRoutes/Acumuladores')
const Controladoria = require('./backend/routes/escritorioRoutes/Controladoria');
const Suporte = require('./backend/routes/escritorioRoutes/Suporte');
const RecuperarAcesso = require('./backend/routes/escritorioRoutes/RecuperarAcesso');
const Relatorios = require('./backend/routes/relatorios');



const { mustBeAdministrador, mustBeEscritorio, mustBeEmpresa } = require('./backend/workers/session/SessionValidate.js');
// ROUTER PATHS para Escritorio
app.use('/', limiter(), indexRoutes);
app.use('/auth', limiter(), authRoutes); //localhost:3333/auth
app.use('/menu', limiter(), MenuApps);
app.use('/gerenciar', limiter(), mustBeEscritorio, GerenciarMain);
app.use('/antecipados', limiter(), AppAntecipados);
app.use('/atendimento-consumidor', limiter(), mustBeAdministrador, AtendimentoConsumidor);
app.use('/cadastro-escritorio', limiter(), CadastroEscritorio);
app.use('/cadastro-usuario', limiter(), mustBeEscritorio, CadastroUsuario);
app.use('/cadastro-empresa', limiter(), mustBeEscritorio, CadastroEmpresa);
app.use('/cadastro-agendamento', limiter(), CadastroAgendamento);
app.use('/notas', limiter(), NotasFiscais);
app.use('/robo-contabil', limiter(), mustBeEscritorio, RoboContabil); // '/rc/robo-contabil'  -> '/robo-contabil'
app.use('/robo-fiscal', limiter(), mustBeEscritorio, RoboFiscal);     // '/rf'  -> '/robo-fiscal'
app.use('/payments', limiter(), mustBeEscritorio, Payments);
app.use('/acumuladores', limiter(), mustBeEscritorio, Acumuladores);
app.use('/ct', limiter(), mustBeEscritorio, Controladoria);
app.use('/ged', limiter(), GED);
app.use('/suporte', limiter(), mustBeEscritorio, Suporte);
app.use('/recuperar', limiter() ,RecuperarAcesso);
app.use('/relatorios', Relatorios );

// ROUTER PATHS para Empresa
app.use('/empresa', limiter(), require('./backend/routes/empresaRoutes/'));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/mesures.json', function(req, res, next) {});
// Escuta erro 404 e envia para o Tratamento de Erros
app.use(function(req, res, next) {
    next(createError(404));
});
// Tratamento de Erros
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    //console.error(res.locals.error);
    //render the error page
    res.status(err.status || 500).render('./Error/404');
});




console.log('APP --> Enviroment: ', enviroment.NODE_ENV)

if(enviroment.NODE_ENV == 'development' ){
  app.set('redisdb', 5);
}
if(enviroment.NODE_ENV == 'production' ){
  app.set('redisdb', 0);

}





//Victor Eustáquio - Helper Condition para o Handlebar - Usage example: {{#ifCond var1 '==' var2 }} <h1>var1 é igual var2!</h1> {{/ifCond}}
hbs.handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

hbs.handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});



//=------------------------------------------------------------ teste de socket.io session

/*

// Configurações do Socket.IO
io.set('authorization', function(data, accept) {
    cookie(data, {}, function(err) {
        if (!err) {
            var sessionID = data.signedCookies[key];
            store.get(sessionID, function(err, session) {
                if (err || !session) {
                    accept(null, false);
                } else {
                    data.session = session;
                    accept(null, true);
                }
            });
        } else {
            accept(null, false);
        }
    });
    });
    io.sockets.on('connection', function (client) {
        var session = client.handshake.session
            , nome = session.nome;
        client.on('toServer', function (msg) {
            msg = "<b>"+nome+":</b> "+msg+"<br>";
            client.emit('toClient', msg);
            client.broadcast.emit('toClient', msg);
        });
    });

    */


//=------------------------------------------------------------ teste de socket.io session

module.exports = app //Torna esse modulo Global
