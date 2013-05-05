var eyeBin = '../bin/eye';
var spawn = require('child_process').spawn;
var fs = require('fs');

module.exports = {

  spawnEye: function(options, callback) {
      var eyeProcess = spawn(eyeBin, options);

      eyeProcess.stdout.on('data', function (data) {
        var dataString = data + '';
        if (dataString.indexOf('eye is watching...') !== -1) {
          callback(eyeProcess);
        }
      });
  },

  cleanTemp: function() {
    fs.readdirSync('./').forEach(function(fileName) {
      if (fileName.indexOf('temp') !== -1) {
        fs.unlinkSync(fileName);
      }
    });
  }
};
