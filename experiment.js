// ======================================================
// SST 行为实验 - 正式版
//
// 实验流程：
//
// 1. 输入被试编号
// 2. 练习
//      随机10个SST
//      5张练习图片
// 3. 正式实验
//      3个Block（拉丁方平衡顺序）
//      每Block 6个Session
//      每Session：10个SST + 5张图片
//
// SST：
//      鼠标点击 / 数字键1-5选择
//      Backspace 删除最后一个
//      Enter 确认
//      不反馈正确/错误
//
// 图片：
//      图片真正加载完成后开始计时
//      呈现6000 ms
//      自动进入效价评分
//      再进入唤醒度评分
//
// 评分：
//      鼠标点击1-9
//      或键盘按1-9
//
// 数据：
//      自动记录
//      实验结束自动下载CSV
// ======================================================



// ======================================================
// 一、全局变量
// ======================================================

var experimentData = [];

var participantId = "";

var currentScreen = "participant";


// ------------------------------------------------------
// SST
// ------------------------------------------------------

var selectedWords = [];

var trialStartTime = null;


// ------------------------------------------------------
// 正式实验位置
// ------------------------------------------------------

var currentBlockIndex = 0;

var currentSessionIndex = 0;

var currentSSTIndex = 0;

var currentPictureIndex = 0;

var currentBlockTrials = [];

var currentSessionSST = [];

var currentSessionPictures = [];


// ------------------------------------------------------
// 练习
// ------------------------------------------------------

var practiceTrials = [];

var practiceTrialIndex = 0;

var practicePictureIndex = 0;


// ------------------------------------------------------
// 图片
// ------------------------------------------------------

var pictureTimer = null;

var pictureOnsetTime = null;

var pictureActualDuration = null;


// ------------------------------------------------------
// 评分
// ------------------------------------------------------

var currentValence = null;

var currentValenceRT = null;

var valenceStartTime = null;

var arousalStartTime = null;



// ======================================================
// 二、Block顺序
// 三种拉丁方顺序
// ======================================================

var blockOrders = [

    [
        "distract",
        "reappraisal",
        "mixed"
    ],

    [
        "reappraisal",
        "mixed",
        "distract"
    ],

    [
        "mixed",
        "distract",
        "reappraisal"
    ]

];

var currentBlockOrder = [];



// ======================================================
// 三、图片材料
// 所有图片均位于 negative 文件夹
// jpg格式
// ======================================================

var pictureSets = {


    // ==================================================
    // 练习图片 5张
    // ==================================================

    practice: [

        "negative/9145.jpg",
        "negative/9163.jpg",
        "negative/9185.jpg",
        "negative/9220.jpg",
        "negative/9280.jpg"

    ],


    // ==================================================
    // 分心 30张
    // ==================================================

    distract: [

        "negative/1321.jpg",
        "negative/1930.jpg",
        "negative/2053.jpg",
        "negative/2120.jpg",
        "negative/2141.jpg",

        "negative/2205.jpg",
        "negative/2276.jpg",
        "negative/2312.jpg",
        "negative/2375.1.jpg",
        "negative/2455.jpg",

        "negative/2456.jpg",
        "negative/2457.jpg",
        "negative/2590.jpg",
        "negative/2683.jpg",
        "negative/2688.jpg",

        "negative/2691.jpg",
        "negative/2694.jpg",
        "negative/2700.jpg",
        "negative/2703.jpg",
        "negative/2710.jpg",

        "negative/2718.jpg",
        "negative/2750.jpg",
        "negative/2799.jpg",
        "negative/2800.jpg",
        "negative/2900.jpg",

        "negative/3022.jpg",
        "negative/3180.jpg",
        "negative/3181.jpg",
        "negative/3185.jpg",
        "negative/3216.jpg"

    ],


    // ==================================================
    // 重评 30张
    // ==================================================

    reappraisal: [

        "negative/9290.jpg",
        "negative/9332.jpg",
        "negative/9341.jpg",
        "negative/9342.jpg",
        "negative/9403.jpg",

        "negative/9409.jpg",
        "negative/9415.jpg",
        "negative/9419.jpg",
        "negative/9423.jpg",
        "negative/9427.jpg",

        "negative/9435.jpg",
        "negative/9440.jpg",
        "negative/9490.jpg",
        "negative/9495.jpg",
        "negative/9520.jpg",

        "negative/9560.jpg",
        "negative/9561.jpg",
        "negative/9571.jpg",
        "negative/9599.jpg",
        "negative/9600.jpg",

        "negative/9610.jpg",
        "negative/9621.jpg",
        "negative/9622.jpg",
        "negative/9810.jpg",
        "negative/9900.jpg",

        "negative/9901.jpg",
        "negative/9902.jpg",
        "negative/9908.jpg",
        "negative/9909.jpg",
        "negative/9920.jpg"

    ],


    // ==================================================
    // 混合 30张
    // ==================================================

    mixed: [

        "negative/3230.jpg",
        "negative/3300.jpg",
        "negative/3350.jpg",
        "negative/3530.jpg",
        "negative/5970.jpg",

        "negative/6010.jpg",
        "negative/6211.jpg",
        "negative/6212.jpg",
        "negative/6311.jpg",
        "negative/6312.jpg",

        "negative/6315.jpg",
        "negative/6540.jpg",
        "negative/6560.jpg",
        "negative/6563.jpg",
        "negative/6571.jpg",

        "negative/6821.jpg",
        "negative/6825.jpg",
        "negative/6836.jpg",
        "negative/6840.jpg",
        "negative/7380.jpg",

        "negative/8485.jpg",
        "negative/9000.jpg",
        "negative/9002.jpg",
        "negative/9041.jpg",
        "negative/9140.jpg",

        "negative/9145.jpg",
        "negative/9163.jpg",
        "negative/9185.jpg",
        "negative/9220.jpg",
        "negative/9280.jpg"

    ]

};



