const StellarSdk = require('stellar-sdk');
const StellarAccount = require('./stellarAccount.js');
const ArgParser = require('./cliArgParser.js');
let args = process.argv.slice(2);

(function(){
    let conf = new ArgParser(args);
    if (!conf.configPath) {
        throw "No configPath included";
    }
    let acct = new StellarAccount(conf.configPath);
    acct.loadAccount();
    //acct.sendAsset('123', StellarSdk.Asset.native(), '100', 'YAY')
    //.then(function(body) {
    //    console.log(body);
    //})
    //.catch(function(err) {
    //    console.log(err);
    //});
})();

