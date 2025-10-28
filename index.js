class Queuecumber {
    version = "1.0.8"; // 버전 정보
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
        // 처리가 처음이라면 초기화
        const isFirstRun = !this.isRunning;
        if (isFirstRun) {
            this.isRunning = true;
            this.totalBatches = 0;
            this.completedBatches = 0;
            this.completed = [];
        }
        // jobs가 배열인지 확인하고, 아니면 배열로 변환
        const jobsArray = Array.isArray(jobs) ? jobs : [jobs];
        // 배치로 묶지 않고 그냥 items에 추가
        this.items.push(...jobsArray);
        // // 총 배치 수 업데이트
        this.totalBatches += Math.ceil(jobsArray.length / size);
        // 첫 실행이면 processNext 호출
        if (isFirstRun) {
            // for문 모두 끝난 후 실행
            Promise.resolve().then(() => {
                // 초기 상태 알림
                if (this.onProgress) {
                    this.onProgress({
                        totalBatches: this.totalBatches,
                        completedBatches: this.completedBatches,
                        completed: this.completed,
                    });
                }
                // 첫 번째 배치 처리 시작
                this.processNext();
            });
        }
    }
    // 다음 작업 묶음 처리
    processNext() {
        // 큐가 비었으면 종료
        if (this.items.length === 0) {
            this.isRunning = false; // 실행 종료
            return;
        }
        // batchSize만큼 꺼내기
        const batch = this.items.splice(0, this.batchSize);
        return new Promise((resolve) => {
            let completedCount = 0; // 현재 배치에서 완료된 작업 개수
            const results = new Array(batch.length); // 결과 저장 배열
            // 배치 완료 처리 공통 함수
            const handleBatchComplete = () => {
                this.completedBatches++; // 완료된 배치 수 증가
                this.completed.push(...results); // 전체 완료 결과에 현재 배치 결과 추가
                // 진행 상황 콜백 호출
                if (this.onProgress) {
                    this.onProgress({
                        totalBatches: this.totalBatches,
                        completedBatches: this.completedBatches,
                        completed: this.completed,
                    });
                }
                resolve(this.completed); // 현재까지 완료된 결과 반환
                this.processNext(); // 다음 배치 처리
            };
            // 배치의 각 작업 처리
            batch.forEach((job, index) => {
                job()
                    .then((result) => {
                    results[index] = result;
                    completedCount++; // 완료 카운트 증가
                    // 배치의 모든 job이 완료되었는지 확인
                    if (completedCount === batch.length) {
                        handleBatchComplete();
                    }
                })
                    .catch((err) => {
                    // 에러 처리
                    if (this.breakWhenError) {
                        this.isRunning = false; // breakWhenError가 true면 즉시 중단
                        throw err;
                    }
                    // breakWhenError가 false면 에러를 결과에 포함하고 계속 진행
                    results[index] = err;
                    completedCount++;
                    if (completedCount === batch.length) {
                        handleBatchComplete();
                    }
                });
            });
        });
    }
}
export default Queuecumber;
//# sourceMappingURL=index.js.map