// ======================================================
// 四、工具函数
// ======================================================


// ------------------------------------------------------
// 随机打乱数组
// ------------------------------------------------------

function shuffleArray(array) {

    var copy = array.slice();

    for (
        var i = copy.length - 1;
        i > 0;
        i--
    ) {

        var j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        var temp =
            copy[i];

        copy[i] =
            copy[j];

        copy[j] =
            temp;
    }

    return copy;
}


// ------------------------------------------------------
// 比较两个数组是否完全一致
// ------------------------------------------------------

function arraysEqual(a, b) {

    if (
        a.length !==
        b.length
    ) {

        return false;
    }


    for (
        var i = 0;
        i < a.length;
        i++
    ) {

        if (
            a[i] !== b[i]
        ) {

            return false;
        }
    }


    return true;
}


// ------------------------------------------------------
// 白色页面
// ------------------------------------------------------

function resetBodyWhite() {

    document.body.style.background =
        "#ffffff";

    document.body.style.color =
        "#000000";
}


// ------------------------------------------------------
// 黑色页面
// ------------------------------------------------------

function resetBodyBlack() {

    document.body.style.background =
        "#000000";

    document.body.style.color =
        "#ffffff";
}


// ------------------------------------------------------
// 清理图片计时器
// ------------------------------------------------------

function clearPictureTimer() {

    if (pictureTimer) {

        clearTimeout(
            pictureTimer
        );

        pictureTimer = null;
    }
}


// ------------------------------------------------------
// 从图片路径提取图片编号
//
// negative/1321.jpg
// → 1321
//
// negative/2375.1.jpg
// → 2375.1
// ------------------------------------------------------

function getPictureId(path) {

    var fileName =
        path.split("/").pop();

    return fileName.replace(
        /\.jpg$/i,
        ""
    );
}



// ======================================================
// 五、被试编号与Block顺序
// ======================================================

function getBlockOrderFromParticipantId(pid) {

    var match =
        String(pid).match(
            /\d+/
        );


    var participantNumber = 1;


    if (match) {

        participantNumber =
            parseInt(
                match[0],
                10
            );
    }


    var index =
        (participantNumber - 1) % 3;


    return blockOrders[
        index
    ].slice();
}



// ======================================================
// 六、被试编号首页
// ======================================================

function showParticipantPage() {

    currentScreen =
        "participant";


    resetBodyWhite();


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="experiment-container">

            <div class="title">

                实验

            </div>


            <div class="instruction">

                请输入被试编号

            </div>


            <input

                id="participantInput"

                type="text"

                placeholder="例如：S001"

                autocomplete="off"

                style="
                    width:220px;
                    padding:14px;
                    font-size:22px;
                    text-align:center;
                    margin-top:25px;
                    margin-bottom:25px;
                "

            >


            <br>


            <button

                class="control-button"

                onclick="saveParticipantId()"

            >

                继续

            </button>

        </div>

    `;


    setTimeout(
        function() {

            var input =
                document.getElementById(
                    "participantInput"
                );


            if (input) {

                input.focus();
            }

        },
        100
    );
}



// ======================================================
// 七、保存被试编号
// ======================================================

function saveParticipantId() {

    var input =
        document.getElementById(
            "participantInput"
        );


    participantId =
        input.value.trim();


    if (!participantId) {

        alert(
            "请输入被试编号"
        );

        return;
    }


    currentBlockOrder =
        getBlockOrderFromParticipantId(
            participantId
        );


    console.log(
        "被试编号：",
        participantId
    );


    console.log(
        "Block顺序：",
        currentBlockOrder
    );


    showPracticeInstruction();
}



// ======================================================
// 八、练习指导语
// ======================================================

function showPracticeInstruction() {

    currentScreen =
        "practice_instruction";


    resetBodyWhite();


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="experiment-container">

            <div class="title">

                练习

            </div>


            <div class="instruction">

                接下来首先进行练习。

                <br><br>

                在句子组成任务中，
                请从5个词中选择4个词，
                按照你认为正确的顺序
                组成一个通顺的句子。

                <br><br>

                鼠标点击词语，
                或按数字键1–5选择。

                <br><br>

                Backspace：删除上一个

                <br>

                Enter：确认

                <br><br>

                之后将观看图片，
                并分别进行效价和唤醒度评分。

            </div>


            <button

                class="control-button"

                onclick="startPractice()"

            >

                开始练习

            </button>

        </div>

    `;
}



