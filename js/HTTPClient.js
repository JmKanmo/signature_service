class HTTPClient {
    constructor() {
        // TODO 
    }

    sendRequestToS3(s3Url, successCallback) {
     // 요청을 초기화: 'GET' 메서드, 비동기 요청
     const xhr = new XMLHttpRequest();
     xhr.open('GET', s3Url, true);

     // 요청이 완료되었을 때 실행할 함수
     xhr.onreadystatechange = function() {
         if (xhr.readyState === 4) { // 요청 완료
             if (xhr.status === 200) { // HTTP 상태 코드 200: 성공
                 // 응답된 HTML을 페이지에 삽입
                 if(successCallback != null && successCallback) {
                    successCallback(xhr.responseText);
                 }
             } else {
                 console.error('Failed to load content from S3:', xhr.statusText);
                 alert('Failed to load content from S3:', xhr.statusText);
             }
         }
     };
     // 요청을 전송
     xhr.send();
    }
}