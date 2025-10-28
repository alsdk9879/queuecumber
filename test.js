import Queuecumber from "./index.js";

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

// 딜레이 함수
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 테스트 함수
async function testQueuecumber() {
    console.log("🚀 Queuecumber 테스트 시작\n");

    const queue = new Queuecumber({
        breakWhenError: false,
        batchSize: 3,
        onProgress: ({ totalBatches, completedBatches, completed }) => {
            console.log(`[진행률] ${completedBatches}/${totalBatches} batches`);
            console.log(
                "완료된 작업:",
                completed.map((r) =>
                    r instanceof Error ? `Error: ${r.message}` : r
                )
            );
            console.log("---");
        },
    });

    // ========== 테스트 1: 초기화 확인 (작업A 완료 → 작업B 시작) ==========
    console.log("📦 테스트 1: 초기화 확인");
    console.log("작업 A 시작 (5개 job)\n");

    queue.add([
        createJob(1, 500),
        createJob(2, 500),
        createJob(3, 500, true), // 실패
        createJob(4, 500),
        createJob(5, 500),
    ]);

    // 작업 A가 완전히 끝날 때까지 대기 (배치 2개 * 500ms + 여유)
    await delay(2000);

    console.log("\n✅ 작업 A 완료!\n");
    console.log("작업 B 시작 (5개 job)\n");

    queue.add([
        createJob(6, 500),
        createJob(7, 500),
        createJob(8, 500, true), // 실패
        createJob(9, 500),
        createJob(10, 500),
    ]);

    // 작업 B가 완전히 끝날 때까지 대기
    await delay(2000);

    console.log("\n✅ 작업 B 완료! (0/2부터 시작했는지 확인)\n");

    // ========== 테스트 2: 실행 중 추가 (초기화 안됨 확인) ==========
    await delay(1000);

    console.log("📦 테스트 2: 실행 중 추가 확인");
    console.log("작업 C 시작 (3개 job)\n");

    queue.add([createJob(11, 800), createJob(12, 800), createJob(13, 800)]);

    // 첫 번째 배치 실행 중에 추가
    await delay(500);
    console.log("⚡ 실행 중 2개 추가!\n");

    queue.add([createJob(14, 500), createJob(15, 500)]);

    // 모든 작업 완료 대기
    await delay(2000);

    console.log("\n✅ 작업 C 완료! (초기화 안되고 이어서 실행됐는지 확인)\n");

    console.log("🎉 모든 테스트 완료!");
}

// 테스트 실행
testQueuecumber().catch(console.error);
