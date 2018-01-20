const StellarSdk = require('stellar-sdk');
const fs = require('fs');
const request = require('request-promise-native');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const Transaction = require('./stellarTransaction.js');


class StellarAccount {
    constructor () {
        this.account = this.createOrLoadStellarAccount();
    }

    loadConfig() {
        let data = fs.readFileSync('/Users/ryan/stellar.conf').toString();
        return data;
    }
    
    createOrLoadStellarAccount () {
        let currConf = this.loadConfig();
        if (currConf) {
            let secretPub = currConf.split('|');
            return {
                secret: secretPub[0],
                pubKey: secretPub[1],
            };
        }
        return this.createAccount();
    }
    
    createAccount () {
        var pair = StellarSdk.Keypair.random();
        let secret = pair.secret();
        let pubKey = pair.publicKey();
        this.writeAccountToFile(secret, pubKey);
        return {
            secret: secret,
            pubKey: pubKey
        };
    }
    
    writeAccountToFile (secret, pubKey) {
        let fd = fs.openSync('/Users/ryan/stellar.conf', 'w+');
        fs.writeFileSync(fd, secret + '|' + pubKey);
    }

    loadAccount () {
        return server.loadAccount(this.account.pubKey)
        .then(function(acct) {
            if (!acct) {
                return this.registerAccount();
            }
            console.log("account: " + acct.id + ' already exists');
        })
    }

    registerAccount () {
        var pubKey = this.account.pubKey;
        return request.get({
            url: 'https://horizon-testnet.stellar.org/friendbot',
            qs: { addr: pubKey, startingBalance: '10000' },
            json: true,
        }).then(function(body) {
            console.log('Congrats, an account has been created: ', body.id);
        })
        .catch(function(err) {
            console.log('Uh oh, there was an error creating your account: ', err);
        });
    }

    sendAsset (assetType, amount, destination, memo=undefined) {
        let sourceKeys = StellarSdk.Keypair
          .fromSecret(this.account.secret);
        let transaction = new Transaction(this.account.pubKey, sourceKeys);
        return transaction.sendPayment(destination, assetType, amount, 'Wahooo');
    }
}

let acct = new StellarAccount();
acct.loadAccount();
acct.sendAsset('XLM', '100', '123123', 'YAY')
.then(function(body) {
    console.log(body);
})
.catch(function(err) {
    console.log(err);
});
