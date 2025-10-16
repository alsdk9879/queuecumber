declare class Queuecumber {
    private items;
    private breakWhenError;
    private runFlagCallback?;
    theEnd: () => void;
    constructor(option?: {
        breakWhenError?: boolean;
        runFlagCallback?: (flag: boolean) => void;
    });
    add(q: () => Promise<any>): void;
    _runFlag: boolean;
    _lastResult: any;
    get runFlag(): boolean;
    set runFlag(value: boolean);
    private run;
}
export default Queuecumber;
//# sourceMappingURL=index.d.ts.map