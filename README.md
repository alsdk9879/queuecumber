# Queuecumber

## 1. 소개 (Introduction)

Queuecumber는 **작업을 순서대로 처리**하는 JavaScript/TypeScript 큐 라이브러리입니다.  
배치 단위 실행, 에러 처리 옵션, 작업 완료 콜백 등을 지원합니다.

---

## 2. 설치 (Installation)

```bash
# npm
npm install queuecumber

# yarn
yarn add queuecumber

# import Queuecumber from "queuecumber";

# const queue = new Queuecumber();

# const job1 = () => Promise.resolve("job1 완료");
# const job2 = () => Promise.resolve("job2 완료");

# queue.add([job1, job2]);

# const queue = new Queuecumber({
#     batchSize: 2,           // 한 번에 처리할 작업 수
#     breakWhenError: false,  // 에러 발생 시 중단 여부
#     runFlagCallback: (lastResult) => {
#         console.log("모든 작업 완료! 마지막 결과:", lastResult);
#     }
# });

# queue.theEnd = () => {
#     console.log("🎉 모든 작업 끝!");
# };
```
