var spawn = require('child_process').spawn;
var gaze = require('gaze');
var queue = [];
var verbose = false;

module.exports = function (argv) {

  // Default glob
  var pattern = ['**/*', '!**/node_modules/**'];

  // Get rid of node and bin arguments
   argv = argv.slice(2);

  // If any eye options are specifed, use them and take them out of argv array
  // Arguments stripped of eye options
  var commandArguments = [];
  for (var i = 0; i <argv.length; i++) {
    var argument = argv[i];

    if (argument.indexOf('--*glob=') !== -1) {
      // Get everything after '=' and replace '%' with '!' because Unix
      // exectutes everything after '!' so we can't use it. And finally split
      // at comma to get an array of globs
      pattern = argument.split('=')[1].split('%').join('!').split(',');
      continue;

    } else if (argument.indexOf('--*verbose') !== -1) {
      verbose = true;
      continue;
    }

    commandArguments.push(argument);
  }

  var commands = processArguments(commandArguments, []);
    if (verbose){
      console.log('pattern is:');
      console.log(pattern);
    }

  // Watch file selected by glob for changes
  gaze(pattern, function(err) {

    if (err) throw err;

    // Log watched files
    if (verbose) {
      console.log('watched files:');
      console.log(this.watched());
    }

    this.on('all', function(event, filepath) {

      // Log changed file
      if (verbose) console.log(filepath + ' was ' + event);

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

  if (verbose) {
    console.log('running: ' + command.cmd + ' ' + command.options.join(' '));
    console.log('result:');
  }

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