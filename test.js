import Queuecumber from "./index.js";

// 테스트 함수
async function testQueuecumber() {
    // 작업 생성기
    const createJob =
        (id, duration, shouldFail = false) =>
        () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (shouldFail) {
                        reject(new Error(`Job ${id} failed`));
                    } else {
                        resolve(`Job ${id} completed`);
                    }
                }, duration);
            });
        };

    // Queuecumber 인스턴스 생성
    const queue = new Queuecumber({
        breakWhenError: false,
        batchSize: 3, // 배치 크기 설정
        onProgress: ({ totalBatches, completedBatches, completed }) => {
            console.log(
                `Progress: ${completedBatches}/${totalBatches} batches completed.`
            );
            console.log("Completed results:", completed);
        },
    });

    // 작업 묶음 추가
    queue.add([
        createJob(1, 1000),
        createJob(2, 1000),
        createJob(3, 3000, true), // 이 작업은 실패함
        createJob(4, 1000),
        createJob(5, 5000),
    ]);

    // 작업 묶음 추가
    queue.add([
        createJob(6, 1000),
        createJob(7, 1000),
        createJob(8, 3000, true), // 이 작업은 실패함
        createJob(9, 1000),
        createJob(10, 5000),
    ]);
}

// 테스트 실행
testQueuecumber();
