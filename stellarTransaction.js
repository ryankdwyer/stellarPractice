var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

class Transaction {
    constructor (source, sourceKeys) {
        this.transaction;
        this.source = source;
        this.sourceKeys = sourceKeys;
    }

    verifyDestination(destinationKey) {
        return server.loadAccount(destinationKey);
    }

    verifySource() {
        return server.loadAccount(this.source);
    }

    sendPayment(destinationKey, asset, amount, memo=undefined) {
        return this.verifyDestination(destinationKey)
        .then(function() {
            return this.verifySource();
        }).then(function() {
            this.transaction = new StellarSdk.TransactionBuilder(sourceAccount);
            this.transaction.
                addOperation(StellarSdk.Operation.payment({
                    destination: destinationKey,
                    asset: StellarSdk.Asset.native(),
                    amount: amount,
                }))
                .addMemo(StellarSdk.Memo.text(memo))
                .build(); 

            this.transaction.sign();

            return server.submitTransaction(this.transaction);
        });
    }
}

module.exports = Transaction;
