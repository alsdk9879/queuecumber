# Queuecumber

Queuecumber는 **작업을 순서대로 처리**하는 JavaScript/TypeScript 큐 라이브러리입니다.  
배치 단위 실행, 에러 처리 옵션, 작업 완료 콜백 등을 지원합니다.

## 📌 Getting started

```bash
# npm
npm install queuecumber

# yarn
yarn add queuecumber
```

## 📌 Usage

### Basic uses

```bash
import Queuecumber from "queuecumber";

const queue = new Queuecumber();

const job1 = () => Promise.resolve("job1 완료");
const job2 = () => Promise.resolve("job2 완료");

queue.add([job1, job2]);
```

### Option

Queuecumber는 생성 시 옵션을 설정할 수 있습니다.

```bash
const queue = new Queuecumber({
    batchSize: 2,           // 한 번에 처리할 작업 수
    breakWhenError: false,  // 에러 발생 시 중단 여부
    onProgress: (progress) => {
        console.log(`진행 상황 : ${progress.completedBatches}/${progress.totalBatches}`);
        console.log("완료된 작업들 : ", progress.completed);
    }
});
```

### 🔍 OnProgress

onProgress는 작업 시작 시, 각 배치(batch)가 완료될 때마다 실행됩니다.

| 속성               | 설명                                  |
| ------------------ | ------------------------------------- |
| `totalBatches`     | 전체 배치 수                          |
| `completedBatches` | 완료된 배치 수                        |
| `completed`        | 지금까지 완료된 모든 작업의 결과 배열 |

```bash
const queue = new Queuecumber({
    batchSize: 2,
    onProgress: (progress) => {
        console.log(progress);
    }
});

await queue.add([
    () => Promise.resolve("Job 1"),
    () => Promise.resolve("Job 2"),
    () => Promise.resolve("Job 3"),
    () => Promise.resolve("Job 4"),
]);

// 출력:
// { totalBatches: 2, completedBatches: 0, completed: [] }
// { totalBatches: 2, completedBatches: 1, completed: ["Job 1", "Job 2"] }
// { totalBatches: 2, completedBatches: 2, completed: ["Job 1", "Job 2", "Job 3", "Job 4"] }
```

### Check status

```bash
console.log(queue.isRunning); // 실행 중인지 여부 (true/false)
```

## ❗Handling Errors

Queuecumber는 에러 발생 시 중단할지 계속 진행할지를 직접 선택할 수 있습니다.
<br>
옵션 `breakWhenError`로 제어합니다.

### ✅ 에러 무시하고 계속 실행 (breakWhenError: false)

```bash
const queue = new Queuecumber({
  breakWhenError: false, // 기본값
  onProgress: (progress) => {
    console.log("완료된 작업: ", progress.completed);
  }
});

const jobs = [
  () => Promise.resolve("첫 번째 성공"),
  () => Promise.reject("두 번째 실패 ❌"),
  () => Promise.resolve("세 번째 성공 ✅"),
];

await queue.add(jobs);
```

결과

```bash
완료된 작업: []
완료된 작업: ["첫 번째 성공", null, "세 번째 성공"]
// 에러는 null로 처리되어 계속 진행함.
```

### 🛑 에러 발생 시 즉시 중단 (breakWhenError: true)

```bash
const queue = new Queuecumber({
  breakWhenError: true,
  onProgress: (progress) => {
    console.log(`완료된 작업: `, progress.completed);
  }
});

const jobs = [
  () => Promise.resolve("첫 번째 성공"),
  () => Promise.reject("두 번째 실패 ❌"),
  () => Promise.resolve("세 번째는 실행되지 않음 🚫"),
];

try {
  await queue.add(jobs);
} catch (err) {
  console.error("실행 중단됨:", err);
}
```

결과

```bash
완료된 작업: []
완료된 작업: ["첫 번째 성공"]
실행 중단됨: 두 번째 실패 ❌
// 에러 발생 시 즉시 중단되어 세 번째 작업은 실행되지 않음.
```

## 📌 Practical Example

```bash
const queue = new Queuecumber({
  batchSize: 5,
  onProgress: (progress) => {
    console.log(`Batch ${progress.completedBatches}/${progress.totalBatches} 완료`);
  },
});

const jobs = [];

for (let i = 0; i < 100; i++) {
    jobs.push(() => fetch(`/api/data/${i}`).then(res => res.json()));
}

queue.add(jobs);
```

## 📌 Features

• 배치 단위 처리(batchSize): 동시에 처리할 작업 수 지정
<br>
• 에러 발생 시 중단 여부(breakWhenError): 에러 발생 시 중단 여부 선택
<br>
• 진행 상황 추적(onProgress): 실시간으로 작업 진행 상황 확인
<br>
• 실행 상태 확인(isRunning): 현재 큐가 실행 중인지 확인

## 📜 License

MIT © 2025 Oh Mina