// ======================================================
// 九、建立练习材料
// 随机抽10个正式句子
// ======================================================

function startPractice() {

    var allMaterials =
        materials.distract
        .concat(
            materials.reappraisal
        )
        .concat(
            materials.mixed
        );


    practiceTrials =
        shuffleArray(
            allMaterials
        ).slice(
            0,
            10
        );


    practiceTrialIndex = 0;

    practicePictureIndex = 0;


    startPracticeSST();
}



// ======================================================
// 十、练习SST
// ======================================================

function startPracticeSST() {

    currentScreen =
        "practice_sst";


    resetBodyWhite();


    if (
        practiceTrialIndex >=
        practiceTrials.length
    ) {

        practicePictureIndex = 0;

        showPracticePicture();

        return;
    }


    selectedWords = [];


    trialStartTime =
        performance.now();


    renderPracticeSST();
}



// ======================================================
// 十一、显示练习SST
// ======================================================

function renderPracticeSST() {

    var app =
        document.getElementById(
            "app"
        );


    var trial =
        practiceTrials[
            practiceTrialIndex
        ];


    var html = `

        <div class="experiment-container">


            <div class="title">

                句子组成任务

            </div>


            <div class="instruction">

                请从下面5个词中选择4个词，
                按照正确顺序组成一个通顺的句子。

            </div>


            <div class="word-area">

    `;


    trial.words.forEach(
        function(word, index) {

            var selected =
                selectedWords.indexOf(
                    word
                ) !== -1;


            html += `

                <button

                    class="
                        word-button
                        ${selected ? "selected" : ""}
                    "

                    onclick="
                        selectPracticeWord(${index})
                    "

                >

                    ${word}

                </button>

            `;
        }
    );


    html += `

            </div>


            <div class="selected-box">

                ${
                    selectedWords.length === 0

                    ? "已选词语会显示在这里"

                    : selectedWords.join(
                        " → "
                    )
                }

            </div>


            <div class="control-area">


                <button

                    class="control-button"

                    onclick="
                        deletePracticeWord()
                    "

                >

                    删除上一个

                </button>


                <button

                    class="control-button"

                    onclick="
                        confirmPracticeSST()
                    "

                >

                    确认

                </button>


            </div>


        </div>

    `;


    app.innerHTML =
        html;
}



// ======================================================
// 十二、练习选词
// ======================================================

function selectPracticeWord(index) {

    var trial =
        practiceTrials[
            practiceTrialIndex
        ];


    var word =
        trial.words[index];


    if (
        selectedWords.indexOf(
            word
        ) !== -1
    ) {

        return;
    }


    if (
        selectedWords.length >= 4
    ) {

        return;
    }


    selectedWords.push(
        word
    );


    renderPracticeSST();
}



// ======================================================
// 十三、练习删除
// ======================================================

function deletePracticeWord() {

    if (
        selectedWords.length > 0
    ) {

        selectedWords.pop();

        renderPracticeSST();
    }
}



// ======================================================
// 十四、确认练习SST
// ======================================================

function confirmPracticeSST() {

    if (
        selectedWords.length !== 4
    ) {

        alert(
            "请先选择4个词"
        );

        return;
    }


    var trial =
        practiceTrials[
            practiceTrialIndex
        ];


    var rt =
        Math.round(
            performance.now() -
            trialStartTime
        );


    var correct =
        arraysEqual(
            selectedWords,
            trial.correctWords
        );


    experimentData.push({

        participant_id:
            participantId,

        phase:
            "practice",

        trial_type:
            "sst",

        practice_trial:
            practiceTrialIndex + 1,

        material_id:
            trial.id,

        material_condition:
            trial.condition || "",

        word1:
            trial.words[0],

        word2:
            trial.words[1],

        word3:
            trial.words[2],

        word4:
            trial.words[3],

        word5:
            trial.words[4],

        selected_words:
            selectedWords.join("|"),

        selected_sentence:
            selectedWords.join(""),

        correct_words:
            trial.correctWords.join("|"),

        correct_sentence:
            trial.correctSentence,

        correct:
            correct,

        rt:
            rt

    });


    practiceTrialIndex += 1;


    startPracticeSST();
}



