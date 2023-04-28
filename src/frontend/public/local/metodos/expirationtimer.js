$.ajax({
    url: '/expiration-timer',
    type: 'GET',

}).done(function (response) {
    var expirationtime = response.expirationtime
    var startTime = moment().valueOf()
    var endTime = moment(expirationtime)
    var timeLeft = moment.duration(endTime.diff(startTime));

    localStorage.setItem('expiretime', expirationtime)
    localStorage.setItem('timeleft', timeLeft.valueOf())
    ShowTimer('#displaytimeleft')
    //"81211288"
})
var flag_plano = 0;
function ShowTimer(display) {
    const main = setInterval(function () {
        const expireTime = localStorage.getItem('expiretime');
        var deathClock = parseInt(localStorage.getItem('timeleft'))
        var timeLeft = moment(deathClock);
        //const durationTIMELEFT = moment.duration(moment(deathClock).subtract(3, 'hours').valueOf());
        var days = parseInt(moment.duration(timeLeft.valueOf()).asDays())
        const hours = timeLeft.hours()
        const minutes = timeLeft.minutes()
        const seconds = timeLeft.seconds()
        if (days < 1) {
            if (hours <= 0 && minutes <= 0 && seconds <= 0) {
                $(display).text(`${0}dias ${0}horas ${0}minutos ${0}segundos`);
                //pra zerar o horario => 21600374
                localStorage.setItem('timeleft', 21600374)
                deathClock = 21600374
            }
        }
        //correção do valor de dias
        days = parseInt(moment.duration(timeLeft.subtract(3, 'hours').valueOf()).asDays())

        if (deathClock == 21600374) {
            flag_plano++
        }
        if (flag_plano == 1) {
            //do alert and redirect here
            sweetAlertFreeAccountOver()
            clearInterval(main) // kill setInterval

        }

        if (flag_plano == 0) {
            var msgDAYS = '';
            var msgHOURS = '';
            var msgMINUTES = '';
            var msgSECONDS = `${seconds} segundos `;
            if (days <= 0) msgDAYS = '';
            if (days > 1) msgDAYS = `${days} dias `;
            if (hours <= 0) msgHOURS = '';
            if (hours == 1) msgHOURS = `${hours} hora `;
            if (hours > 1) msgHOURS = `${hours} horas `;

            if (minutes <= 0) msgMINUTES = '';
            if (minutes == 1) msgMINUTES = `${minutes} minuto `;
            if (minutes > 1) msgMINUTES = `${minutes} minutos `;

            if (minutes == 1) msgSECONDS = `${seconds} segundo `;
            if (minutes > 1) msgSECONDS = `${seconds} segundos `;

            $(display).text(`${msgDAYS}${msgHOURS}${msgMINUTES}${msgSECONDS}`);
            deathClock = deathClock - 1000

            localStorage.setItem('timeleft', deathClock)
        }

    }, 1000);
}

function sweetAlertFreeAccountOver() {
    Swal.fire({
        position: 'center',
        icon: 'warning',
        title: "O periodo de teste gratuito encerrou!",
        showConfirmButton: true,
    }).then(() => {
        redirect()
    })
}

function redirect() {
    window.location.replace(`${window.location.origin}/expireShutDownFREEplans`)
}
 