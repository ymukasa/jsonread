const fs = require('fs');
const remote = require('electron').remote;
const dialog = remote.dialog;

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
        tbody.deleteRow( 0 );
    }
}

/**
 * 指定されたディレクトリ配下のjsonファイルを読む。
 * @param {function} callbackFileRead 読んだjsonファイル１つ分の内容を処理する関数。
 */
function readJson(callbackFileRead) {
    var dirPath = document.getElementById("dirpath").value;
    if (!dirPath.endsWith("/") && !dirPath.endsWith("\\")) {
        dirPath += "\\";
    }
    fs.readdir(dirPath, function(err, fileNameList) {
        if (err) throw err;
        fileNameList.forEach(function(fileName){
            var filePath = dirPath + fileName;
            if (/.*\.json$/.test(fileName)){
                fs.access(filePath, fs.constants.R_OK, function(err) {
                    if (err) throw err;
                    fs.readFile(filePath, "utf8", function(err, fileContents) {
                        if (err) throw err;
                        callbackFileRead(filePath, fileName, fileContents);
                    });
                });
            }
        });
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
