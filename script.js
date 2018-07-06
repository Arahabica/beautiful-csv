(function (window, document) {
  window.ExcelJs = {};
  ExcelJs.File = function (_file, _workbook) {
    var that = this;
    var file = _file;
    var workbook = _workbook;

    return {
      getFile: function () {
        return file;
      },
      getWorkbook: function () {
        return workbook;
      },
      toCsv: function () {
        var result = "";
        var activeTab = workbook.Workbook.WBView[0].activeTab;
        var sheet = workbook.Sheets[workbook.SheetNames[activeTab]];
        var range = sheet["!ref"];
        var last_column = range.replace(/^.*:/,"").replace(/[0-9]*$/,"");
        var last_index = this.indexFromExcel(last_column);
        var last_row = parseInt(range.replace(/^.*:[A-Z]*/,""));
        for(var row=1; row<= last_row; row++) {
          for (var col = 1; col <= last_index; col++) {
            var column = this.excelIndex(col);
            var val = "";
            var cell = sheet[column + String(row)];
            if (cell) {
              val = sheet[column + String(row)].v;
              if (val instanceof Date) {
                val = moment(val).format("YYYY-MM-DD HH:mm:ss");
              }
              if (!val) {
                val = "";
              }
            }
            if (col > 1) {
              result += ",";
            }
            result += val;
          }
          result += "\n";
        }
        return result;
      },
      excelIndex: function(index) {
        var str ="";
        while(index > 0) {
          str = String.fromCharCode(index % 26 + "A".charCodeAt(0) - 1) + str;
          index = Math.floor(index /26);
        }
        return str;
      },
      indexFromExcel: function(str) {
        var sum = 0;
        for(var i=0;i<str.length;i++) {
          sum *= 26;
          sum += str.charCodeAt(i) - "A".charCodeAt(0) + 1;
        }
        return sum;
      }
    };
  };

  ExcelJs.Reader = function (_file, onload) {
    var that = this;

    var file = _file;
    var reader = new FileReader();

    reader.onload = function(e) {
      var data = e.target.result;
      // データが多いとString.fromCharCode()でMaximum call stack size exceededエラーとなるので、
      // 別途関数で処理をする。
      //var arr = String.fromCharCode.apply(null, new Uint8Array(data));
      var arr = handleCodePoints(new Uint8Array(data));

      if (typeof onload === 'function') {
        onload(e, new ExcelJs.File(file, XLSX.read(btoa(arr), {type: 'base64', cellDates: true})));
      }
    };
    reader.readAsArrayBuffer(file);
  };
})(window, window.document);

// see: https://github.com/mathiasbynens/String.fromCodePoint/issues/1
function handleCodePoints(array) {
  var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
  var index = 0;
  var length = array.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return result;
}

function renderResult(name, content) {
  var elem = document.getElementById('result');
  var html = elem.innerHTML;
  html += '<h3>' + name + '</h3>';
  html += '<pre>' + content + '</pre>';
  elem.innerHTML = html;
}
document.getElementById('import-excel').addEventListener('change', function (evt) {
  var files = evt.target.files;
  var i, f;
  for (i = 0, f = files[i]; i != files.length; ++i) {
    var er = new ExcelJs.Reader(f, function (e, xlsx) {
      renderResult(xlsx.getFile().name, xlsx.toCsv());
    });
  }
}, false);