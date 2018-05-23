const fs = require('fs');
const electron = require('electron');
const dialog = electron.remote.dialog;
const clipboard = electron.clipboard;

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
        var td5 = tr.insertCell(-1);
        td1.innerHTML = fileName;
        td2.innerHTML = jsonData.id;
        td3.innerHTML = jsonData.name;
        td4.innerHTML = jsonData.physicalName;
        td5.innerHTML = jsonData.description;
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

/**
 * tsv形式の文字コンテンツをファイルに出力する。
 */
function outputTsv() {
    outputSeparatValue("\t", "tsv");
}

/**
 * csv形式の文字コンテンツをファイルに出力する。
 */
function outputCsv() {
    outputSeparatValue(",", "csv");
}

/**
 * 画面上で指定されたディレクトリ内のjsonファイルを読み込んで、ファイル名、ID、論理名、物理名を
 * separatorで区切られた文字コンテンツにしてファイルに出力する。
 * ファイル名、ID、論理名、物理名の各要素は全てダブルクォートで囲んだ文字列になる。（ただし、ダブルクォートのエスケープ処理は行っていない）
 * separatorにカンマが指定されればcsv, タブが指定されればtsvになる。
 * @param {string} separator 文字コンテンツの区切り文字。
 * @param {string} extension 出力するファイルの拡張子。
 */
function outputSeparatValue(separator, extension) {
    var contents = "\"ファイル名\"" + separator + "\"ID\"" + separator + "\"論理名(name)\"" + separator + "\"物理名(physicalName)\"" + separator + "\"説明(description)\"";
    var createContents = (filePath, fileName, fileContents) => {
        var jsonData = JSON.parse(fileContents);
        contents += "\n";
        contents += "\"" + fileName + "\"" + separator + "\"" + jsonData.id + "\"" + separator + "\"" + jsonData.name + "\"" + separator + "\"" + jsonData.physicalName + "\"" + separator + "\"" + jsonData.description + "\"";
    };
    var outputContents = () => {
        fileOutput(contents, extension);
    };
    readJson(createContents, outputContents);
}

/**
 * tsv形式の文字コンテンツをクリップボードにコピーする。
 */
function copyTsv() {
    copySeparatValue("\t");
}

/**
 * csv形式の文字コンテンツをクリップボードにコピーする。
 */
function copyCsv() {
    copySeparatValue(",");
}

/**
 * QueryTypeに定義されているクエリを組み立ててクリップボードにコピーする。
 */
function copyQuery() {
    var contents = "";
    var createContents = (filePath, fileName, fileContents) => {

        if (fileName.startsWith("QueryType") === false) {
            return;
        }

        // select 句
        var jsonData = JSON.parse(fileContents);
        contents += "\n\n";
        contents += "-- " + fileName + " | " + jsonData.description;

        contents += "\nselect ";
        for (var i = 0; i < jsonData.criteria.header.headerColumnList.length; i++) {
            var headerColumn = jsonData.criteria.header.headerColumnList[i];
            if (i > 0) {
                contents += ", ";
            }
            contents += headerColumn.expression + " as " + headerColumn.name;
        }

        // from 句、where 句
        contents += " " + jsonData.sql + " ";

        // order by 句
        if (jsonData.criteria.order.orderColumnList.length > 0) {
            contents += " order by ";
            for (var j = 0; j < jsonData.criteria.order.orderColumnList.length; j++) {
                var orderColumn = jsonData.criteria.order.orderColumnList[j];
                if (j > 0) {
                    contents += ", ";
                }
                contents += orderColumn.name;
            }
        }

        contents += ";";
    };

    var copyContents = () => {
        clipboard.writeText(contents);
        dialog.showMessageBox(null, {message: '終わったよ'});
    };
    readJson(createContents, copyContents);
}

/**
 * 画面上で指定されたディレクトリ内のjsonファイルを読み込んで、ファイル名、ID、論理名、物理名を
 * separatorで区切られた文字コンテンツにしてクリップボードにコピーする。
 * ファイル名、ID、論理名、物理名の各要素は全てダブルクォートで囲んだ文字列になる。（ただし、ダブルクォートのエスケープ処理は行っていない）
 * separatorにカンマが指定されればcsv, タブが指定されればtsvになる。
 * @param {string} separator 文字コンテンツの区切り文字。
 */
function copySeparatValue(separator) {
    var contents = "\"ファイル名\"" + separator + "\"ID\"" + separator + "\"論理名(name)\"" + separator + "\"物理名(physicalName)\"" + separator + "\"説明(description)\"";
    var createContents = (filePath, fileName, fileContents) => {
        var jsonData = JSON.parse(fileContents);
        contents += "\n";
        contents += "\"" + fileName + "\"" + separator + "\"" + jsonData.id + "\"" + separator + "\"" + jsonData.name + "\"" + separator + "\"" + jsonData.physicalName + "\"" + separator + "\"" + jsonData.description + "\"";
    };
    var copyContents = () => {
        clipboard.writeText(contents);
        dialog.showMessageBox(null, {message: '終わったよ'});
    };
    readJson(createContents, copyContents);
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
 * @param {any} contents 出力する内容
 * @param {string} 出力するファイルの拡張子
 */
function fileOutput(contents, extension) {
    dialog.showSaveDialog(null, {
        title: '保存',
        defaultPath: '.',
        filters: [
            {name: extension + 'ファイル', extensions: [extension]},
        ]
    }, (savedFileName) => {
        fs.writeFileSync(savedFileName, contents, "utf8");
        dialog.showMessageBox(null, {message: '出力完了'});
    });
}

/**
 * ダイアログ表示して、処理するディレクトリを選択⇒設定する。
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