// ======================================================
// 十五、练习图片
// 图片实际加载成功后才开始6秒计时
// ======================================================

function showPracticePicture() {

    clearPictureTimer();


    if (
        practicePictureIndex >=
        pictureSets.practice.length
    ) {

        showPracticeEnd();

        return;
    }


    currentScreen =
        "practice_picture";


    resetBodyBlack();


    var pictureFile =
        pictureSets.practice[
            practicePictureIndex
        ];


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div

            style="
                width:100%;
                min-height:100vh;
                background:black;
                display:flex;
                justify-content:center;
                align-items:center;
                box-sizing:border-box;
            "

        >

            <img

                id="practiceStimulusImage"

                src="${pictureFile}"

                style="
                    max-width:100%;
                    max-height:100vh;
                    object-fit:contain;
                "

            >

        </div>

    `;


    var img =
        document.getElementById(
            "practiceStimulusImage"
        );


    img.onload =
        function() {

            pictureOnsetTime =
                performance.now();


            pictureTimer =
                setTimeout(
                    function() {

                        pictureActualDuration =
                            Math.round(
                                performance.now() -
                                pictureOnsetTime
                            );


                        showPracticeValence();

                    },
                    6000
                );
        };


    img.onerror =
        function() {

            console.error(
                "练习图片加载失败：",
                pictureFile
            );


            alert(
                "图片加载失败：" +
                pictureFile
            );
        };


    // 对已经被浏览器缓存的图片进行兼容
    if (img.complete) {

        img.onload();
    }
}



// ======================================================
// 十六、练习效价
// ======================================================

function showPracticeValence() {

    clearPictureTimer();


    currentScreen =
        "practice_valence";


    valenceStartTime =
        performance.now();


    renderScale(
        "效价",
        "令人不愉快",
        "中等",
        "令人愉快",
        "practice_valence"
    );
}



// ======================================================
// 十七、提交练习效价
// ======================================================

function submitPracticeValence(rating) {

    if (
        currentScreen !==
        "practice_valence"
    ) {

        return;
    }


    currentValence =
        rating;


    currentValenceRT =
        Math.round(
            performance.now() -
            valenceStartTime
        );


    showPracticeArousal();
}



// ======================================================
// 十八、练习唤醒度
// ======================================================

function showPracticeArousal() {

    currentScreen =
        "practice_arousal";


    arousalStartTime =
        performance.now();


    renderScale(
        "唤醒度",
        "越来越低",
        "中等",
        "越来越高",
        "practice_arousal"
    );
}



// ======================================================
// 十九、提交练习唤醒度
// ======================================================

function submitPracticeArousal(rating) {

    if (
        currentScreen !==
        "practice_arousal"
    ) {

        return;
    }


    var arousalRT =
        Math.round(
            performance.now() -
            arousalStartTime
        );


    var pictureFile =
        pictureSets.practice[
            practicePictureIndex
        ];


    experimentData.push({

        participant_id:
            participantId,

        phase:
            "practice",

        trial_type:
            "picture_rating",

        practice_picture:
            practicePictureIndex + 1,

        picture_id:
            getPictureId(
                pictureFile
            ),

        picture_file:
            pictureFile,

        picture_duration_planned:
            6000,

        picture_duration_actual:
            pictureActualDuration,

        valence:
            currentValence,

        valence_rt:
            currentValenceRT,

        arousal:
            rating,

        arousal_rt:
            arousalRT

    });


    currentValence =
        null;


    currentValenceRT =
        null;


    pictureActualDuration =
        null;


    practicePictureIndex += 1;


    showPracticePicture();
}



// ======================================================
// 二十、练习结束
// ======================================================

function showPracticeEnd() {

    currentScreen =
        "practice_end";


    resetBodyWhite();


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="experiment-container">


            <div class="title">

                练习结束

            </div>


            <div class="instruction">

                练习已经完成。

                <br><br>

                接下来进入正式实验。

                <br><br>

                请准备好后开始。

            </div>


            <button

                class="control-button"

                onclick="
                    startFormalExperiment()
                "

            >

                开始正式实验

            </button>


        </div>

    `;
}



// ======================================================
// 二十一、开始正式实验
// ======================================================

function startFormalExperiment() {

    currentBlockIndex = 0;


    startBlock();
}



// ======================================================
// 二十二、开始Block
// ======================================================

function startBlock() {

    currentSessionIndex = 0;


    var condition =
        currentBlockOrder[
            currentBlockIndex
        ];


    if (
        condition ===
        "distract"
    ) {

        currentBlockTrials =
            materials.distract.slice();
    }

    else if (
        condition ===
        "reappraisal"
    ) {

        currentBlockTrials =
            materials.reappraisal.slice();
    }

    else {

        currentBlockTrials =
            materials.mixed.slice();
    }


    console.log(
        "开始 Block：",
        currentBlockIndex + 1,
        condition
    );


    startSession();
}



