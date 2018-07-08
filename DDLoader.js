var DDLoader = (function() {
  "use strict";

  function DDLoader(callback) {
    var that = this;
    var $area = $(".drag-and-drop-area");
    $area.on("dragenter", function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $area.on("dragover", function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $area.on("drop", function(e) {
      e.preventDefault();
      var files = e.originalEvent.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        that.render(files[i], callback);
      }
    });

    $(".drag-and-drop-area").on("click", function() {
      $("#file_input").click();
    });
    $("#file_input").change(function() {
      var files = $(this).prop("files");
      for (var i = 0; i < files.length; i++) {
        that.render(files[i], callback);
      }
    });
  }
  DDLoader.prototype.saveText = function(text, fileName) {
    if (fileName == null) {
      fileName = "textfile.txt";
    }
    var blob = new Blob([text], {
      type: "text/plain"
    });
    this.saveBlob(blob, fileName);
  };

  DDLoader.prototype.saveSJIS = function(text, fileName) {
    text = text.replace(/\n/g, "\r\n");
    var str_array = Encoding.stringToCode(text);
    var sjis_array = Encoding.convert(str_array, "SJIS", "UNICODE");
    var uint8_array = new Uint8Array(sjis_array);
    var blob = new Blob([uint8_array], { type: "text/csv;" });
    this.saveBlob(blob, fileName);
  };

  DDLoader.prototype.saveBlob = function(blob, fileName) {
    var a, event;
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
  };

  DDLoader.prototype.createToast = function(filename) {
    var $toast = $('<div class="toast">')
      .append($('<div class="toast-head">'))
      .append($('<div class="toast-content">'));
    $toast.find(".toast-head").text(filename);
    return $toast;
  };

  DDLoader.prototype.toastConverting = function($toast) {
    $toast.removeClass("password");
    $toast.addClass("converting");
    $toast.find(".toast-content").text("converting...");
  };

  DDLoader.prototype.toastSuccess = function($toast, filename) {
    if (filename) {
      $toast.find(".toast-head").text(filename);
    }
    $toast.find(".toast-content").text("Success");
    $toast.removeClass("error");
    $toast.removeClass("converting");
    $toast.removeClass("password");
    $toast.addClass("success");
    $toast.fadeOut(3000, function() {
      $(this).remove();
    });
  };

  DDLoader.prototype.toastError = function($toast, message) {
    console.log("error", message);
    $toast.find(".toast-content").text(message);
    $toast.removeClass("converting");
    $toast.addClass("error");
    $toast.fadeOut(8000, function() {
      $(this).remove();
    });
  };
  DDLoader.prototype.render = function(file, callback) {
    var $toast = this.createToast(file.name);
    $("#toasts").append($toast);
    this.toastConverting($toast);
    var that = this;
    callback(file, function(err, filename, data, contentType) {
      if (err) {
        that.toastError($toast, err.message);
      } else {
        if (contentType === "bom") {
          that.saveSJIS(data, filename);
        } else {
          that.saveText(data, filename);
        }
        that.toastSuccess($toast, filename);
      }
    });
  };
  return DDLoader;
})();
