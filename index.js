function saveText(text, fileName) {
  var a, blob, event;
  if (fileName == null) {
    fileName = "textfile.txt";
  }
  blob = new Blob([text], {
    type: "text/plain"
  });
  if (window.navigator.msSaveBlob != null) {
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.target = "_blank";
    a.download = fileName;
    event = document.createEvent("MouseEvents");
    event.initEvent("click", false, true);
    a.dispatchEvent(event);
  }
}
function createToast(filename){
    var $toast = $('<div class="toast">')
        .append($('<div class="toast-head">'))
        .append($('<div class="toast-content">'));
    $toast.find('.toast-head').text(filename);
    return $toast;
}
function toastConverting($toast) {
    $toast.removeClass('password');
    $toast.addClass('converting');
    $toast.find('.toast-content').text('converting...');
}
function toastSuccess($toast) {
    console.log("success");
    $toast.find('.toast-content').text('Success');
    $toast.removeClass('error');
    $toast.removeClass('converting');
    $toast.removeClass('password');
    $toast.addClass('success');
    $toast.fadeOut(3000, function() {
        $(this).remove();
    });
}
function toastPassword($toast, callback) {
    $toast.find('.toast-content').text('');
    $toast.find('.toast-content')
        .append($('<span>').text('pass: '))
        .append($('<input type="password">'));
    $toast.removeClass('converting');
    $toast.addClass('password');
    $toast.find('input').change(function(){
        var pass = $toast.find('input').val();
        toastConverting($toast);
        callback(pass);
    });
}
function toastError($toast, message) {
    console.log("error", message);
    $toast.find('.toast-content').text(message);
    $toast.removeClass('converting');
    $toast.addClass('error');
    $toast.fadeOut(8000, function() {
        $(this).remove();
    });
}
/*
function render(file) {
    var $toast = createToast(file.name);
    $('#toasts').append($toast);
    if (file.type != 'application/pdf') {
        toastError($toast, 'It is not PDF file.');
        return;
    }
    toastConverting($toast);
    var filename = "index.html";
    if (/\./.test(file.name)) {
        filename = file.name.replace(/\.[^\.]*$/,".html");
    }
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
        renderPDF($('<div>'), fileReader.result, filename, null, function(data){
            saveText(data, filename);
            toastSuccess($toast);
        }, function(message) {
            toastError($toast, message);
        }, function(callback) {
            toastPassword($toast, callback);
        });
    }
    fileReader.readAsArrayBuffer(file);
}
*/
function render(file) {
    var $toast = createToast(file.name);
    $('#toasts').append($toast);
    toastConverting($toast);

    var er = new ExcelJs.Reader(file, function (eve, xlsx) {
      var filename = file.name.replace(".xlsm", "") + ".csv";
      var data = xlsx.toCsv();
      saveText(data, filename);
      toastSuccess($toast);
    });
}
$(function(){
    var $area = $(".drag-and-drop-area");
    $area.on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    $area.on('dragover', function (e){
        e.stopPropagation();
        e.preventDefault();
    });
    $area.on('drop', function (e)
    {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        for(var i=0;i<files.length;i++) {
            render(files[i]);
        }
    });

    $('.drag-and-drop-area').on('click',function(){
        $('#file_input').click();
    });
    $('#file_input').change(function() {
      var files = $(this).prop('files');
      for (var i = 0; i < files.length; i++) {
        render(files[i]);
      }
    });
});