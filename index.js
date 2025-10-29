class Queuecumber {
    version = "1.0.8"; // 버전 정보
    items = []; // 작업 큐
    breakWhenError = false; // 에러 발생 시 중단 여부
    batchSize = 1; // 한 번에 처리할 작업 수
    onProgress; // 진행 상황 콜백
    isRunning = false; // 실행 중인지 여부
    completed = []; // 완료된 작업 결과 배열
    runningBatches = []; // 현재 실행 중인 작업 묶음 수
    get batchToProcess() {
        // 총 배치 수 업데이트
        return Math.ceil(this.items.length / this.batchSize);
    }
    get batchProcessFinished() {
        let completedCount = Object.keys(this.completed).length;
        let isFinished = completedCount === this.runningBatches.length;
        if (isFinished) {
            const completed = this.completed; // 복사
            // 콜백 호출전 미리 상태 초기화
            this.completed = [];
            this.runningBatches = [];
            if (this.onProgress) {
                this.onProgress({
                    batchToProcess: this.batchToProcess,
                    itemsToProcess: this.items.length,
                    completed: completed,
                });
            }
        }
        return isFinished;
    }
    constructor(option) {
        this.breakWhenError = !!option?.breakWhenError;
        this.batchSize = option?.batchSize ?? 1;
        if (typeof this.batchSize !== "number" || this.batchSize < 1) {
            throw new Error("batchSize must be at least 1");
        }
        if (typeof option?.onProgress === "function") {
            this.onProgress = option.onProgress;
        }
    }
    // 작업 배열을 한 번에 추가
    add(jobs) {
        const size = this.batchSize;
        // jobs가 배열인지 확인하고, 아니면 배열로 변환
        const jobsArray = Array.isArray(jobs) ? jobs : [jobs];
        // jobsArray의 각 작업이 함수인지 확인, 맞으면 큐에 추가
        for (const job of jobsArray) {
            if (typeof job !== "function") {
                throw new Error("Each job must be a function that returns a Promise");
            }
            this.items.push(job);
        }
        this.processNext();
    }
    // 다음 작업 묶음 처리
    processNext() {
        // 큐가 비었으면 종료
        if (this.items.length === 0) {
            return;
        }
        const batchToRun = this.batchSize - this.runningBatches.length;
        if (batchToRun <= 0) {
            // 현재 실행 중인 배치가 최대치에 도달했으면 종료
            return;
        }
        // batchToRun 만큼 꺼내기
        this.runningBatches.push(...this.items.splice(0, batchToRun));
        for (let i = 0; i < this.runningBatches.length; i++) {
            this.runningBatches[i]().then(result => {
                if (this.completed[i]) {
                    return result;
                }
                this.completed[i] = result;
                if (this.batchProcessFinished) {
                    return this.processNext();
                }
                return result;
            }).catch((err) => {
                // 에러 처리
                if (this.breakWhenError) {
                    throw err;
                }
                this.completed[i] = err;
                if (this.batchProcessFinished) {
                    return this.processNext();
                }
                return err;
            });
        }
    }
}
export default Queuecumber;
//# sourceMappingURL=index.js.map