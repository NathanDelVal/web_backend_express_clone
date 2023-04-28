const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./passport-keys');
//SQL SERVER ENVIROMENT
//const { poolPromise } = require("../db_old/dbconnect");
const {knexPostgre} = require('../database/knex'); //Precisa mudar as consultas para Knex





//---------------------------------------------------------------------------------

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (userdata, done) => {
    const userId = userdata[0].id;
    //console.log("userId",userId)
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .query("SELECT id_login, usuario, email, nome_fantasia, administrador, google_id, google_fname, google_lname, google_picture FROM dbo.login WHERE id='" + userId + "'");
        var data = result.recordset;
        var userdata = data[0];



        done(null, userdata);
    } catch (error) {
        //res.status(500)
        //res.redirect("/");
        console.log("Catch deserializeUser catch")
    }
});

passport.use(

    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        var email_google = profile.emails[0].value;
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .query("SELECT id_login, usuario, email, nome_fantasia, administrador, ativo, google_id, google_fname, google_lname, google_picture FROM dbo.login WHERE email='" + email_google + "'");

            var data = result.recordset
            var table_id = data[0].id


            if (result == null) {
                done(null, "Usuário não encontrado");
            }

            else {
                try {
                    var id_google = profile.id
                    var fname_google = profile.name.givenName
                    var lname_google = profile.name.familyName
                    var picture_google = profile.photos[0].value
                    var email_google = profile.emails[0].value;
                    var pool2 = await poolPromise;
                    var result2 = await pool2
                        .request()
                        .query("USE antecipados_alopara UPDATE dbo.login SET ativo='1', google_id ='" + id_google + "', google_fname= '" + fname_google + "', google_lname ='" + lname_google + "' , google_picture ='" + picture_google + "' WHERE email ='" + email_google + "' and id_login=" + table_id + " ");
                    const data2 = result2.recordset
                    const currentUser = data
                    done(null, currentUser);
                } catch{
                    var errorUser = "Usuário inexistente"
                    done(null, errorUser);
                }
            }

        } catch (error) {
            done(null, errorUser);
        }
    })
);


