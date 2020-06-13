window.onload = () => {
    const video  = document.querySelector("#camera");
    video.style.display = 'none'; // Do not show video
    const canvas = document.querySelector("#orig");
    const canvas_p = document.querySelector("#processed");
    const se     = document.querySelector('#se');

    /** カメラ設定 */
    const constraints = {
        audio: false,
        video: {
            // width: video.videoWidth,
            // height: video.videoHeight,
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
    // 再生可能な状態になったら自動で再生する
    video.addEventListener('canplaythrough', function(){
		video.play();
    }, false);
    // 再生可能時のイベントリスナーを登録
    video.addEventListener('canplaythrough', function(){
        const ctx = canvas.getContext("2d");
        // 33ミリ秒毎にcanvasに動画をコピーする
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        var ratio = 0;
        if (videoW > videoH) {
            ratio = 300.0 / videoW;
        }
        else {
            ratio = 300.0 / videoH;
        }
        setInterval(function(){
            ctx.drawImage(video, 0, 0, videoW, videoH,
                          (300.0 / 2) - (videoW * ratio / 2), (300.0 / 2) - (videoH * ratio / 2),
                          videoW * ratio, videoH * ratio);
        }, 33);
    }, false);


    /**
     * シャッターボタン
     */
    document.querySelector("#shutter").addEventListener("click", () => {
        const ctx_p = canvas_p.getContext("2d");

        // 演出的な目的で一度映像を止めてSEを再生する
        video.pause();  // 映像を停止
        // se.play();      // シャッター音
        setTimeout( () => {
            video.play();    // 0.5秒後にカメラ再開
        }, 500);

        // canvasに画像を貼り付ける
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        var ratio = 0;
        if (videoW > videoH) {
            ratio = 300.0 / videoW;
        }
        else {
            ratio = 300.0 / videoH;
        }
        ctx_p.drawImage(video, 0, 0, videoW, videoH,
                        (300.0 / 2) - (videoW * ratio / 2), (300.0 / 2) - (videoH * ratio / 2),
                        videoW * ratio, videoH * ratio);

        // ImageDataの生成
        // var source = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var source = ctx_p.getImageData((300.0 / 2) - (videoW * ratio / 2),
                                        (300.0 / 2) - (videoH * ratio / 2),
                                        videoW * ratio,
                                        videoH * ratio);

        // // For effect.js
        // // エフェクトの実行
        // // EffectGrayscale(source);
        // // canvasへ描画
        // // ctx.putImageData(source,0,0);

        // // For OpenCV.js
        let src = cv.imread("orig");
        // let rect = new cv.Rect((300.0 / 2) - (videoW * ratio / 2),
        //                        (300.0 / 2) - (videoH * ratio / 2),
        //                        (300.0 / 2) + (videoW * ratio / 2),
        //                        (300.0 / 2) + (videoH * ratio / 2))
        // src = src.roi(rect);
        let dst = new cv.Mat();
        // dst = dst.roi(rect);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        // cv.threshold(dst, dst, 100, 255, cv.THRESH_OTSU);
        cv.imshow("processed", dst);
        src.delete();
        dst.delete();

    });
};
