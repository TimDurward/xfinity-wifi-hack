var CronJob   = require('cron').CronJob;
var CMD       = require('node-cmd');
var CON       = require('wifi-control');
var async     = require('async');
var Nightmare = require('nightmare');

//Globals

//CHANGE SSID FOR PREFERED WIFI
var SSID = "xfinitywifi";

// The name of your Wireless Interface Controller (WNIC). 
//Can be found in Terminal using command:
//Linux: iwconfig
//Mac: ifconfig
var DRIVER_INTERFACE = "en0";


//Settings:
//**************
//Debug Verbose Connections = true
//Options: True/False
CON.init({
    debug: true
});

//Optional Password for Router
//Some Xfinity Routers will require password (Ucomment Below if this is the case)
var _ap = {
    ssid: SSID,
    // password: "Optional"
};
//**************


//Make shift countown notifier
function counter() {
    var i = 0;
    var cronTimer = function () {
        if (i == (10 * 6 * 60)) clearInterval(this);
        if (i == (10 * 6 * 55)) console.log("Restablishing shortly...");
        if (i == (10 * 6 * 45)) console.log("Restablishing in 15 Minutes");
        if (i == (10 * 6 * 30)) console.log("Restablishing in 30 Minutes");
        if (i == (10 * 6 * 15)) console.log("Restablishing in 45 Minutes");
    };

    //Sync with CRON
    setInterval(cronTimer, (10 * 6 * 60));
    cronTimer();
}


function spoofAdr(callback) {
    console.log("Spoofing " + DRIVER_INTERFACE + "'s Mac Address...");
    CMD.get(
        'sudo spoof randomize ' + DRIVER_INTERFACE + ' && spoof list --wifi',
        function (data) {
            console.log(data);
            var macAdr = data.match(/set to (.*)/)[1];
            exports.address = macAdr;
            callback(null, macAdr, 'one');
        }
    );
}


function ssidConnect(arg1, arg2, callback) {
    console.log("Reconnecting to SSID: " + SSID + "...");
    var results = CON.connectToAP(_ap, function (err, response) {
        if (err) console.log(err);
        console.log(response);
    });
    callback(arg1, arg2, 'two');
}


function automateXfinityGui(arg1, arg2, callback) {
    console.log("Automating Xfinity UI...");
    //Instatiate Selenium     
    var nightmare = Nightmare({ show: true });
    //Begin Traversing
    nightmare
        .goto('https://wifilogin.comcast.net/wifi/start.php?bn=st01&tm=xfw01&cm=00:0C:29:60:C7:0D')
        .wait(1000) // in ms
        .click('#not-xfinity-customer')
        .wait(1000)
        .click('.customer-block-content.dropdown-content.customer-signup a')
        .wait(1000)
        .select('#rateplanid', 'spn')
        .wait(500)
        .insert('#spn_postal', '90001')
        .wait(500)
        .insert('#spn_email', 'test@gmail.com')
        .wait(500)
        .check('#spn_terms')
        .wait(500)
        .click('.startSessionButton.submit.required')
        .wait(20000)
        .end()
        .then(function (result) {
            console.log(result)
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
    
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
            async.apply(automateXfinityGui, 'start-up-browser'),
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