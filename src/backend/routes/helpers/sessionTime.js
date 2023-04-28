const moment = require('moment');


module.exports = {

  async ExpireTime(TargetTime) {

    //EXPECTS ---> TargetTime = req.session.cookie._expires
    //USAGE ---> res.send(await ExpireTime(req.session.cookie._expires))


    var now = moment().format("DD/MM/YYYY HH:mm:ss")
    var then = moment(TargetTime).format("DD/MM/YYYY HH:mm:ss")
    const diff = moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(then, "DD/MM/YYYY HH:mm:ss"));
    var seconds = moment.duration(diff).seconds();
    var minutes = moment.duration(diff).minutes();
    var hours = Math.trunc(moment.duration(diff).asHours());

    return moment(hours + ':' + minutes + ':' + seconds, "hh:mm:ss").format("HH:mm:ss")

  },

  async ExpireTimePlano(TargetTime, Targetformat) {
    var now = moment(Date.now());
    var end = moment(TargetTime, Targetformat); // another date

    console.log("NOW ==>> ", now)
    console.log("END ==>> ", end)

    var duration = moment.duration(now.diff(end));

    //Get Days and subtract from duration
    var days = duration.asDays();
    duration.subtract(moment.duration(days, 'days'))

    //Get hours and subtract from duration
    var hours = duration.hours();
    duration.subtract(moment.duration(hours, 'hours'));

    //Get Minutes and subtract from duration
    var minutes = duration.minutes();
    duration.subtract(moment.duration(minutes, 'minutes'));

    //Get seconds
    var seconds = duration.seconds();

    return moment(hours + ':' + minutes + ':' + seconds, "HH:mm:ss").format("HH:mm:ss")

  },


};
