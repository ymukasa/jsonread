const fs = require('fs');

function read() {
    var tbody = document.getElementById("resultListBody");
    while( tbody.rows[0] ) {
        tbody.deleteRow( 0 );
    }
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
                        var jsonData = JSON.parse(fileContents);
                        var tr = tbody.insertRow(-1);
                        var td1 = tr.insertCell(-1);
                        var td2 = tr.insertCell(-1);
                        var td3 = tr.insertCell(-1);
                        var td4 = tr.insertCell(-1);
                        td1.innerHTML = fileName;
                        td2.innerHTML = jsonData.id;
                        td3.innerHTML = jsonData.name;
                        td4.innerHTML = jsonData.physicalName;
                    });
                });
            }
        });
    });
}
