/**
 * 진행 상황 정보 타입
 * @remarks onProgress 콜백에 전달되는 진행 상황 데이터
 */
export interface IProgressInfo {
  /** 남은 배치 수 */
  batchToProcess: number;
  /** 남은 작업 수 */
  itemsToProcess: number;
  /** 완료된 작업 결과 배열 */
  completed: any[];
}

/**
 * Queuecumber 생성자 옵션
 */
export interface IQueuecumberOptions {
  /** 에러 발생 시 즉시 중단할지 여부 (기본값: false) */
  breakWhenError?: boolean;
  /** 배치 완료 시 호출되는 진행 상황 콜백 */
  onProgress?: (progress: IProgressInfo) => void;
  /** 한 번에 처리할 작업 수 (기본값: 1, 최소값: 1) */
  batchSize?: number;
}

/**
 * Queuecumber 공개 인터페이스
 * @remarks 작업 큐 관리 및 배치 실행을 위한 public API 정의
 */
export interface IQueuecumber {
  /** 라이브러리 버전 정보 */
  version: string;

  /**
   * 작업을 큐에 추가하고 처리 시작
   * @param jobs Promise를 반환하는 함수 또는 함수 배열
   * @throws {Error} jobs가 함수가 아닌 경우
   */
  add(jobs: (() => Promise<any>)[] | (() => Promise<any>)): void;

  /**
   * 큐에 대기 중인 모든 작업 제거
   * @remarks 현재 실행 중인 작업은 중단하지 않음
   */
  terminate(): void;
}
