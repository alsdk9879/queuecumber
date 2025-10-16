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
```bash
const queue = new Queuecumber({
    batchSize: 2,           // 한 번에 처리할 작업 수
    breakWhenError: false,  // 에러 발생 시 중단 여부
    runFlagCallback: (lastResult) => {
        console.log("모든 작업 완료! 마지막 결과:", lastResult);
    }
});
```

### Customizing
```bash
// theEnd
queue.theEnd = () => {
    console.log("🎉 모든 작업 끝!");
};
```

### Check status
```bash
console.log(queue.runFlag); // 실행 중인지 여부
```

## 📌 Practical Example

### Check status
```bash
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
• 마지막 결과 전달(runFlagCallback)
<br>
• 큐 완료 후 커스텀 동작 가능(theEnd)
<br>
• 실행 상태 확인(runFlag)
