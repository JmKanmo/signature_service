/* 전역 변수 선언 */
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let canvasRect;

/* 이벤트 핸들러 등록 */
function initEventListener() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);

    window.addEventListener('resize', updateCanvasRect);
    updateCanvasRect();
}

/* 캔버스의 위치와 크기를 업데이트 */
function updateCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
}

/* 캔버스에서 그리기 시작 */
function startDrawing(event) {
    isDrawing = true;
    ctx.beginPath();
    const coords = getCanvasCoordinates(event);
    ctx.moveTo(coords.x, coords.y);
    event.preventDefault();
}

/* 캔버스에서 그리기 멈춤 */
function stopDrawing(event) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.stroke();
    event.preventDefault();
}

/* 캔버스에서 그리기 */
function draw(event) {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(event);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    event.preventDefault();
}

/* 이벤트의 좌표를 캔버스의 좌표로 변환 */
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;  // 캔버스와 실제 렌더링된 크기의 비율
    const scaleY = canvas.height / rect.height;
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// 캔버스에 흰색 배경을 설정하는 함수 (저장 되는 이미지 편의성)
function setCanvasBackground() {
    const canvas = document.getElementById('signatureCanvas');
    const context = canvas.getContext('2d');

    // 흰색 배경으로 채우기
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

/* 캔버스 초기화 */
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();

    const downloadLinkBox = document.getElementById('downloadLinkBox');
    downloadLinkBox.replaceChildren();
}

/* 캔버스 이미지를 저장 */
function saveCanvasImage() {
    const canvas = document.getElementById('signatureCanvas');
    const downloadLinkBox = document.getElementById('downloadLinkBox');

    const signatureImage = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = signatureImage;
    downloadLink.download = 'signature.png';
    downloadLink.innerText = '서명 이미지 다운로드';
    downloadLinkBox.replaceChildren();
    downloadLinkBox.appendChild(downloadLink);
    return signatureImage;
}

/* 서명 완료 후 이미지 원격 저장소 전송 */
async function completeSignature() {
    try {
        const privacyAgreeCheck = document.getElementById('privacyAgreeCheckBtn').checked;

        if(privacyAgreeCheck === false) {
            alert('개인정보 수집.이용, 제공 동의 버튼을 체크 해주세요.');
            return;
        }

        const signatureImage = saveCanvasImage();
        const awsS3Client = new AwsS3Client();

        awsS3Client.sendImageFileToAwsS3(signatureImage, (imageUrl) => {
            // imageUrl: AWS S3에 저장 된 서명 이미지 주소 URL
            const downloadLinkBox = document.getElementById('downloadLinkBox');
            const downloadLinkDiv = document.createElement('div');
            downloadLinkDiv.style.marginTop = '1rem';            
            const downloadLink = document.createElement('a');
            downloadLink.href = imageUrl;
            downloadLink.target = "_blank";
            downloadLink.innerText = imageUrl;
            downloadLinkDiv.appendChild(downloadLink);
            downloadLinkBox.appendChild(downloadLinkDiv);
        });
    } catch (error) {
        alert('서명 이미지 생성 및 전송 작업이 실패. [ERROR]:' + error);
        console.error(error);
    }
}

/* 중복되지 않는 문자열 생성 */
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

/* 개인 정보 동의서 로드 및 표시 */
function initPrivacyAgreeContent() {
    const httpClient = new HTTPClient();
    httpClient.sendRequestToS3('https://freelog-s3-bucket.s3.amazonaws.com/image/privacy_info_template.html', (content) => {
        const privacyAgreeBox = document.getElementById('privacyAgreeBox');
        privacyAgreeBox.innerHTML = content;
    });
}

/* 페이지 로드 후 초기화 */
document.addEventListener("DOMContentLoaded", () => {
    initEventListener();
    setCanvasBackground();
    initPrivacyAgreeContent();
});
