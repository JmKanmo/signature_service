/* 전역 변수 선언 */
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;


/* 이벤트 핸들러 등록 */
function initEventListener() {
// 서명 캔버스 설정
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', draw);
}

// 캔버스에 흰색 배경을 설정하는 함수
function setCanvasBackground() {
      const canvas = document.getElementById('signatureCanvas');
      const context = canvas.getContext('2d');
      
      // 흰색 배경으로 채우기
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
}

/* [START] 컨터스 유틸 메서드 */
function startDrawing(event) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(getX(event), getY(event));
    event.preventDefault();
}


function stopDrawing(event) {
    if (isDrawing) {
        isDrawing = false;
        ctx.stroke();
    }
    event.preventDefault();
}


function draw(event) {
    if (isDrawing) {
        ctx.lineTo(getX(event), getY(event));
        ctx.stroke();
    }
    event.preventDefault();
}


function getX(event) {
    if (event.touches && event.touches.length > 0) {
        return event.touches[0].clientX - canvas.getBoundingClientRect().left;
    } else {
        return event.clientX - canvas.getBoundingClientRect().left;
    }
}


function getY(event) {
    if (event.touches && event.touches.length > 0) {
        return event.touches[0].clientY - canvas.getBoundingClientRect().top;
    } else {
        return event.clientY - canvas.getBoundingClientRect().top;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();

    const downloadLinkBox = document.getElementById('downloadLinkBox');
    downloadLinkBox.replaceChildren();
}

function saveCanvasImage() {
   // 배경을 흰색으로 채우고, 그 위에 그림 그리기   
   const canvas = document.getElementById('signatureCanvas');
   const downloadLinkBox = document.getElementById('downloadLinkBox');

    // 서명 이미지를 저장할 수 있는 링크 업데이트
    /* <a id="downloadLink" href="#" download="signature.png">서명 이미지 다운로드</a> */
    const signatureImage = canvas.toDataURL('image/png'); // 이미지 형식은 고정 (필요 시에, 셀렉트 박스를 통해 확장자 선택)
    const downloadLink = document.createElement('a');
    downloadLink.href = signatureImage;
    downloadLink.download = 'signature.png';
    downloadLink.innerText = '서명 이미지 다운로드';
    downloadLinkBox.replaceChildren();
    downloadLinkBox.appendChild(downloadLink);
    return signatureImage;
}
/* [END] 컨터스 유틸 메서드 */


/* 서명 완료 후에, 이미지 원격 저장소 전송 작업 수행 */
async function completeSignature() {
   try {
      /**
       TODO 추후에, 개인 정보 보호 동의 법 체크 유효성 검사  
      **/
      const signatureImage = saveCanvasImage();
      const awsS3Client = new AwsS3Client();
      const result = awsS3Client.sendImageFileToAwsS3(signatureImage);
      // alert('서명 이미지 생성 및 전송 작업 완료'); 
   }catch(error) {
      alert('서명 이미지 생성 및 전송 작업이 실패. ERROR:' + error);
      console.error(error);
   }
}

/** 중복 되지 않는 문자열 생성 메서드**/
function generateRandomString(length) {
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let result = '';
   for (let i = 0; i < length; i++) {
       const randomIndex = Math.floor(Math.random() * characters.length);
       result += characters.charAt(randomIndex);
   }
   return result;
}

function generateUniqueString(existingStrings, length = 10) {
   let newString;
   do {
       newString = generateRandomString(length);
   } while (existingStrings.has(newString));
   existingStrings.add(newString);
   return newString;
}

// Execute all functions
document.addEventListener("DOMContentLoaded", () => {
   initEventListener();
   setCanvasBackground();
});