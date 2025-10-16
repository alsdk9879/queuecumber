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
        console.log("마지막 결과 : ", progress.lastResult);
    }
});
```

### 🔍 OnProgress

onProgress는 각 배치(batch)가 완료될 때마다 실행됩니다.

| 속성               | 설명                          |
| ------------------ | ----------------------------- |
| `totalBatches`     | 전체 배치 수                  |
| `completedBatches` | 완료된 배치 수                |
| `lastResult`       | 마지막으로 실행된 작업의 결과 |

### Check status

```bash
console.log(queue.isRunning); // 실행 중인지 여부
```

## ❗Handling Errors
Queuecumber는 에러 발생 시 중단할지 계속 진행할지를 직접 선택할 수 있습니다.
<br>
옵션 breakWhenError로 제어합니다.

### ✅ 에러 무시하고 계속 실행 (breakWhenError: false)
```bash
const queue = new Queuecumber({
  breakWhenError: false, // 기본값
});

const jobs = [
  () => Promise.resolve("첫 번째 성공"),
  () => Promise.reject("두 번째 실패 ❌"),
  () => Promise.resolve("세 번째 성공 ✅"),
];

queue.add(jobs).catch((err) => console.error("에러 발생:", err));
```

결과
```bash
첫 번째 성공
(두 번째 에러는 무시됨)
세 번째 성공
```

### 🛑 에러 발생 시 즉시 중단 (breakWhenError: true)
```bash
const queue = new Queuecumber({
  breakWhenError: true,
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
첫 번째 성공
두 번째 실패 → 큐 중단됨 ❌
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

• 배치 단위 처리(batchSize)
<br>
• 에러 발생 시 중단 여부(breakWhenError)
<br>
• 진행 상황 콜백(onProgress)
<br>
• 실행 상태 확인(isRunning)


## 📜 License
MIT © 2025 Oh Mina
