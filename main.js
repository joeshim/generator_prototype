/**
 * Created by Joe on 2023/02/19.
 */

(function($){
    //画像関連
    var img;
    var img2;
    var stage;

    //画像ロード
    function loadImage (imageData, isGrayscale){
        //画像のロード
        var baseImg = new Image();
        baseImg.crossOrigin = "anonymous"; 
        baseImg.src = 'background.png';
        baseImg.onload = function() { // ここに onload イベントを追加
            img = new createjs.Bitmap(baseImg);
        };

        //画像が選択されている時のみ合成
        if(imageData !== null) {
            var baseImg2 = new Image();
            baseImg2.crossOrigin = "anonymous";
            baseImg2.src = imageData;
            baseImg2.onload = function(){ // 画像読み込み後の処理を追加
                img2 = new createjs.Bitmap(baseImg2);

                //グレースケール設定が有効な場合、適用する
                if (isGrayscale){
                    var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
                    var grayscaleFilter = new createjs.ColorMatrixFilter(matrix);
                    img2.filters = [grayscaleFilter];
                    img2.cache(0, 0, img2.image.width, img2.image.height);
                }
            };
        }

        stage = new createjs.Stage('result');
    }

    //画像と文字を合成する処理
    function genImage (imageIni, txt){
        stage.clear();
        if(img2){
            //合成画像の設定
            //上下は10ピクセルごと移動
            img2.x = imageIni.xPos * 10;
            img2.y = imageIni.yPos * 10;
            //拡縮は10％ずつ
            img2.scaleX = imageIni.scaleX * (1 + imageIni.Scale / 50);
            img2.scaleY = imageIni.scaleY * (1 + imageIni.Scale / 50);

            //ステージ生成
            stage.addChild(img2);
        }
        stage.addChild(img);

        //文字オブジェクトを生成してステージに追加
        $.each(txt,function(key,value){
            //本文は入力された内容をそのまま取る
            var content = $('#' + key).val();

            //文字生成
            var obj = new createjs.Text(content);

            //文字設定
            obj.textAlign = value.align;
            obj.font = value.font;
            obj.color = value.color;
            obj.x = value.x;
            obj.y = value.y;

            stage.addChild(obj);
        });

        //ステージ反映
        stage.update();
    }

    function downloadImage() {
        var canvas = document.getElementById("result");
        var dataURL = canvas.toDataURL("image/png");
        var link = document.createElement("a");
        link.href = dataURL;
        link.download = "output.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }    

    $(function(){
        //読込画像のオブジェクト
        var imageIni = {
            xPos : 0,
            yPos : 0,
            Scale : 0,
            scaleX: 1,
            scaleY: 1,
            imageData : null,
            isGrayscale: false,
            resetImage : function(){
                this.xPos = 0;
                this.yPos = 0;
                this.Scale = 0;
                this.scaleX = 1;
                this.scaleY = 1;
            },
            makeImage : function(){
                if(this.imageData !== null) {
                    loadImage(this.imageData);
                    genImage(this, txt);
                }
            }
        };

        //合成する文字の位置情報などを定義
        var txt = {
            'txt01' : {
                'x' : 25,
                'y': 555,
                'font': '20px/1.5 YuMincho,Caslon',
                'align': 'left',
                'color': 'white'
            },
            'txt02' : {
                'x' : 25,
                'y': 595,
                'font': '20px/1.5 YuMincho,Caslon',
                'align': 'left',
                'color': 'white'
            }
        };

        //イベント関連処理
        //初回のみCanvasを作成しておく
        $(window).on('load',function(){
            loadImage(null, imageIni.isGrayscale);
        });

        //画像読込
        $('#getfile').change(function (){
            //読み込み
            var fileList =$('#getfile').prop('files');
            var reader = new FileReader();
            reader.readAsDataURL(fileList[0]);

            //読み込み後
            $(reader).on('load',function(){
                $('#preview').prop('src',reader.result);
                imageIni.imageData = reader.result;
                loadImage(imageIni.imageData, imageIni.isGrayscale); //ここでisGrayscaleを追加
            });
        });

        $('#download').on('click', function () {
            if (imageIni.imageData !== null) {
                downloadImage();
            } else {
                $("#alert").text("画像を選択してからダウンロードを行ってください");
            }
        });
        
        //ボタンイベントまとめ
        $('.btn').on('click',function(e){
            if (e.target.id === "grayscale") {
                if (imageIni.imageData !== null) {
                    imageIni.isGrayscale = !imageIni.isGrayscale;
                    if (imageIni.isGrayscale) {
                        // グレースケールに変換する処理
                        var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
                        var grayscaleFilter = new createjs.ColorMatrixFilter(matrix);
                        img2.filters = [grayscaleFilter];
                        img2.cache(0, 0, img2.image.width, img2.image.height);
                    } else {
                        // 元のカラーに戻す処理
                        img2.filters = [];
                        img2.uncache();
                    }
                    //画像を再描画する
                    genImage(imageIni, txt);
                } else {
                    $("#alert").text("画像を選択してからグレースケール変換を行ってください");
                }
            } else if (e.target.id === "update"){
                //画像生成は個別処理なし
            }else if (e.target.id === "up"){
                imageIni.yPos -= 1;
            }else if (e.target.id === "down"){
                imageIni.yPos += 1;
            }else if (e.target.id === "left"){
                imageIni.xPos -= 1;
            }else if (e.target.id === "right") {
                imageIni.xPos += 1;
            }else if (e.target.id === "zoomin") {
                imageIni.Scale += 1;
            }else if (e.target.id === "zoomout") {
                imageIni.Scale -= 1;
            }else if (e.target.id === "reset"){
                imageIni.resetImage();
            }

            //画像操作時は再描画を行う
            if(imageIni.imageData !== null){
                imageIni.makeImage();
                $("#alert").text("");
            }else{
                $("#alert").text("画像を選択してから画像生成を行ってください");
            }
        });
    });
})($);
