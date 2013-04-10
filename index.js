var spawn = require('child_process').spawn;
var gaze = require('gaze');
var queue = [];
var verbose = false;

module.exports = function (argv) {

  // Default glob
  var pattern = ['**/*', '!**/node_modules/**'];

  // If any eye options are specifed, use them and take them out aof argv array
  for (var i = 0; i <argv.length; i++) {
    if (argv[i].indexOf('--*glob=') !== -1) {
      pattern = argv[i].split('=')[1];
      argv.splice(i, 1);
    } else if (argv[i].indexOf('--*verbose') !== -1) {
      verbose = true;
      argv.splice(i, 1);
    }
  }

  var commands = processArguments(argv.slice(2), []);

  // Watch file selected by glob for changes
  gaze(pattern, function(err) {

    if (err) throw err;

    // Log watched files
    if (verbose) console.log(this.watched());

    this.on('all', function(filepath) {

      // Log changed file
      if (verbose)  console.log(filepath);

      // Add commands to queue
      queue = queue.concat(commands);

      // if queue isn't being run, run it
      if (queue.length === commands.length) {
        runCommands(commands);
      }
    });
  });
};

function runCommands (commands) {

  // Run the first command in the queue
  var command = queue[0];

  if (verbose) console.log('running' + JSON.stringify(command));

  var cmdProcess = spawn(command.cmd, command.options);

  cmdProcess.stdout.on('data', function (data) {
    console.log('' + data);
  });

  cmdProcess.stderr.on('data', function (data) {
    console.log('' + data);
  });

  cmdProcess.on('close', function () {
    // Remove executed command from queue
    queue.shift();
    // If there are more commands in the queue, recurse
    if (queue.length > 0) runCommands(commands);
  });
}

function processArguments (argv, commands) {

  // Create command, first argument is the command and the rest are options
  var command = {
    cmd: argv.splice(0, 1)[0],
    options: []
   };

  // Add arguemnts as options. If argument is 'and', add current command to
  // commands array and recurse to get next command
  for (var i = 0; i < argv.length; i++) {
    if (argv[i] !== 'and') {
      command.options.push(argv[i]);
    } else {
      commands.push(command);
      return processArguments(argv.slice(i + 1), commands);
    }
  }

  commands.push(command);
  return commands;
}
