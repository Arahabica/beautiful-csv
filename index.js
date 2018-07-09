$(function() {
  new DDLoader(function(file, callback) {
    if (/\.csv$/.test(file.name)) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        data = data.replace(/\r\n/g, "\n");
        callback(null, file.name, data, "text");
      };
      reader.readAsText(file);
    } else {
      new ExcelJs.Reader(file, function(err, xlsx) {
        if (err) {
          callback(err);
        } else {
          var filename =
            file.name.replace(/\.xlsm$/, "").replace(/\.xlsx$/, "") + ".csv";
          var data = xlsx.toCsv();
          data = data.replace(/\r\n/g, "\n");
          callback(null, filename, data, "text");
        }
      });
    }
  });
});
