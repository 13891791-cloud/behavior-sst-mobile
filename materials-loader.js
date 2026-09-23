// ================================
// 从 materials.xlsx 读取 SST 材料
// Excel结构：
// Sheet1
// A列出现 CP / FX / MAX 作为条件分段标记
// B-F列 = 5个候选词
// G列 = 正确句子
// ================================

var materials = {
    reappraisal: [],
    distract: [],
    mixed: []
};


// 从5个候选词中反推出正确4词顺序
function findCorrectWords(words, correctSentence) {

    var result = null;

    function permute(current, remaining) {

        if (result !== null) {
            return;
        }

        if (current.length === 4) {

            if (current.join("") === correctSentence) {
                result = current.slice();
            }

            return;
        }

        for (var i = 0; i < remaining.length; i++) {

            var nextWord = remaining[i];

            var nextRemaining =
                remaining.slice(0, i)
                .concat(remaining.slice(i + 1));

            permute(
                current.concat([nextWord]),
                nextRemaining
            );
        }
    }

    permute([], words);

    return result;
}


// ================================
// 解析 Sheet1
// ================================

function parseMaterials(workbook) {

    var sheet = workbook.Sheets["Sheet1"];

    if (!sheet) {
        console.error("找不到 Sheet1");
        return;
    }

    var rows = XLSX.utils.sheet_to_json(
        sheet,
        {
            header: 1,
            defval: ""
        }
    );


    // 当前属于哪个条件
    var currentCondition = null;

    var counters = {
        CP: 0,
        FX: 0,
        MAX: 0
    };


    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        var marker =
            String(row[0] || "")
            .trim()
            .toUpperCase();


        // =========================
        // 判断是否进入新的条件
        // =========================

        if (marker === "CP") {

            currentCondition = "CP";

        } else if (marker === "FX") {

            currentCondition = "FX";

        } else if (marker === "MAX") {

            currentCondition = "MAX";

        }


        // 还没进入任何条件时跳过
        if (!currentCondition) {
            continue;
        }


        // =========================
        // B-F列：5个候选词
        // =========================

        var words = [
            row[1],
            row[2],
            row[3],
            row[4],
            row[5]
        ].map(function(x) {
            return String(x || "").trim();
        });


        // G列正确句子
        var correctSentence =
            String(row[6] || "").trim();


        // 跳过空行
        if (
            words.every(function(word) {
                return word === "";
            })
        ) {
            continue;
        }


        // 如果G列没有答案，跳过
        if (correctSentence === "") {
            continue;
        }


        var correctWords =
            findCorrectWords(
                words,
                correctSentence
            );


        if (!correctWords) {

            console.warn(
                "无法匹配正确答案：",
                "Excel第" + (i + 1) + "行",
                words,
                correctSentence
            );

            continue;
        }


        counters[currentCondition] += 1;


        var conditionName = "";

        if (currentCondition === "CP") {
            conditionName = "reappraisal";
        }

        if (currentCondition === "FX") {
            conditionName = "distract";
        }

        if (currentCondition === "MAX") {
            conditionName = "mixed";
        }


        var item = {

            id:
                currentCondition +
                counters[currentCondition],

            sourceCondition:
                currentCondition,

            condition:
                conditionName,

            excelRow:
                i + 1,

            words:
                words,

            correctWords:
                correctWords,

            correctSentence:
                correctSentence

        };


        // =========================
        // 放进对应材料数组
        // =========================

        if (currentCondition === "CP") {

            materials.reappraisal.push(item);

        } else if (currentCondition === "FX") {

            materials.distract.push(item);

        } else if (currentCondition === "MAX") {

            materials.mixed.push(item);

        }

    }

}


// ================================
// 加载 Excel
// ================================

async function loadMaterials() {

    try {

        var response =
            await fetch("materials.xlsx");

        if (!response.ok) {

            throw new Error(
                "无法加载 materials.xlsx：" +
                response.status
            );

        }


        var arrayBuffer =
            await response.arrayBuffer();


        var workbook =
            XLSX.read(arrayBuffer);


        console.log(
            "Excel工作表：",
            workbook.SheetNames
        );


        parseMaterials(workbook);


        console.log(
            "重评 CP：",
            materials.reappraisal.length
        );

        console.log(
            "分心 FX：",
            materials.distract.length
        );

        console.log(
            "混合 MAX：",
            materials.mixed.length
        );


        console.log(
            "全部材料：",
            materials
        );


        // 检查材料数量
        if (
            materials.reappraisal.length !== 60 ||
            materials.distract.length !== 60 ||
            materials.mixed.length !== 60
        ) {

            console.warn(
                "材料数量不是预期的60/60/60，请检查！"
            );

        }

    } catch (error) {

        console.error(
            "材料加载失败：",
            error
        );

        throw error;

    }

}


// experiment.js 等这个Promise完成
var materialsReady = loadMaterials();