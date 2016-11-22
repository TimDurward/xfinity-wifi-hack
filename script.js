var CronJob = require('cron').CronJob;
var CMD = require('node-CMD');
var CON = require('wifi-control');
var async = require('async');

//CHANGE SSID FOR PREFERED WIFI
var SSID = "xfinitywifi";
CON.init({
    debug: true
});

var _ap = {
    ssid: SSID,
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



function spoofAdr(callback) {
    console.log("Spoof Mac Address...");
    CMD.get(
        'sudo spoof randomize wi-fi && spoof list --wifi',
        function (data) {
            console.log(data);
            var macAdr = data.match(/set to (.*)/)[1];
            exports.address = macAdr;
            callback(null, macAdr, 'two');
        }
    );
}


function ssidConnect(arg1, arg2, callback) {
    console.log("Reconnecting to SSID");
    var results = CON.connectToAP(_ap, function (err, response) {
        if (err) console.log(err);
        console.log(response);
    });
    callback(arg1, arg2, 'three');

}


function automateXfinityGui(arg1, arg2, callback) {

    console.log("Testing Browser")
    CMD.get(
        'casperjs ~/Desktop/wifi-hack/browser.js --url="https://xfinity.nnu.com/xfinitywifi/?client-mac="' + arg2,
        function (data) {
            console.log(data)

        }
    );

    callback(null, 'done');
}


//Runs Once an Hour
var job = new CronJob({
    cronTime: '0 0 * * * *',
    onTick: function () {
        counter();
        console.log('Establishing Connection...');
        //Run Async tasks in sequence
        async.waterfall([
            //Send global spoof CMD            
            spoofAdr,
            //Reconnecting to WiFi SSID
            ssidConnect,
            //Start Headless browser
            async.apply(automateXfinityGui, 'deen'),
        ], function (error) {
            if (error) {
                console.log(error);
            }
        });

    },
    start: false,
    timeZone: 'America/Los_Angeles',
    runOnInit: true
});
//Initiate CRON Job
job.start();