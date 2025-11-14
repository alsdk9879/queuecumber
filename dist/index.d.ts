import { IQueuecumber, IQueuecumberOptions } from './types.js';
/**
 * 작업 큐 배치 처리 라이브러리
 * @remarks Promise 기반 작업을 배치 단위로 순차 실행하며, 에러 처리 및 진행 상황 추적 기능 제공
 */
declare class Queuecumber implements IQueuecumber {
    /** 라이브러리 버전 정보 */
    version: string;
    /** 대기 중인 작업 큐 */
    private items;
    /** 에러 발생 시 중단 여부 */
    private breakWhenError;
    /** 한 번에 처리할 작업 수 */
    private batchSize;
    /** 진행 상황 콜백 */
    private onProgress?;
    /** 현재 배치의 완료된 작업 결과 배열 */
    private completed;
    /** 현재 실행 중인 배치의 작업 배열 */
    private runningBatches;
    /** 실행 중인 슬롯 상태 배열 */
    private runningSlots;
    /**
     * 남은 배치 수 계산
     * @returns 처리해야 할 남은 배치 수
     */
    private get batchToProcess();
    /**
     * 현재 배치 처리 완료 여부 확인 및 콜백 호출
     * @returns 배치 처리가 완료되었는지 여부
     * @remarks 배치 완료 시 onProgress 콜백 호출 후 상태 초기화
     */
    private get batchProcessFinished();
    /**
     * Queuecumber 인스턴스 생성
     * @param option 큐 설정 옵션
     * @throws {Error} batchSize가 1 미만인 경우
     * @throws {Error} onProgress가 함수가 아닌 경우
     */
    constructor(option?: IQueuecumberOptions);
    /**
     * 작업을 큐에 추가하고 처리 시작
     * @param jobs Promise를 반환하는 함수 또는 함수 배열
     * @throws {Error} 작업이 함수가 아닌 경우
     * @remarks 작업을 큐에 추가한 후 즉시 processNext()를 호출하여 처리 시작
     */
    add(jobs: (() => Promise<any>)[] | (() => Promise<any>)): void;
    /**
     * 큐에 대기 중인 모든 작업 제거
     * @remarks 현재 실행 중인 runningBatches의 작업은 중단하지 않고 계속 실행됨
     */
    terminate(): void;
    /**
     * 다음 배치 작업 처리 시작
     * @remarks 큐에서 batchSize만큼 작업을 꺼내 동시 실행
     */
    private processNext;
}
export default Queuecumber;
export type { IQueuecumber, IQueuecumberOptions, IProgressInfo } from './types.js';
//# sourceMappingURL=index.d.ts.map