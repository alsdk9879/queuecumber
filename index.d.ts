declare class Queuecumber {
    version: string;
    private items;
    private breakWhenError;
    private batchSize;
    private onProgress?;
    private isRunning;
    private totalBatches;
    private completedBatches;
    private completed;
    constructor(option?: {
        breakWhenError?: boolean;
        onProgress?: (progress: {
            totalBatches: number;
            completedBatches: number;
            completed?: any[];
        }) => void;
        batchSize?: number;
    });
    add(jobs: (() => Promise<any>)[]): void;
    private processNext;
}
export default Queuecumber;
//# sourceMappingURL=index.d.ts.map