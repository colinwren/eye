var eyeBin = '../bin/eye';
var spawn = require('child_process').spawn;
var fs = require('fs');

module.exports = {

  spawnEye: function (options, callback) {
      var eyeProcess = spawn(eyeBin, options);

      eyeProcess.stdout.on('data', function(data) {
        var dataString = data + '';
        if (dataString.indexOf('eye is watching...') !== -1) {
          callback(eyeProcess);
        }
      });
  },

  cleanTemp: function () {
    fs.readdirSync('./').forEach(function(fileName) {
      if (fileName.indexOf('temp') !== -1) {
        fs.unlinkSync(fileName);
      }
    });
  },

  testStream: function (proc, expected, callback) {
    var dataBuffer = '';

    proc.stdout.on('data', function(data) {
      dataBuffer += data;

      var currentBuffer = dataBuffer;
      var expectedLeft = expected.length;

      for (var i = 0; i < expected.length; i++) {
        var expectedStr = expected[i];
        var start = currentBuffer.indexOf(expectedStr);
        if (start !== -1) {
          var end = start + expectedStr.length;
          currentBuffer = currentBuffer.slice(0,start) + currentBuffer.slice(end);
          expectedLeft--;
        }
      }
      if (expectedLeft <= 0) {
        callback();
      }
    });
  }
};
