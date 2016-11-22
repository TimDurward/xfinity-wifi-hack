var x = require('casper').selectXPath;

var mainUrl = casper.cli.get("url");

var x = require('casper').selectXPath;
casper.options.viewportSize = { width: 1262, height: 1076 };
casper.on('page.error', function (msg, trace) {
    this.echo('Error: ' + msg, 'ERROR');
    for (var i = 0; i < trace.length; i++) {
        var step = trace[i];
        this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
    }
});
casper.test.begin('Resurrectio test', function (test) {
    casper.start(mainUrl)
    casper.then(function () {
        this.mouse.click(480, 318);
    });
    casper.waitForSelector("form[name=purchaseForm] input[name='spn_postal']",
        function success() {
            console.log("test");
            test.assertExists("form[name=purchaseForm] input[name='spn_postal']");
            this.click("form[name=purchaseForm] input[name='spn_postal']");
        },
        function fail() {
            test.assertExists("form[name=purchaseForm] input[name='spn_postal']");
        });
    casper.waitForSelector("input[name='spn_postal']",
        function success() {
            this.sendKeys("input[name='spn_postal']", "97000");
        },
        function fail() {
            test.assertExists("input[name='spn_postal']");
        });
    casper.waitForSelector("form[name=purchaseForm] input[name='spn_email']",
        function success() {
            test.assertExists("form[name=purchaseForm] input[name='spn_email']");
            this.click("form[name=purchaseForm] input[name='spn_email']");
        },
        function fail() {
            test.assertExists("form[name=purchaseForm] input[name='spn_email']");
        });
    casper.waitForSelector("input[name='spn_email']",
        function success() {
            this.sendKeys("input[name='spn_email']", "test@gmail.com");
        },
        function fail() {
            test.assertExists("input[name='spn_email']");
        });
    casper.waitForSelector("form[name=purchaseForm] input[name='spn_terms']",
        function success() {
            test.assertExists("form[name=purchaseForm] input[name='spn_terms']");
            this.click("form[name=purchaseForm] input[name='spn_terms']");
        },
        function fail() {
            test.assertExists("form[name=purchaseForm] input[name='spn_terms']");
        });
    casper.waitForSelector("form[name=purchaseForm] input[type=button][value='submit']",
        function success() {
            test.assertExists("form[name=purchaseForm] input[type=button][value='submit']");
            this.click("form[name=purchaseForm] input[type=button][value='submit']");
        },
        function fail() {
            test.assertExists("form[name=purchaseForm] input[type=button][value='submit']");
        });

    casper.run(function () { test.done(); });
});