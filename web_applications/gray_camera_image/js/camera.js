window.onload = () => {
    const video  = document.querySelector("#camera");
    const canvas = document.querySelector("#picture");
    const se     = document.querySelector('#se');

    /** カメラ設定 */
    const constraints = {
        audio: false,
        video: {
            facingMode: "user"   // フロントカメラを利用する
            // facingMode: { exact: "environment" }  // リアカメラを利用する場合
        }
    };

    /**
     * カメラを<video>と同期
     */
    navigator.mediaDevices.getUserMedia(constraints)
        .then( (stream) => {
            video.srcObject = stream;
        })
        .catch( (err) => {
            console.log(err.name + ": " + err.message);
        });

    /**
     * シャッターボタン
     */
    document.querySelector("#shutter").addEventListener("click", () => {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        const ctx = canvas.getContext("2d");

        // 演出的な目的で一度映像を止めてSEを再生する
        video.pause();  // 映像を停止
        // se.play();      // シャッター音
        setTimeout( () => {
            video.play();    // 0.5秒後にカメラ再開
        }, 500);

        // canvasに画像を貼り付ける
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // For effect.js
        // ImageDataの生成
        // var source = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // エフェクトの実行
        // EffectGrayscale(source);
        // canvasへ描画
        // ctx.putImageData(source,0,0);

        // For OpenCV.js
        let src = cv.imread("picture");
        let dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        // cv.threshold(dst, dst, 100, 255, cv.THRESH_OTSU);
        cv.imshow("picture", dst);
        src.delete();
        dst.delete();

    });
};
