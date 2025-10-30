declare class Queuecumber {
    version: string;
    private items;
    private breakWhenError;
    private batchSize;
    private onProgress?;
    private completed;
    private runningBatches;
    private runningSlots;
    private get batchToProcess();
    private get batchProcessFinished();
    constructor(option?: {
        breakWhenError?: boolean;
        onProgress?: (progress: {
            batchToProcess: number;
            itemsToProcess: number;
            completed: any[];
        }) => void;
        batchSize?: number;
    });
    add(jobs: (() => Promise<any>)[] | (() => Promise<any>)): void;
    private processNext;
}
export default Queuecumber;
//# sourceMappingURL=index.d.ts.map