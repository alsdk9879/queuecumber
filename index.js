class Queuecumber {
    version = "1.0.7"; // 버전 정보
    items = []; // 작업 큐
    breakWhenError = false; // 에러 발생 시 중단 여부
    batchSize = 1; // 한 번에 처리할 작업 수
    onProgress; // 진행 상황 콜백
    isRunning = false; // 실행 중인지 여부
    totalBatches = 0; // 총 작업 묶음 수
    completedBatches = 0; // 완료된 작업 묶음 수
    completed = []; // 완료된 작업 결과 배열
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
        let addedBatches = 0; // 새로 추가된 배치 수 카운트
        // 처리가 처음이라면 초기화
        const isFirstRun = !this.isRunning;
        if (isFirstRun) {
            this.isRunning = true;
            this.totalBatches = 0;
            this.completedBatches = 0;
            this.completed = [];
        }
        // 마지막 배치가 꽉 차지 않았다면, 채우기
        if (this.items.length > 0) {
            const lastBatch = this.items[this.items.length - 1]; // 마지막 배치
            // lastBatch가 존재하는지 명시적으로 체크
            if (lastBatch && lastBatch.length < size) {
                const remainingSpace = size - lastBatch.length; // 마지막 배치에 남은 공간
                if (remainingSpace > 0 && jobs.length > 0) {
                    const jobsToFill = jobs.splice(0, remainingSpace);
                    lastBatch.push(...jobsToFill);
                }
            }
        }
        // jobs를 batchSize 단위로 잘라서 배열로 묶기
        for (let i = 0; i < jobs.length; i += size) {
            const batch = jobs.slice(i, i + size);
            this.items.push(batch);
            addedBatches++; // 새로 추가된 배치만 카운트
        }
        this.totalBatches += addedBatches; // 총 작업 묶음 수 업데이트
        // 시작 시 진행 상황 콜백 호출
        if (isFirstRun) {
            if (this.onProgress) {
                this.onProgress({
                    totalBatches: this.totalBatches,
                    completedBatches: this.completedBatches,
                    completed: this.completed,
                });
            }
            this.processNext();
        }
    }
    // 다음 작업 묶음 처리
    async processNext() {
        // 큐가 비었으면 종료
        if (this.items.length === 0) {
            this.isRunning = false; // 실행 종료
            return;
        }
        // 첫 번째 배치 꺼내기
        const batch = this.items.shift();
        if (!batch) {
            this.processNext();
            return;
        }
        // 이번 배치 병렬 실행
        const results = await Promise.all(batch.map(async (job) => {
            try {
                return await job();
            }
            catch (err) {
                if (this.breakWhenError) {
                    this.isRunning = false;
                    throw err;
                }
                return err; // 에러 무시
            }
        }));
        this.completedBatches++; // 완료된 작업 묶음 수 증가
        this.completed.push(...results); // 완료된 작업 결과 배열에 추가
        // 진행 상황 콜백 호출
        if (this.onProgress) {
            this.onProgress({
                totalBatches: this.totalBatches,
                completedBatches: this.completedBatches,
                completed: this.completed,
            });
        }
        // 다음 배치 처리
        this.processNext();
    }
}
export default Queuecumber;
//# sourceMappingURL=index.js.map