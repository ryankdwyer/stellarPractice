class ArgParser {
    constructor(args) {
        if (!args || args.length % 2 == 1) {
            throw "No args passed!, or incorrect number of arguments passed";
            return;
        }
        this._args = args;
        this.processArgs();
    }
    processArgs() {
        // assumes that all properties start with --
        let len = this._args.length;
        let i;
        for (i = 0; i < len; i += 2) {
            let prop = this._args[i].substring(2);
            let val = this._args[i+1];
            this[prop] = val;
        }
    }
}

module.exports = ArgParser;
