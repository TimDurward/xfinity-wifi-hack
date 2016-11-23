var CronJob    = require('cron').CronJob;
var CMD        = require('node-cmd');
var CON        = require('wifi-control');
var async      = require('async');
var Nightmare  = require('nightmare');
var macaddress = require('macaddress');

//Globals
var TIME_ZONE = 'America/Los_Angeles'

//CHANGE SSID FOR PREFERED WIFI
var SSID = "xfinitywifi";

// The name of your Wireless Interface Controller (WNIC).
//Can be found in Terminal using command:
//Linux: iwconfig
//Mac: ifconfig
var DRIVER_INTERFACE = "wlo1";

//Settings:
//**************
//Debug:   Verbose Mode - Uncomment for Silent Logs
//iface:   Set your WNIC or comment out to automatically find Interface
//Timeout: The length of time before trying reconnection - Uncomment to be endless
var CON_SETTINGS = {
  debug: true,
  iface: DRIVER_INTERFACE,
  ConnectionTimeout: 10000 // in ms
}

//Initiate Settings
CON.configure(CON_SETTINGS);



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
    // CON.resetWiFi( function(err, response) {
    //   if (err) console.log(err);
    // console.log(response);

    console.log("Spoofing " + DRIVER_INTERFACE + "'s Mac Address...");
    setTimeout(function() {
      CMD.get(
    'sudo spoof randomize ' + DRIVER_INTERFACE,
    function (data) {
        macaddress.one(DRIVER_INTERFACE, function (err, mac) {
          console.log("Generated temporary Mac address for " + DRIVER_INTERFACE + ": %s", mac);
          var macAdr = mac;
          callback(null, macAdr);
        });
    }
  );
}, 1000);

    // } );

}


function ssidConnect(macAdr, callback) {
    console.log("Reconnecting to SSID: " + SSID + "...");
    var results = CON.connectToAP(_ap, function (err, response) {
        if (err) console.log(err);
        // console.log(response.msg);
        console.log("This is coming from spoof frominside ssid: " + macAdr);
        callback(null, macAdr);
    });
}


function automateXfinityGui(macAdr) {
    console.log("Automating Xfinity UI...");
    //Instantiate Selenium
    var nightmare = Nightmare({ show: true });
    //Begin Traversing
    nightmare
        .goto('https://wifilogin.comcast.net/wifi/start.php?bn=st01&tm=xfw01&cm=' + macAdr)
        .wait(10000) // in ms
        .click('#not-xfinity-customer')
        .wait(1000)
        .click('.customer-block-content.dropdown-content.customer-signup a')
        .wait(10000)
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
            automateXfinityGui,
        ], function (error) {
            if (error) {
                console.log(error);
                console.log("final callback: " + macAdr)
            }
        });
    },
    start: false,
    timeZone: TIME_ZONE,
    runOnInit: true
});

//Initiate CRON Job
job.start();
