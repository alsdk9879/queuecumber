class i {
  /** 라이브러리 버전 정보 */
  version = "1.0.12";
  // ==================== Private Fields ====================
  /** 대기 중인 작업 큐 */
  items = [];
  /** 에러 발생 시 중단 여부 */
  breakWhenError = !1;
  /** 한 번에 처리할 작업 수 */
  batchSize = 1;
  /** 진행 상황 콜백 */
  onProgress;
  /** 현재 배치의 완료된 작업 결과 배열 */
  completed = [];
  /** 현재 실행 중인 배치의 작업 배열 */
  runningBatches = [];
  /** 실행 중인 슬롯 상태 배열 */
  runningSlots = [];
  // ==================== Private Getters ====================
  /**
   * 남은 배치 수 계산
   * @returns 처리해야 할 남은 배치 수
   */
  get batchToProcess() {
    return Math.ceil(this.items.length / this.batchSize);
  }
  /**
   * 현재 배치 처리 완료 여부 확인 및 콜백 호출
   * @returns 배치 처리가 완료되었는지 여부
   * @remarks 배치 완료 시 onProgress 콜백 호출 후 상태 초기화
   */
  get batchProcessFinished() {
    let e = Object.keys(this.completed).length === this.runningBatches.length;
    if (e) {
      const s = this.completed;
      this.completed = [], this.runningBatches = [], this.runningSlots = [], this.onProgress && this.onProgress({
        batchToProcess: this.batchToProcess,
        itemsToProcess: this.items.length,
        completed: s
      });
    }
    return e;
  }
  // ==================== Constructor ====================
  /**
   * Queuecumber 인스턴스 생성
   * @param option 큐 설정 옵션
   * @throws {Error} batchSize가 1 미만인 경우
   * @throws {Error} onProgress가 함수가 아닌 경우
   */
  constructor(t) {
    if (this.breakWhenError = !!t?.breakWhenError, this.batchSize = t?.batchSize ?? 1, typeof this.batchSize != "number" || this.batchSize < 1)
      throw new Error("batchSize must be at least 1");
    if (t?.onProgress)
      if (typeof t.onProgress == "function")
        this.onProgress = t.onProgress;
      else
        throw new Error("onProgress must be a function");
  }
  // ==================== Public Methods ====================
  /**
   * 작업을 큐에 추가하고 처리 시작
   * @param jobs Promise를 반환하는 함수 또는 함수 배열
   * @throws {Error} 작업이 함수가 아닌 경우
   * @remarks 작업을 큐에 추가한 후 즉시 processNext()를 호출하여 처리 시작
   */
  add(t) {
    const e = Array.isArray(t) ? t : [t];
    for (const s of e) {
      if (typeof s != "function")
        throw new Error("Each job must be a function that returns a Promise");
      this.items.push(s);
    }
    this.processNext();
  }
  /**
   * 큐에 대기 중인 모든 작업 제거
   * @remarks 현재 실행 중인 runningBatches의 작업은 중단하지 않고 계속 실행됨
   */
  terminate() {
    this.items = [];
  }
  // ==================== Private Methods ====================
  /**
   * 다음 배치 작업 처리 시작
   * @remarks 큐에서 batchSize만큼 작업을 꺼내 동시 실행
   */
  processNext() {
    if (this.items.length === 0)
      return;
    const t = this.batchSize - this.runningBatches.length;
    if (!(t <= 0)) {
      this.runningBatches.push(...this.items.splice(0, t));
      for (let e = 0; e < this.runningBatches.length; e++)
        this.runningSlots?.[e] || (this.runningSlots[e] = !0, this.runningBatches[e]().then((s) => this.completed[e] ? s : (this.completed[e] = s, this.batchProcessFinished ? this.processNext() : s)).catch((s) => {
          if (this.breakWhenError)
            throw s;
          return this.completed[e] = s, this.batchProcessFinished ? this.processNext() : s;
        }));
    }
  }
}
export {
  i as default
};
//# sourceMappingURL=index.js.map
