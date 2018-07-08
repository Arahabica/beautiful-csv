$(function() {
  new DDLoader(function(file, callback) {
    new ExcelJs.Reader(file, function(err, xlsx) {
      if (err) {
        callback(err);
      } else {
        var filename =
          file.name.replace(/\.xlsm$/, "").replace(/\.xlsx$/, "") + ".csv";
        var data = xlsx.toCsv();
        callback(null, filename, data, "text");
      }
    });
  });
});