// ======================================================
// 二十三、开始Session
// 不显示Session页面
// ======================================================

function startSession() {

    var condition =
        currentBlockOrder[
            currentBlockIndex
        ];


    // --------------------------------------------------
    // 10道SST
    // --------------------------------------------------

    var sentenceStart =
        currentSessionIndex * 10;


    currentSessionSST =
        currentBlockTrials.slice(
            sentenceStart,
            sentenceStart + 10
        );


    // --------------------------------------------------
    // 5张图片
    // --------------------------------------------------

    var pictureStart =
        currentSessionIndex * 5;


    currentSessionPictures =
        pictureSets[
            condition
        ].slice(
            pictureStart,
            pictureStart + 5
        );


    currentSSTIndex = 0;

    currentPictureIndex = 0;


    startSSTTrial();
}



// ======================================================
// 二十四、开始正式SST
// ======================================================

function startSSTTrial() {

    currentScreen =
        "sst";


    resetBodyWhite();


    // 本Session 10题已经完成
    if (
        currentSSTIndex >=
        currentSessionSST.length
    ) {

        currentPictureIndex = 0;


        showPicture();


        return;
    }


    selectedWords = [];


    trialStartTime =
        performance.now();


    renderSST();
}



// ======================================================
// 二十五、显示正式SST
// 不显示Block、Session、题号
// ======================================================

function renderSST() {

    var app =
        document.getElementById(
            "app"
        );


    var trial =
        currentSessionSST[
            currentSSTIndex
        ];


    var html = `

        <div class="experiment-container">


            <div class="title">

                句子组成任务

            </div>


            <div class="instruction">

                请从下面5个词中选择4个词，
                按照正确顺序组成一个通顺的句子。

            </div>


            <div class="word-area">

    `;


    trial.words.forEach(
        function(word, index) {

            var selected =
                selectedWords.indexOf(
                    word
                ) !== -1;


            html += `

                <button

                    class="
                        word-button
                        ${selected ? "selected" : ""}
                    "

                    onclick="
                        selectWord(${index})
                    "

                >

                    ${word}

                </button>

            `;
        }
    );


    html += `

            </div>


            <div class="selected-box">

                ${
                    selectedWords.length === 0

                    ? "已选词语会显示在这里"

                    : selectedWords.join(
                        " → "
                    )
                }

            </div>


            <div class="control-area">


                <button

                    class="control-button"

                    onclick="
                        deleteLastWord()
                    "

                >

                    删除上一个

                </button>


                <button

                    class="control-button"

                    onclick="
                        confirmSST()
                    "

                >

                    确认

                </button>


            </div>


        </div>

    `;


    app.innerHTML =
        html;
}



// ======================================================
// 二十六、正式SST选词
// ======================================================

function selectWord(index) {

    var trial =
        currentSessionSST[
            currentSSTIndex
        ];


    if (!trial) {

        return;
    }


    var word =
        trial.words[index];


    if (
        selectedWords.indexOf(
            word
        ) !== -1
    ) {

        return;
    }


    if (
        selectedWords.length >= 4
    ) {

        return;
    }


    selectedWords.push(
        word
    );


    renderSST();
}



// ======================================================
// 二十七、正式SST删除
// ======================================================

function deleteLastWord() {

    if (
        selectedWords.length > 0
    ) {

        selectedWords.pop();


        renderSST();
    }
}



// ======================================================
// 二十八、正式SST确认
// ======================================================

function confirmSST() {

    if (
        selectedWords.length !== 4
    ) {

        alert(
            "请先选择4个词"
        );


        return;
    }


    var condition =
        currentBlockOrder[
            currentBlockIndex
        ];


    var trial =
        currentSessionSST[
            currentSSTIndex
        ];


    var rt =
        Math.round(
            performance.now() -
            trialStartTime
        );


    var correct =
        arraysEqual(
            selectedWords,
            trial.correctWords
        );


    var globalSSTNumber =
        currentBlockIndex * 60 +
        currentSessionIndex * 10 +
        currentSSTIndex +
        1;


    experimentData.push({

        participant_id:
            participantId,

        phase:
            "formal",

        trial_type:
            "sst",

        block_num:
            currentBlockIndex + 1,

        block_condition:
            condition,

        block_order:
            currentBlockOrder.join(
                "-"
            ),

        session_num:
            currentSessionIndex + 1,

        trial_in_session:
            currentSSTIndex + 1,

        global_sst_num:
            globalSSTNumber,

        material_id:
            trial.id,

        material_condition:
            trial.condition || condition,

        word1:
            trial.words[0],

        word2:
            trial.words[1],

        word3:
            trial.words[2],

        word4:
            trial.words[3],

        word5:
            trial.words[4],

        selected_words:
            selectedWords.join("|"),

        selected_sentence:
            selectedWords.join(""),

        correct_words:
            trial.correctWords.join("|"),

        correct_sentence:
            trial.correctSentence,

        correct:
            correct,

        rt:
            rt

    });


    // 不显示正确/错误
    currentSSTIndex += 1;


    startSSTTrial();
}



