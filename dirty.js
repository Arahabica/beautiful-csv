$(function() {
  new DDLoader(function(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = e.target.result;
      callback(null, file.name, data, "bom");
    };
    reader.readAsText(file);
  });
});
