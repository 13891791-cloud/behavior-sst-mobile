// ======================================================
// SST 行为实验 - 前后测正式版
//
// 网址：
// 前测：?pid=S001&phase=pre
// 后测：?pid=S001&phase=post
//
// 实验流程：
// 1. 从网址自动读取被试编号和前/后测
// 2. 指导语
// 3. 练习：10道SST + 5张图片
// 4. 正式实验：
//      3个Block（拉丁方平衡）
//      每Block 6个Session
//      每Session：10道SST + 5张图片
//
// SST：
//      鼠标/触摸点击
//      数字键1-5选择
//      Backspace删除上一个
//      Enter确认
//      不反馈正确/错误
//
// 图片：
//      真实加载完成后开始计时
//      呈现6000 ms
//      自动进入效价
//      自动进入唤醒度
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
// 一、URL：被试编号 + 前后测
// ======================================================

var urlParams =
    new URLSearchParams(
        window.location.search
    );

var participantId =
    urlParams.get("pid") || "";

var phase =
    urlParams.get("phase") || "";


// ======================================================
// 二、全局变量
// ======================================================

var experimentData = [];

var currentScreen = "guidance";


// ------------------------------------------------------
// SST
// ------------------------------------------------------

var selectedWords = [];

var trialStartTime = null;


// ------------------------------------------------------
// 正式实验
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


// ------------------------------------------------------
// Block顺序
// ------------------------------------------------------

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
// ======================================================