// ======================================================
// 二十九、正式图片
// 图片加载完成后正式计时6000ms
// ======================================================

function showPicture() {

    clearPictureTimer();


    // 本Session 5张图片完成
    if (
        currentPictureIndex >=
        currentSessionPictures.length
    ) {

        finishSession();


        return;
    }


    currentScreen =
        "picture";


    resetBodyBlack();


    var pictureFile =
        currentSessionPictures[
            currentPictureIndex
        ];


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div

            style="
                width:100%;
                min-height:100vh;
                background:black;
                display:flex;
                justify-content:center;
                align-items:center;
                box-sizing:border-box;
            "

        >

            <img

                id="formalStimulusImage"

                src="${pictureFile}"

                style="
                    max-width:100%;
                    max-height:100vh;
                    object-fit:contain;
                "

            >

        </div>

    `;


    var img =
        document.getElementById(
            "formalStimulusImage"
        );


    img.onload =
        function() {

            pictureOnsetTime =
                performance.now();


            pictureTimer =
                setTimeout(
                    function() {

                        pictureActualDuration =
                            Math.round(
                                performance.now() -
                                pictureOnsetTime
                            );


                        showValenceRating();

                    },
                    6000
                );
        };


    img.onerror =
        function() {

            console.error(
                "正式图片加载失败：",
                pictureFile
            );


            alert(
                "图片加载失败：" +
                pictureFile
            );
        };


    if (img.complete) {

        img.onload();
    }
}



// ======================================================
// 三十、正式效价
// ======================================================

function showValenceRating() {

    clearPictureTimer();


    currentScreen =
        "valence";


    valenceStartTime =
        performance.now();


    renderScale(
        "效价",
        "令人不愉快",
        "中等",
        "令人愉快",
        "valence"
    );
}



// ======================================================
// 三十一、提交正式效价
// ======================================================

function submitValence(rating) {

    if (
        currentScreen !==
        "valence"
    ) {

        return;
    }


    currentValence =
        rating;


    currentValenceRT =
        Math.round(
            performance.now() -
            valenceStartTime
        );


    showArousalRating();
}



// ======================================================
// 三十二、正式唤醒度
// ======================================================

function showArousalRating() {

    currentScreen =
        "arousal";


    arousalStartTime =
        performance.now();


    renderScale(
        "唤醒度",
        "越来越低",
        "中等",
        "越来越高",
        "arousal"
    );
}



// ======================================================
// 三十三、提交正式唤醒度
// ======================================================

function submitArousal(rating) {

    if (
        currentScreen !==
        "arousal"
    ) {

        return;
    }


    var arousalRT =
        Math.round(
            performance.now() -
            arousalStartTime
        );


    var condition =
        currentBlockOrder[
            currentBlockIndex
        ];


    var pictureFile =
        currentSessionPictures[
            currentPictureIndex
        ];


    var globalPictureNum =
        currentBlockIndex * 30 +
        currentSessionIndex * 5 +
        currentPictureIndex +
        1;


    experimentData.push({

        participant_id:
            participantId,

        phase:
            "formal",

        trial_type:
            "picture_rating",

        block_num:
            currentBlockIndex + 1,

        block_condition:
            condition,

        block_order:
            currentBlockOrder.join(
                "-"
            ),

        session_num:
            currentSessionIndex + 1,

        picture_in_session:
            currentPictureIndex + 1,

        global_picture_num:
            globalPictureNum,

        picture_id:
            getPictureId(
                pictureFile
            ),

        picture_file:
            pictureFile,

        picture_duration_planned:
            6000,

        picture_duration_actual:
            pictureActualDuration,

        valence:
            currentValence,

        valence_rt:
            currentValenceRT,

        arousal:
            rating,

        arousal_rt:
            arousalRT

    });


    currentValence =
        null;


    currentValenceRT =
        null;


    pictureActualDuration =
        null;


    currentPictureIndex += 1;


    showPicture();
}



// ======================================================
// 三十四、通用9点评分页面
// ======================================================

function renderScale(
    title,
    leftLabel,
    middleLabel,
    rightLabel,
    mode
) {

    resetBodyBlack();


    var app =
        document.getElementById(
            "app"
        );


    var functionName = "";


    if (
        mode ===
        "valence"
    ) {

        functionName =
            "submitValence";
    }

    else if (
        mode ===
        "arousal"
    ) {

        functionName =
            "submitArousal";
    }

    else if (
        mode ===
        "practice_valence"
    ) {

        functionName =
            "submitPracticeValence";
    }

    else if (
        mode ===
        "practice_arousal"
    ) {

        functionName =
            "submitPracticeArousal";
    }


    var buttons = "";


    for (
        var i = 1;
        i <= 9;
        i++
    ) {

        buttons += `

            <button

                onclick="
                    ${functionName}(${i})
                "

                style="
                    background:transparent;
                    border:none;
                    color:white;
                    font-size:26px;
                    font-weight:bold;
                    cursor:pointer;
                    width:55px;
                    height:55px;
                "

            >

                ${i}

            </button>

        `;
    }


    app.innerHTML = `

        <div

            style="
                width:100%;
                min-height:100vh;
                background:black;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
                box-sizing:border-box;
                font-family:Arial, 'Microsoft YaHei', sans-serif;
            "

        >

            <div

                style="
                    width:90%;
                    max-width:900px;
                    text-align:center;
                "

            >


                <div

                    style="
                        font-size:52px;
                        font-weight:bold;
                        margin-bottom:90px;
                    "

                >

                    ${title}

                </div>


                <div

                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        font-size:28px;
                        font-weight:bold;
                        margin-bottom:20px;
                    "

                >

                    <span>
                        ${leftLabel}
                    </span>

                    <span>
                        ${middleLabel}
                    </span>

                    <span>
                        ${rightLabel}
                    </span>

                </div>


                <div

                    style="
                        position:relative;
                        width:100%;
                        height:24px;
                        margin-bottom:10px;
                    "

                >

                    <div

                        style="
                            position:absolute;
                            left:0;
                            right:0;
                            top:50%;
                            height:4px;
                            background:white;
                            transform:translateY(-50%);
                        "

                    ></div>


                    <div

                        style="
                            position:absolute;
                            left:-1px;
                            top:50%;
                            transform:
                                translateY(-50%)
                                rotate(180deg);
                            width:0;
                            height:0;
                            border-top:
                                8px solid transparent;
                            border-bottom:
                                8px solid transparent;
                            border-left:
                                14px solid white;
                        "

                    ></div>


                    <div

                        style="
                            position:absolute;
                            right:-1px;
                            top:50%;
                            transform:
                                translateY(-50%);
                            width:0;
                            height:0;
                            border-top:
                                8px solid transparent;
                            border-bottom:
                                8px solid transparent;
                            border-left:
                                14px solid white;
                        "

                    ></div>

                </div>


                <div

                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    "

                >

                    ${buttons}

                </div>


            </div>


        </div>

    `;
}



// ======================================================
// 三十五、Session结束
// 不显示Session过渡页
// ======================================================

function finishSession() {

    currentSessionIndex += 1;


    if (
        currentSessionIndex < 6
    ) {

        startSession();


        return;
    }


    finishBlock();
}



// ======================================================
// 三十六、Block结束
// ======================================================

function finishBlock() {

    currentBlockIndex += 1;


    if (
        currentBlockIndex >=
        currentBlockOrder.length
    ) {

        showEndPage();


        return;
    }


    showBlockRest();
}



// ======================================================
// 三十七、Block间休息
// ======================================================

function showBlockRest() {

    currentScreen =
        "rest";


    resetBodyWhite();


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="experiment-container">


            <div class="title">

                请稍作休息

            </div>


            <div class="instruction">

                本部分任务已经完成。

                <br><br>

                请休息片刻。

                <br><br>

                准备好后点击继续。

            </div>


            <button

                class="control-button"

                onclick="
                    startBlock()
                "

            >

                继续

            </button>


        </div>

    `;
}



