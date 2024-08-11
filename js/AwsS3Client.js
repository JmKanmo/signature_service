/** AWS S3 원격 저장소에 데이터를 전송하는 기능 메서드 정의 **/
class AwsS3Client {
    constructor() {
        // AWS 설정 초기화
        AWS.config.region = 'ap-northeast-2';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'ap-northeast-2:88a4cc55-83c3-44f5-a4f7-12ba5f9e598d', // AWS Cognito ID
        });
        this.s3 =  new AWS.S3({
            apiVersion: '2024-08-12',
            params: { Bucket: 'signature-repository' }
        });
    }

    // 이미지 파일을 aws s3 저장소에 전송
    sendImageFileToAwsS3(imageDataURL) {
        const blob = this.dataURLToBlob(imageDataURL);

        // 날짜 기반 디렉토리 및 랜덤 파일명 생성
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `${year}/${month}/${day}/${randomString}.png`;

        // 파일 업로드
        const params = {
            Key: fileName,
            Body: blob,
            ContentType: blob.type
            /*
                아래 에러가 발생함에 따라, 주석처리 하도록 한다. 
                AwsS3Client.js:37 [AwsS3Client:sendImageFileToAwsS3] ERROR:AccessControlListNotSupported: The bucket does not allow ACLs
                ACL: 'public-read' // 필요에 따라 'private'로 설정
            */
        };

        this.s3.upload(params, function(err, data) {
            if (err) {
                console.error('[AwsS3Client:sendImageFileToAwsS3] ERROR:' + err);
                alert('서명 이미지를 원격 저장소에 전송하지 못했습니다. ERROR:' + err);
                return false;
            } else {
                console.log('[AwsS3Client:sendImageFileToAwsS3] Upload Success', data.Location);
                alert(`서명 이미지를 원격 저장소에 성공적으로 전송 했습니다.<br>URL: ` + data.Location);
                return true;
            }
        });
    } 

    // Base64 데이터를 Blob 형식으로 변환 한다.
    dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }
}


