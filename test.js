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

// 테스트 코드
console.log("🚀 Queuecumber 테스트 시작\n");

let did2ndTest = false;

const onProgress = ({ batchToProcess, itemsToProcess, completed }) => {
    console.log(`남은 묶음 수: ${batchToProcess}`);
    console.log(`남은 작업 수: ${itemsToProcess}`);
    console.log(
        "완료된 작업:",
        completed.map((r) =>
            r instanceof Error ? `Error: ${r.message}` : r
        )
    );
    console.log("---");

    if (itemsToProcess === 0) {
        console.log("🚀 Queuecumber 테스트 완료");
        
        if(!did2ndTest) {
            console.log("\n🚀 Queuecumber 배열 추가 2차 테스트 시작\n");
            
            did2ndTest = true;
            testArray();
        }
    }
}

const queue = new Queuecumber({
    breakWhenError: false,
    batchSize: 3,
    onProgress: onProgress,
});

const testLoop = () => {
    for (let i = 1; i <= 14; i++) {
        queue.add(createJob(i, 800, i % 3 === 0)); // 3의 배수는 실패
    }
}

testLoop();

const testArray = () => {
    let jobs = [];
    for (let i = 1; i <= 14; i++) {
        jobs.push( createJob(i, 800, i % 3 === 0) ); // 3의 배수는 실패
    }
    queue.add(jobs);
}
