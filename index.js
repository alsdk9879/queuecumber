class Queuecumber {
    items = [];
    breakWhenError = false;
    runFlagCallback;
    theEnd = () => {
        console.log("Queue is empty now.");
    };
    constructor(option) {
        this.breakWhenError = option?.breakWhenError || false;
        if (option?.runFlagCallback) {
            this.runFlagCallback = option?.runFlagCallback;
        }
    }
    add(q) {
        this.items.push(q);
        if (this.runFlag)
            return;
        this.run();
    }
    _runFlag = false;
    _lastResult = null;
    get runFlag() {
        return this._runFlag;
    }
    set runFlag(value) {
        this._runFlag = value;
        if (this.runFlagCallback && value === false)
            this.runFlagCallback(this._lastResult);
    }
    async run() {
        if (this.items.length === 0) {
            this.runFlag = false;
            return;
        }
        const q = this.items.shift();
        if (!q) {
            this.runFlag = false;
            return;
        }
        try {
            this.runFlag = true;
            this._lastResult = await q();
            this.run();
        }
        catch (err) {
            if (this.breakWhenError) {
                this.runFlag = false;
                throw err;
            }
            this.run();
        }
    }
}
export default Queuecumber;
//# sourceMappingURL=index.js.map