// ======================================================
// 三十八、键盘监听
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {


        // ==================================================
        // 被试编号页面
        // ==================================================

        if (
            currentScreen ===
            "participant" &&
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            saveParticipantId();


            return;
        }


        // ==================================================
        // 练习SST
        // ==================================================

        if (
            currentScreen ===
            "practice_sst"
        ) {


            if (
                /^[1-5]$/.test(
                    event.key
                )
            ) {

                event.preventDefault();


                selectPracticeWord(
                    parseInt(
                        event.key,
                        10
                    ) - 1
                );


                return;
            }


            if (
                event.key ===
                "Backspace"
            ) {

                event.preventDefault();


                deletePracticeWord();


                return;
            }


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                confirmPracticeSST();


                return;
            }

        }


        // ==================================================
        // 正式SST
        // ==================================================

        if (
            currentScreen ===
            "sst"
        ) {


            if (
                /^[1-5]$/.test(
                    event.key
                )
            ) {

                event.preventDefault();


                selectWord(
                    parseInt(
                        event.key,
                        10
                    ) - 1
                );


                return;
            }


            if (
                event.key ===
                "Backspace"
            ) {

                event.preventDefault();


                deleteLastWord();


                return;
            }


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                confirmSST();


                return;
            }

        }


        // ==================================================
        // 练习效价
        // ==================================================

        if (
            currentScreen ===
            "practice_valence" &&
            /^[1-9]$/.test(
                event.key
            )
        ) {

            event.preventDefault();


            submitPracticeValence(
                parseInt(
                    event.key,
                    10
                )
            );


            return;
        }


        // ==================================================
        // 练习唤醒度
        // ==================================================

        if (
            currentScreen ===
            "practice_arousal" &&
            /^[1-9]$/.test(
                event.key
            )
        ) {

            event.preventDefault();


            submitPracticeArousal(
                parseInt(
                    event.key,
                    10
                )
            );


            return;
        }


        // ==================================================
        // 正式效价
        // ==================================================

        if (
            currentScreen ===
            "valence" &&
            /^[1-9]$/.test(
                event.key
            )
        ) {

            event.preventDefault();


            submitValence(
                parseInt(
                    event.key,
                    10
                )
            );


            return;
        }


        // ==================================================
        // 正式唤醒度
        // ==================================================

        if (
            currentScreen ===
            "arousal" &&
            /^[1-9]$/.test(
                event.key
            )
        ) {

            event.preventDefault();


            submitArousal(
                parseInt(
                    event.key,
                    10
                )
            );


            return;
        }

    }
);



