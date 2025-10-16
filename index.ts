class Queuecumber {
    version = "1.0.3"; // 버전 정보

    private items: (() => Promise<any>)[][] = []; // 작업 큐
    private breakWhenError: boolean = false; // 에러 발생 시 중단 여부
    private batchSize: number = 1; // 한 번에 처리할 작업 수
    private onProgress?: (progress: {
        totalBatches: number; // 총 작업 묶음 수
        completedBatches: number; // 완료된 작업 묶음 수
        completed?: any[]; // 완료된 작업 결과 배열
    }) => void; // 진행 상황 콜백

    private _isRunning = false; // 실행 중인지 여부
    private totalBatches: number = 0; // 총 작업 묶음 수
    private completedBatches: number = 0; // 완료된 작업 묶음 수
    private completed: any[] = []; // 완료된 작업 결과 배열

    constructor(option?: {
        breakWhenError?: boolean;
        onProgress?: (progress: {
            totalBatches: number;
            completedBatches: number;
            completed?: any[];
        }) => void;
        batchSize?: number;
    }) {
        this.breakWhenError = option?.breakWhenError || false;
        this.batchSize = option?.batchSize || 1;

        if (option?.onProgress) {
            this.onProgress = option.onProgress;
        }
    }

    // 실행 중인 작업이 있는지 여부
    get isRunning() {
        return this._isRunning;
    }

    // 작업 배열을 한 번에 추가
    async add(jobs: (() => Promise<any>)[], batchSize?: number) {
        const size = batchSize || this.batchSize;

        // jobs를 batchSize 단위로 잘라서 배열로 묶기
        for (let i = 0; i < jobs.length; i += size) {
            const batch = jobs.slice(i, i + size);
            this.items.push(batch);
        }

        this.totalBatches = this.items.length; // 총 작업 묶음 수 업데이트

        // 실행 중이 아니면 시작
        if (!this._isRunning) {
            this._isRunning = true; // 실행 시작
            this.completedBatches = 0; // 완료된 작업 묶음 수 초기화
            this.completed = []; // 완료된 작업 결과 배열 초기화

            // 시작 시 진행 상황 콜백 호출
            if (this.onProgress) {
                this.onProgress({
                    totalBatches: this.totalBatches,
                    completedBatches: this.completedBatches,
                    completed: [...this.completed],
                });
            }

            await this.processNext(); // 다음 작업 묶음 처리 시작
        }
    }

    // 다음 작업 묶음 처리
    private async processNext() {
        // 큐가 비었으면 종료
        if (this.items.length === 0) {
            this._isRunning = false; // 실행 종료
            return;
        }

        // 첫 번째 배치 꺼내기
        const batch = this.items.shift();

        if (!batch) {
            this.processNext();
            return;
        }

        try {
            // 이번 배치 병렬 실행
            const results = await Promise.all(
                batch.map(async (job) => {
                    try {
                        return await job();
                    } catch (err) {
                        if (this.breakWhenError) {
                            throw err;
                        }
                        return null; // 에러 무시
                    }
                })
            );

            this.completedBatches++; // 완료된 작업 묶음 수 증가
            this.completed.push(...results); // 완료된 작업 결과 배열에 추가

            // 진행 상황 콜백 호출
            if (this.onProgress) {
                this.onProgress({
                    totalBatches: this.totalBatches,
                    completedBatches: this.completedBatches,
                    completed: [...this.completed],
                });
            }
        } catch (err) {
            // breakWhenError가 true면 여기서 중단
            this._isRunning = false;
            throw err;
        }

        // 다음 배치 처리
        await this.processNext();
    }
}

export default Queuecumber;
