class Queuecumber {
    private items: (() => Promise<any>)[][] = [];
    private breakWhenError: boolean = false; // 에러 발생 시 중단 여부
    private runFlagCallback?: (flag: boolean) => void; // 실행 완료 콜백
    private batchSize: number = 1; // 한 번에 처리할 작업 수

    private _runFlag = false; // 실행 중인지 여부
    private _lastResult: any = null; // 마지막 작업 결과

    // 작업 완료 시 호출되는 콜백 (기본 구현)
    public theEnd = () => {
        console.log("Queue is empty now.");
    };

    constructor(option?: {
        breakWhenError?: boolean;
        runFlagCallback?: (flag: boolean) => void;
        batchSize?: number;
    }) {
        this.breakWhenError = option?.breakWhenError || false;
        this.batchSize = option?.batchSize || 1;

        if (option?.runFlagCallback) {
            this.runFlagCallback = option?.runFlagCallback;
        }
    }

    // 실행 중인 작업이 있는지 여부
    get runFlag() {
        return this._runFlag;
    }

    // 실행 상태 변경 시 콜백 호출
    set runFlag(value: boolean) {
        this._runFlag = value;
        if (this.runFlagCallback && value === false) {
            this.runFlagCallback(this._lastResult);
        }
    }

    // 작업 배열을 한 번에 추가
    async add(jobs: (() => Promise<any>)[], batchSize?: number) {
        const size = batchSize || this.batchSize;

        // jobs를 batchSize 단위로 잘라서 배열로 묶기
        for (let i = 0; i < jobs.length; i += size) {
            const batch = jobs.slice(i, i + size);
            this.items.push(batch);
        }

        // 실행 중이 아니면 시작
        if (!this.runFlag) {
            this.runFlag = true;
            await this.processNext(); // 다음 작업 묶음 처리 시작
        }
    }

    // 다음 작업 묶음 처리
    private async processNext() {
        // 큐가 비었으면 종료
        if (this.items.length === 0) {
            this.runFlag = false; // 실행 종료 (콜백 트리거)
            this.theEnd();
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

            // 마지막 결과 저장 (배치의 마지막 작업 결과)
            this._lastResult = results[results.length - 1];

            console.log(`✅ Batch 완료 (${batch.length}개)`);
        } catch (err) {
            // breakWhenError가 true면 여기서 중단
            this.runFlag = false;
            throw err;
        }

        // 다음 배치 처리
        await this.processNext();
    }
}

export default Queuecumber;
