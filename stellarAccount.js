const StellarSdk = require('stellar-sdk');
const fs = require('fs');
const request = require('request-promise-native');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const Transaction = require('./stellarTransaction.js');


class StellarAccount {
    constructor (configPath) {
        if (!configPath) {
            throw "Config Path is required";
            return;
        }
        this.configPath = configPath;
        this.account = this.createOrLoadStellarAccount();
        console.log(this.configPath, this.account);
    }

    loadConfig() {
        console.log(this.configPath);
        let data = fs.readFileSync(this.configPath).toString();
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
        let fd = fs.openSync(this.configPath, 'w+');
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

    sendAsset (destination, assetType, amount, memo=undefined) {
        let sourceKeys = StellarSdk.Keypair.fromSecret(this.account.secret);
        let transaction = new Transaction(this.account.pubKey, sourceKeys);
        return transaction.sendPayment(destination, assetType, amount, 'Wahooo');
    }
}

module.exports = StellarAccount;
