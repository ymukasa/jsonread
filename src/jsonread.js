const fs = require('fs');
const electron = require('electron');
const dialog = electron.remote.dialog;

/**
 * JSONファイルの読み込みを行う。
 */
function createList() {
    var createList = (filePath, fileName, fileContents) => {
        var jsonData = JSON.parse(fileContents);
        var tbody = document.getElementById("resultListBody");
        var tr = tbody.insertRow(-1);
        var td1 = tr.insertCell(-1);
        var td2 = tr.insertCell(-1);
        var td3 = tr.insertCell(-1);
        var td4 = tr.insertCell(-1);
        td1.innerHTML = fileName;
        td2.innerHTML = jsonData.id;
        td3.innerHTML = jsonData.name;
        td4.innerHTML = jsonData.physicalName;
    };
    clearTable();
    readJson(createList);
}

/** 
 * テーブルの一覧をクリアする。
 */
function clearTable() {
    var tbody = document.getElementById("resultListBody");
    while( tbody.rows[0] ) {
        tbody.deleteRow(0);
    }
}

function outputTsv() {
    outputSeparatValue("\t", "tsv");
}

function outputCsv() {
    outputSeparatValue(",", "csv");
}

function outputSeparatValue(separator, extension) {
    var tsvContents = "\"ファイル名\"" + separator + "\"ID\"" + separator + "\"論理名(name)\"" + separator + "\"物理名(physicalName)\"";
    var createTsvContents = (filePath, fileName, fileContents) => {
        var jsonData = JSON.parse(fileContents);
        tsvContents += "\n";
        tsvContents += "\"" + fileName + "\"" + separator + "\"" + jsonData.id + "\"" + separator + "\"" + jsonData.name + "\"" + separator + "\"" + jsonData.physicalName + "\"";
    };
    var outputTsvContents = () => {
        fileOutput(tsvContents, extension);
    };
    readJson(createTsvContents, outputTsvContents);
}

/**
 * 指定されたディレクトリ配下のjsonファイルを読む。
 * @param {function} callbackFileRead 読んだjsonファイル１つ分の内容を処理する関数。
 * @param {function} afterAllFileRead ファイルを全部読み終わってから実行される関数。指定は任意。
 */
function readJson(callbackFileRead, afterAllFileRead) {
    var dirPath = document.getElementById("dirpath").value;
    if (!dirPath.endsWith("/") && !dirPath.endsWith("\\")) {
        dirPath += "\\";
    }
    fs.readdir(dirPath, function(err, fileNameList) {
        if (err) throw err;
        fileNameList.forEach(function(fileName){
            var filePath = dirPath + fileName;
            if (/.*\.json$/.test(fileName)){
                fs.accessSync(filePath, fs.constants.R_OK);
                if (err) throw err;
                var fileContents = fs.readFileSync(filePath, "utf8");
                callbackFileRead(filePath, fileName, fileContents);
            }
        });
        if (afterAllFileRead !== undefined) {
            afterAllFileRead();
        }
    });
}

/**
 * 指定された contents をファイルに出力する。
 * ファイル選択ダイアログを表示して出力するファイルを選択する。
 * @param {any} contents 
 */
function fileOutput(contents, extension) {
    dialog.showSaveDialog(null, {
        title: '保存',
        defaultPath: '.',
        filters: [
            {name: '-', extensions: [extension]},
        ]
    }, (savedFileName) => {
        fs.writeFileSync(savedFileName, contents, "utf8");
        dialog.showMessageBox(null, {message: '出力完了'});
    });
}

/**
 * ディレクトリ選択のダイアログを表示する。
 */
function selectDirectory() {
    dialog.showOpenDialog(null, {
        properties: ['openDirectory'],
        title: 'フォルダ(単独選択)',
        defaultPath: '.'
    }, (folderNames) => {
        if (folderNames !== undefined && folderNames.length > 0) {
            document.getElementById("dirpath").value = folderNames[0];
        }
    });
}