// ======================================================
// 三十九、CSV生成
// ======================================================

function convertToCSV(data) {

    if (
        !data ||
        data.length === 0
    ) {

        return "";
    }


    // --------------------------------------------------
    // 收集所有字段名
    // --------------------------------------------------

    var headers = [];


    data.forEach(
        function(row) {

            Object.keys(
                row
            ).forEach(
                function(key) {

                    if (
                        headers.indexOf(
                            key
                        ) === -1
                    ) {

                        headers.push(
                            key
                        );
                    }

                }
            );

        }
    );


    // --------------------------------------------------
    // CSV转义
    // --------------------------------------------------

    function escapeCSV(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        var text =
            String(
                value
            );


        text =
            text.replace(
                /"/g,
                '""'
            );


        return (
            '"' +
            text +
            '"'
        );
    }


    var lines = [];


    // 表头
    lines.push(

        headers
        .map(
            escapeCSV
        )
        .join(",")

    );


    // 数据
    data.forEach(
        function(row) {

            var line =
                headers
                .map(
                    function(header) {

                        return escapeCSV(
                            row[header]
                        );

                    }
                )
                .join(",");


            lines.push(
                line
            );

        }
    );


    // 加BOM，Excel打开中文不会乱码
    return (
        "\uFEFF" +
        lines.join(
            "\r\n"
        )
    );
}



// ======================================================
// 四十、下载CSV
// ======================================================

function downloadCSV() {

    if (
        experimentData.length === 0
    ) {

        alert(
            "当前没有可保存的数据"
        );


        return;
    }


    var csv =
        convertToCSV(
            experimentData
        );


    var blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    var url =
        URL.createObjectURL(
            blob
        );


    var now =
        new Date();


    var dateString =

        now.getFullYear()

        + "-"

        + String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        )

        + "-"

        + String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    var safeId =
        participantId.replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );


    var filename =

        safeId

        + "_SST_"

        + dateString

        + ".csv";


    var link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        function() {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}



// ======================================================
// 四十一、实验结束
// ======================================================

function showEndPage() {

    clearPictureTimer();


    currentScreen =
        "end";


    resetBodyWhite();


    var app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="experiment-container">


            <div class="title">

                实验完成

            </div>


            <div class="instruction">

                你已经完成全部实验。

                <br><br>

                数据正在保存。

                <br><br>

                如果数据文件没有自动下载，
                请点击下面的按钮重新保存。

            </div>


            <button

                class="control-button"

                onclick="
                    downloadCSV()
                "

            >

                保存数据

            </button>


        </div>

    `;


    console.log(
        "实验完成"
    );


    console.log(
        "最终数据条数：",
        experimentData.length
    );


    console.log(
        "最终数据：",
        experimentData
    );


    // --------------------------------------------------
    // 自动下载CSV
    // --------------------------------------------------

    setTimeout(
        function() {

            downloadCSV();

        },
        500
    );
}



// ======================================================
// 四十二、Excel材料加载完成后启动
// ======================================================

materialsReady.then(
    function() {


        console.log(
            "重评材料：",
            materials.reappraisal.length
        );


        console.log(
            "分心材料：",
            materials.distract.length
        );


        console.log(
            "混合材料：",
            materials.mixed.length
        );


        console.log(
            "练习图片：",
            pictureSets.practice.length
        );


        console.log(
            "分心图片：",
            pictureSets.distract.length
        );


        console.log(
            "重评图片：",
            pictureSets.reappraisal.length
        );


        console.log(
            "混合图片：",
            pictureSets.mixed.length
        );


        showParticipantPage();

    }
);