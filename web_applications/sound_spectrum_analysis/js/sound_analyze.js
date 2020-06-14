// 変数定義
var localMediaStream = null;
var localScriptProcessor = null;
var audioContext = null;
var bufferSize = 1024;
var audioData = []; // 録音データ
var recordingFlg = false;

// キャンバス
var canvas = document.getElementById('canvas');
var canvasContext = canvas.getContext('2d');

// 音声解析
var audioAnalyser = null;


// 録音バッファ作成（録音中自動で繰り返し呼び出される）
var onAudioProcess = function(e) {
    if (!recordingFlg) return;

    // 音声のバッファを作成
    var input = e.inputBuffer.getChannelData(0);
    var bufferData = new Float32Array(bufferSize);
    for (var i = 0; i < bufferSize; i++) {
        bufferData[i] = input[i];
    }
    audioData.push(bufferData);

    // 波形を解析
    analyseVoice();
};

// 解析用処理
var analyseVoice = function() {
    var fsDivN = audioContext.sampleRate / audioAnalyser.fftSize;
    var spectrums = new Uint8Array(audioAnalyser.frequencyBinCount);
    audioAnalyser.getByteFrequencyData(spectrums);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "bold 20px 'ＭＳ 明朝'";
    let lower_margin = 30;
    let right_margin = 20;
    let left_margin = 50;

    canvasContext.beginPath();

    let count = 0;
    for (var i = 0, len = spectrums.length; i < len; i++) {
        //canvasにおさまるように線を描画
        var x = (i / len) * (canvas.width - left_margin - right_margin);
        var y = (1 - (spectrums[i] / 255)) * (canvas.height - lower_margin);
        if (i === 0) {
            canvasContext.moveTo(x + left_margin, y);
        } else {
            canvasContext.lineTo(x + left_margin, y);
        }
        var f = Math.floor(i * fsDivN);  // index -> frequency;
        if (f > count * 5000) {
            let text = String(count * 5) + "kHz";
            canvasContext.fillText(text, x + left_margin, canvas.height);
            count = count + 1;
        }
    }

    canvasContext.stroke();

    // Draw grid (X)
    canvasContext.fillRect(left_margin, 0, 1, (canvas.height - lower_margin));
    // x軸の線とラベル出力
    var textYs = ['1.00', '0.50', '0.00'];
    for (var i = 0, len = textYs.length; i < len; i++) {
        var text = textYs[i];
        var gy   = (1 - parseFloat(text)) * (canvas.height - lower_margin);
        // Draw grid (Y)
        canvasContext.fillRect(left_margin, gy, canvas.width, 1);
        // Draw text (Y)
        canvasContext.fillText(text, 0, gy + lower_margin / 2.0);
    }
}


// 解析開始
var startRecording = function() {
    // audioContext must be created after user gesture
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    recordingFlg = true;
    const constraints = {
        audio: true,
        video: false
    };
    // navigator.getUserMedia({audio: true}, function(stream) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then( function (stream) {
            // 録音関連
            localMediaStream = stream;
            var scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
            localScriptProcessor = scriptProcessor;
            var mediastreamsource = audioContext.createMediaStreamSource(stream);
            mediastreamsource.connect(scriptProcessor);
            scriptProcessor.onaudioprocess = onAudioProcess;
            scriptProcessor.connect(audioContext.destination);

            // 音声解析関連
            audioAnalyser = audioContext.createAnalyser();
            audioAnalyser.fftSize = 2048;
            frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
            timeDomainData = new Uint8Array(audioAnalyser.frequencyBinCount);
            mediastreamsource.connect(audioAnalyser);
        })
        .catch( function (e) {
            console.log(e);
        });
};

// 解析終了
var endRecording = function() {
    recordingFlg = false;
    let tracks = localMediaStream.getTracks();
    tracks.forEach( (track) => {
        track.stop();
    })
};

window.onload = () => {
    // ボタンクリック時のコールバックを登録
    document.querySelector("#start").addEventListener("click", {handleEvent: startRecording});
    document.querySelector("#stop").addEventListener("click", {handleEvent: endRecording});

};
