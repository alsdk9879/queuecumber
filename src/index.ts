import type {
  IProgressInfo,
  IQueuecumber,
  IQueuecumberOptions,
} from "./types.js";

/**
 * 작업 큐 배치 처리 라이브러리
 * @remarks Promise 기반 작업을 배치 단위로 순차 실행하며, 에러 처리 및 진행 상황 추적 기능 제공
 */
class Queuecumber implements IQueuecumber {
  /** 라이브러리 버전 정보 */
  version = "1.0.12";

  // ==================== Private Fields ====================

  /** 대기 중인 작업 큐 */
  private items: (() => Promise<any>)[] = [];

  /** 에러 발생 시 중단 여부 */
  private breakWhenError: boolean = false;

  /** 한 번에 처리할 작업 수 */
  private batchSize: number = 1;

  /** 진행 상황 콜백 */
  private onProgress?: (progress: IProgressInfo) => void;

  /** 현재 배치의 완료된 작업 결과 배열 */
  private completed: any[] = [];

  /** 현재 실행 중인 배치의 작업 배열 */
  private runningBatches: (() => Promise<any>)[] = [];

  /** 실행 중인 슬롯 상태 배열 */
  private runningSlots: boolean[] = [];

  // ==================== Private Getters ====================

  /**
   * 남은 배치 수 계산
   * @returns 처리해야 할 남은 배치 수
   */
  private get batchToProcess() {
    return Math.ceil(this.items.length / this.batchSize);
  }

  /**
   * 현재 배치 처리 완료 여부 확인 및 콜백 호출
   * @returns 배치 처리가 완료되었는지 여부
   * @remarks 배치 완료 시 onProgress 콜백 호출 후 상태 초기화
   */
  private get batchProcessFinished() {
    let completedCount = Object.keys(this.completed).length;
    let isFinished = completedCount === this.runningBatches.length;

    if (isFinished) {
      const completed = this.completed;

      // 콜백 호출 전 상태 초기화
      this.completed = [];
      this.runningBatches = [];
      this.runningSlots = [];

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

  // ==================== Constructor ====================

  /**
   * Queuecumber 인스턴스 생성
   * @param option 큐 설정 옵션
   * @throws {Error} batchSize가 1 미만인 경우
   * @throws {Error} onProgress가 함수가 아닌 경우
   */
  constructor(option?: IQueuecumberOptions) {
    this.breakWhenError = !!option?.breakWhenError;
    this.batchSize = option?.batchSize ?? 1;

    if (typeof this.batchSize !== "number" || this.batchSize < 1) {
      throw new Error("batchSize must be at least 1");
    }

    if (option?.onProgress) {
      if (typeof option.onProgress === "function") {
        this.onProgress = option.onProgress;
      } else {
        throw new Error("onProgress must be a function");
      }
    }
  }

  // ==================== Public Methods ====================

  /**
   * 작업을 큐에 추가하고 처리 시작
   * @param jobs Promise를 반환하는 함수 또는 함수 배열
   * @throws {Error} 작업이 함수가 아닌 경우
   * @remarks 작업을 큐에 추가한 후 즉시 processNext()를 호출하여 처리 시작
   */
  add(jobs: (() => Promise<any>)[] | (() => Promise<any>)) {
    const jobsArray = Array.isArray(jobs) ? jobs : [jobs];

    for (const job of jobsArray) {
      if (typeof job !== "function") {
        throw new Error("Each job must be a function that returns a Promise");
      }
      this.items.push(job);
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
  private processNext() {
    if (this.items.length === 0) {
      return;
    }

    const batchToRun = this.batchSize - this.runningBatches.length;
    if (batchToRun <= 0) {
      return;
    }

    this.runningBatches.push(...this.items.splice(0, batchToRun));

    for (let i = 0; i < this.runningBatches.length; i++) {
      if (this.runningSlots?.[i]) {
        continue;
      }

      this.runningSlots[i] = true;
      (this.runningBatches[i] as () => Promise<any>)()
        .then((result) => {
          if (this.completed[i]) {
            return result;
          }

          this.completed[i] = result;

          if (this.batchProcessFinished) {
            return this.processNext();
          }

          return result;
        })
        .catch((err) => {
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
export type { IQueuecumber, IQueuecumberOptions, IProgressInfo } from "./types.js";
