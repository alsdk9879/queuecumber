declare class Queuecumber {
    version: string;
    private items;
    private breakWhenError;
    private batchSize;
    private onProgress?;
    private _isRunning;
    private _lastResult;
    private totalBatches;
    private completedBatches;
    constructor(option?: {
        breakWhenError?: boolean;
        onProgress?: (progress: {
            totalBatches: number;
            completedBatches: number;
            lastResult: any;
        }) => void;
        batchSize?: number;
    });
    get isRunning(): boolean;
    set isRunning(value: boolean);
    add(jobs: (() => Promise<any>)[], batchSize?: number): Promise<void>;
    private processNext;
}
export default Queuecumber;
//# sourceMappingURL=index.d.ts.map