var pictureSets = {

    // --------------------------------------------------
    // 练习5张
    // --------------------------------------------------

    practice: [

        "negative/9145.jpg",
        "negative/9163.jpg",
        "negative/9185.jpg",
        "negative/9220.jpg",
        "negative/9280.jpg"

    ],


    // --------------------------------------------------
    // 分心30张
    // --------------------------------------------------

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


    // --------------------------------------------------
    // 重评30张
    // --------------------------------------------------

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


    // --------------------------------------------------
    // 混合30张
    // --------------------------------------------------

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

function shuffleArray(array) {

    var copy =
        array.slice();

    for (
        var i = copy.length - 1;
        i > 0;
        i--
    ) {

        var j =
            Math.floor(
                Math.random() * (i + 1)
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


function arraysEqual(a, b) {

    if (
        a.length !== b.length
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


function resetBodyWhite() {

    document.body.style.background =
        "#ffffff";

    document.body.style.color =
        "#000000";
}


function resetBodyBlack() {

    document.body.style.background =
        "#000000";

    document.body.style.color =
        "#ffffff";
}


function clearPictureTimer() {

    if (pictureTimer) {

        clearTimeout(
            pictureTimer
        );

        pictureTimer = null;
    }
}


function getPictureId(path) {

    var fileName =
        path.split("/").pop();

    return fileName.replace(
        /\.jpg$/i,
        ""
    );
}


// ======================================================
// 五、根据被试编号决定Block顺序
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
// 六、检查URL
// ======================================================

function checkURL() {

    if (!participantId) {

        showURLProblem(
            "没有检测到被试编号。",
            "请使用类似：?pid=S001&phase=pre"
        );

        return false;
    }


    if (
        phase !== "pre" &&
        phase !== "post"
    ) {

        showURLProblem(
            "没有正确检测到前测/后测。",
            "请使用 phase=pre 或 phase=post"
        );

        return false;
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
        "测量阶段：",
        phase
    );

    console.log(
        "Block顺序：",
        currentBlockOrder
    );


    return true;
}


// ======================================================
// 七、URL错误页面
// ======================================================

function showURLProblem(title, message) {

    currentScreen =
        "url_error";

    resetBodyWhite();

    var app =
        document.getElementById(
            "app"
        );

    app.innerHTML = `

        <div class="experiment-container">

            <div class="title">
                实验链接错误
            </div>

            <div class="instruction">

                ${title}

                <br><br>

                ${message}

                <br><br>

                正确示例：

                <br><br>

                https://13891791-cloud.github.io/behavior-sst-mobile/?pid=S001&phase=pre

            </div>

        </div>

    `;
}


// ======================================================
// 八、正式指导语
// ======================================================

function showGuidance() {

    currentScreen =
        "guidance";

    resetBodyWhite();

    var app =
        document.getElementById(
            "app"
        );

    app.innerHTML = `

        <div class="experiment-container">

            <div class="title">
                实验指导语
            </div>

            <div class="instruction">

                接下来将进行一项句子组成和图片评价任务。

                <br><br>

                首先会进行一小段练习，
                帮助你熟悉任务操作。

                <br><br>

                在句子组成任务中，
                你会看到5个词语，
                请从中选择4个词，
                并按照你认为正确的顺序组成一个通顺的句子。

                <br><br>

                你可以直接点击词语，
                也可以使用数字键
                1、2、3、4、5
                进行选择。

                <br><br>

                Backspace：
                删除上一个选择。

                <br><br>

                Enter：
                确认当前答案。

                <br><br>

                接下来会呈现图片。
                每张图片会呈现6秒。

                <br><br>

                图片消失后，
                请分别对图片的效价和唤醒度进行1—9点评分。

                <br><br>

                效价：
                1表示非常不愉快，
                9表示非常愉快。

                <br><br>

                唤醒度：
                1表示非常低，
                9表示非常高。

                <br><br>

                请按照自己的第一反应作答。

            </div>

            <button
                class="control-button"
                onclick="startPracticeInstruction()"
            >
                开始
            </button>

        </div>

    `;
}


// ======================================================
// 九、练习指导语
// ======================================================

function startPracticeInstruction() {

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

                接下来进行练习。

                <br><br>

                练习包括句子组成任务和图片评价任务。

                <br><br>

                请按照刚才的说明完成练习。

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
// 十、开始练习
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
// 十一、练习SST
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
                    : selectedWords.join(" → ")
                }

            </div>

            <div class="control-area">

                <button
                    class="control-button"
                    onclick="deletePracticeWord()"
                >
                    删除上一个
                </button>

                <button
                    class="control-button"
                    onclick="confirmPracticeSST()"
                >
                    确认
                </button>

            </div>

        </div>

    `;

    app.innerHTML =
        html;
}


function selectPracticeWord(index) {

    var trial =
        practiceTrials[
            practiceTrialIndex
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

    renderPracticeSST();
}


function deletePracticeWord() {

    if (
        selectedWords.length > 0
    ) {

        selectedWords.pop();

        renderPracticeSST();
    }
}


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
            phase,

        stage:
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
// 十二、练习图片
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


    var started =
        false;


    function startPictureTimer() {

        if (started) {
            return;
        }

        started = true;

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
    }


    img.onload =
        startPictureTimer;


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


    if (img.complete) {
        startPictureTimer();
    }
}


// ======================================================
// 十三、练习效价
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


function submitPracticeValence(
    rating
) {

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
// 十四、练习唤醒度
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


function submitPracticeArousal(
    rating
) {

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
            phase,

        stage:
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
// 十五、练习结束
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
                练习完成
            </div>

            <div class="instruction">

                练习已经完成。

                <br><br>

                接下来进入正式实验。

                <br><br>

                正式实验过程中，
                请按照指导语完成任务。

            </div>

            <button
                class="control-button"
                onclick="startFormalExperiment()"
            >
                开始正式实验
            </button>

        </div>

    `;
}


// ======================================================
// 十六、开始正式实验
// ======================================================

function startFormalExperiment() {

    currentBlockIndex = 0;

    currentSessionIndex = 0;

    currentSSTIndex = 0;

    currentPictureIndex = 0;

    startBlock();
}


// ======================================================
// 十七、开始Block
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
        "开始Block：",
        currentBlockIndex + 1,
        condition
    );


    startSession();
}


// ======================================================
// 十八、开始Session
// 不显示Session页面
// ======================================================

function startSession() {

    var condition =
        currentBlockOrder[
            currentBlockIndex
        ];


    var sentenceStart =
        currentSessionIndex * 10;


    currentSessionSST =
        currentBlockTrials.slice(
            sentenceStart,
            sentenceStart + 10
        );


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
// 十九、正式SST
// ======================================================

function startSSTTrial() {

    currentScreen =
        "sst";

    resetBodyWhite();


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
                    : selectedWords.join(" → ")
                }

            </div>

            <div class="control-area">

                <button
                    class="control-button"
                    onclick="deleteLastWord()"
                >
                    删除上一个
                </button>

                <button
                    class="control-button"
                    onclick="confirmSST()"
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
// 二十、正式SST选词
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


function deleteLastWord() {

    if (
        selectedWords.length > 0
    ) {

        selectedWords.pop();

        renderSST();
    }
}


// ======================================================
// 二十一、正式SST确认
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
            phase,

        stage:
            "formal",

        trial_type:
            "sst",

        block_num:
            currentBlockIndex + 1,

        block_condition:
            condition,

        block_order:
            currentBlockOrder.join("-"),

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
// 二十二、正式图片
// ======================================================

function showPicture() {

    clearPictureTimer();


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


    var started =
        false;


    function startPictureTimer() {

        if (started) {
            return;
        }

        started = true;

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
    }


    img.onload =
        startPictureTimer;


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
        startPictureTimer();
    }
}


// ======================================================
// 二十三、正式效价
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


function submitValence(
    rating
) {

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
// 二十四、正式唤醒度
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


function submitArousal(
    rating
) {

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
            phase,

        stage:
            "formal",

        trial_type:
            "picture_rating",

        block_num:
            currentBlockIndex + 1,

        block_condition:
            condition,

        block_order:
            currentBlockOrder.join("-"),

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
// 二十五、9点评分页面
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


    var functionName =
        "";


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
                    touch-action:manipulation;
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
                font-family:Arial,'Microsoft YaHei',sans-serif;
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
                            border-top:8px solid transparent;
                            border-bottom:8px solid transparent;
                            border-left:14px solid white;
                        "
                    ></div>


                    <div
                        style="
                            position:absolute;
                            right:-1px;
                            top:50%;
                            transform:translateY(-50%);
                            width:0;
                            height:0;
                            border-top:8px solid transparent;
                            border-bottom:8px solid transparent;
                            border-left:14px solid white;
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
// 二十六、Session结束
// 不显示Session页面
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
// 二十七、Block结束
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
// 二十八、Block之间休息
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
                onclick="startBlock()"
            >
                继续
            </button>

        </div>

    `;
}


// ======================================================
// 二十九、键盘监听
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {


        // ------------------------------------------------
        // 练习SST
        // ------------------------------------------------

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


        // ------------------------------------------------
        // 正式SST
        // ------------------------------------------------

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


        // ------------------------------------------------
        // 练习效价
        // ------------------------------------------------

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


        // ------------------------------------------------
        // 练习唤醒度
        // ------------------------------------------------

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


        // ------------------------------------------------
        // 正式效价
        // ------------------------------------------------

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


        // ------------------------------------------------
        // 正式唤醒度
        // ------------------------------------------------

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
// 三十、CSV生成
// ======================================================

function convertToCSV(data) {

    if (
        !data ||
        data.length === 0
    ) {

        return "";
    }


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


    function escapeCSV(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        var text =
            String(value);


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


    lines.push(
        headers
        .map(
            escapeCSV
        )
        .join(",")
    );


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


    return (
        "\uFEFF" +
        lines.join(
            "\r\n"
        )
    );
}


// ======================================================
// 三十一、下载CSV
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

        + "_"

        + phase

        + "_"

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
// 三十二、实验结束
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
                onclick="downloadCSV()"
            >
                保存数据
            </button>

        </div>

    `;


    console.log(
        "实验完成"
    );

    console.log(
        "被试编号：",
        participantId
    );

    console.log(
        "阶段：",
        phase
    );

    console.log(
        "Block顺序：",
        currentBlockOrder
    );

    console.log(
        "最终数据条数：",
        experimentData.length
    );

    console.log(
        "最终数据：",
        experimentData
    );


    setTimeout(
        function() {

            downloadCSV();

        },
        500
    );
}


// ======================================================
// 三十三、Excel材料加载完成后启动
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


        // ------------------------------------------------
        // 检查网址
        // ------------------------------------------------

        if (
            !checkURL()
        ) {

            return;
        }


        // ------------------------------------------------
        // 显示正式指导语
        // ------------------------------------------------

        showGuidance();

    }
);