declare class Queuecumber {
    version: string;
    private items;
    private breakWhenError;
    private batchSize;
    private onProgress?;
    private isRunning;
    private completed;
    private runningBatches;
    get batchToProcess(): number;
    get batchProcessFinished(): boolean;
    constructor(option?: {
        breakWhenError?: boolean;
        onProgress?: (progress: {
            batchToProcess: number;
            itemsToProcess?: number;
            completed?: any[];
        }) => void;
        batchSize?: number;
    });
    add(jobs: (() => Promise<any>)[] | (() => Promise<any>)): void;
    private processNext;
}
export default Queuecumber;
//# sourceMappingURL=index.d.ts.map