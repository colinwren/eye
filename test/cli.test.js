var should = require('should');
var fs = require('fs');
var helper = require('./helper.js');
var eyeProcess;

before(function() {
  // Move into test directory
  process.chdir('test');
});

after(function() {
  // Move out of test directory
  process.chdir('../');
});

beforeEach(function() {
  // Delete all temp files
  helper.cleanTemp();
});

afterEach(function() {
  // Kill leftover eye process
  if (eyeProcess) eyeProcess.kill();

  // Delete all temp files
  helper.cleanTemp();
});


describe('single task no options', function() {

  beforeEach(function (done) {
    fs.writeFileSync('temp2', 'new');
    helper.spawnEye(['node', 'task.js'], function(eyeProc) {
      eyeProcess = eyeProc;
      done();
    });
  });

  afterEach(function() {
    eyeProcess.kill();
  });

  describe('when a new file is added to current directory', function() {

    it('should run the command and log its output', function(done) {

      helper.testStream(eyeProcess, ['task'], function() {
        done();
      });

      fs.writeFileSync('temp', 0);
    });
  });

  describe('when a file in the current directory is changed', function() {

    it('should run the command and log its output', function(done) {

      helper.testStream(eyeProcess, ['task'], function() {
        done();
      });

      fs.writeFileSync('temp2', 'changed');
    });
  });

  describe('when a file is deleted from the current directory', function() {

    it('should run the command and log its output', function(done) {

      helper.testStream(eyeProcess, ['task'], function() {
        done();
      });

      fs.unlinkSync('temp2');
    });
  });
});

describe('multiple tasks using `and`', function() {

  beforeEach(function (done) {
    helper.spawnEye(['node', 'task.js', 'and', 'node', 'task2.js'], function(eyeProc) {
      eyeProcess = eyeProc;
      done();
    });
  });

  describe('when a new file is added to the current directory', function() {

    it('should run both commands and log their output', function(done) {

      helper.testStream(eyeProcess, ['task','task2'], function() {
        done();
      });

      fs.writeFileSync('temp', 0);
    });
  });
});

describe('single task with options arguments', function() {

  beforeEach(function (done) {
    helper.spawnEye(['node', 'task.js','--option'], function(eyeProc) {
      eyeProcess = eyeProc;
      done();
    });
  });

  describe('when a new file is added to the current directory', function() {

    it('should run both commands and log their output', function(done) {

      helper.testStream(eyeProcess, ['task','option'], function() {
        done();
      });

      fs.writeFileSync('temp', 0);
    });
  });
});

describe('specifying custom glob patterns', function() {

  describe('single glob pattern', function() {

    beforeEach(function (done) {
      fs.writeFileSync('temp.foo', 'new');
      fs.writeFileSync('temp.bar', 'new');
      helper.spawnEye(['node', 'task.js', '--*glob=*.foo'], function(eyeProc) {
        eyeProcess = eyeProc;
        done();
      });
    });

    describe('when a file that doesn\'t match the glob is modified', function() {

      it('shouldn\'t run the command', function(done) {

        fs.writeFileSync('./temp.bar', 'new');

        helper.testStream(eyeProcess, [''], function() {
          done(new Error('shouldn\'t have fired'));
        });

        // Change unmatched file and wait to ensure task isn't run
        fs.writeFile('temp.bar', 'changed', function() {
          setTimeout(function() {
            fs.unlinkSync('temp.bar');
            done();
          }, 1000);
        });
      });
    });

    describe('when a file that matches the glob is modified', function() {

      it('should run the command', function(done) {

        helper.testStream(eyeProcess, ['task'], function() {
          done();
        });

        fs.writeFileSync('temp2.foo', 1);
      });
    });
  });

  describe('multi glob pattern', function() {

    beforeEach(function (done) {
      fs.writeFileSync('temp.foo', 'new');
      fs.writeFileSync('temp.cat', 'new');
      helper.spawnEye(['node', 'task.js', '--*glob=*.foo,*.cat'], function(eyeProc) {
        eyeProcess = eyeProc;
        done();
      });
    });

    describe('when a file that matches the first glob pattern is modified', function() {

      it('should run the command', function(done) {

        helper.testStream(eyeProcess, ['task'], function() {
          done();
        });

        fs.writeFileSync('temp.foo', 'changed');
      });
    });

    describe('when a file that matches the second glob pattern is modified', function() {

      it('should run the command', function(done) {

        helper.testStream(eyeProcess, ['task'], function() {
          done();
        });

        fs.writeFileSync('temp.cat', 'changed');
      });
    });
  });

  describe('glob exclude pattern', function() {

    beforeEach(function (done) {
      fs.writeFileSync('temp.foo', 'start');
      fs.writeFileSync('temp.cat', 'start');
      helper.spawnEye(['node', 'task.js', '--*glob=%*.foo,*'], function(eyeProc) {
        eyeProcess = eyeProc;
        done();
      });
    });

    describe('when a file that matches the exclusion glob is modified', function() {

      it('shouldn\'t run the command', function(done) {

        helper.testStream(eyeProcess, [''], function() {
          done(new Error('shouldn\'t have fired'));
        });

        // Change excluded file and wait to ensure task isn't run
        fs.writeFile('temp.foo', 'changed', function() {
          setTimeout(function() {
            fs.unlinkSync('temp.foo');
            done();
          }, 1000);
        });
      });
    });

    describe('when a file that doesn\'t match the  exclusion glob is modified', function() {

      it('should run the command', function(done) {

        helper.testStream(eyeProcess, ['task'], function() {
          done();
        });

        fs.writeFileSync('temp.bar', 'changed');
      });
    });
  });
});
