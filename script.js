var CronJob = require('cron').CronJob;
var CMD     = require('node-CMD');
var CON     = require('wifi-control');


CON.init({
    debug: true
});

//CHANGE SSID FOR PREFERED WIFI
var _ap = {
    ssid: "xfinitywifi",
};


function counter() {
    var i = 0;
    var funcNameHere = function () {
        if (i == (10 * 6 * 60)) clearInterval(this);
        if (i == (10 * 6 * 55)) console.log("Restablishing shortly...");
        if (i == (10 * 6 * 45)) console.log("Restablishing in 15 Minutes");
        if (i == (10 * 6 * 30)) console.log("Restablishing in 30 Minutes");
        if (i == (10 * 6 * 15)) console.log("Restablishing in 45 Minutes");
        // else console.log('Cron timing at ' + (i++));
    };
    setInterval(funcNameHere, 3600);
    funcNameHere();
}

//Runs Once an Hour
var job = new CronJob({
    cronTime: '0 0 * * * *',
    onTick: function () {
        counter();
        console.log('Establishing Connection...');
        CMD.get(
            'sudo spoof randomize wi-fi && spoof list --wifi',
            function (data) {
                console.log(data)
            }
        );

        //Reconnecting to WiFi SSID
        var results = CON.connectToAP(_ap, function (err, response) {
            if (err) console.log(err);
            console.log(response);
        });
    },
    start: false,
    timeZone: 'America/Los_Angeles',
    runOnInit: true
});
job.start();