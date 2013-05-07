var spawn = require('child_process').spawn;
var gaze = require('gaze');

// The process where the commands are being run
var cmdProcess;
var queue = [];
var running = false;

// Default options
var options = {
  verbose: false,
  interrupt: true,
  useQueue: false,
  pattern: ['**/*', '!**/node_modules/**']
};

module.exports = function (argv) {

  // Get rid of 'node' and 'bin' arguments
   argv = argv.slice(2);

   if (argv.length === 0) {
    console.log('Usage: eye <command>');
    console.log('');
    console.log('Options:');
    console.log('');
    console.log('  --*glob=<pattern> Specify which files you want to watch');
    console.log('');
    console.log('  --*queue          Have commands form a queue and be run one at a time until the queue is empty');
    console.log('');
    console.log('  --*continue       If a file event is triggered while a command is being run, don\'t interrupt it');
    console.log('');
    console.log('  --*verbose        Log files watched, text of the comand being run and more');
    process.exit(1);
   }

  // Add all of the arguments to the commandArguments array unelss they are eye
  // options
  var commandArguments = [];
  for (var i = 0; i <argv.length; i++) {
    var argument = argv[i];

    if (argument.indexOf('--*glob=') !== -1) {
      // Get everything after '=' and replace '%' with '!' because Unix
      // exectutes everything after '!' so we can't use it. And finally split
      // at comma to get an array of globs
      options.pattern = argument.split('=')[1].split('%').join('!').split(',');

    } else if (argument.indexOf('--*verbose') !== -1) {
      options.verbose = true;

    } else if (argument.indexOf('--*queue') !== -1) {
      options.useQueue = true;

    } else if (argument.indexOf('--*continue') !== -1) {
      options.interrupt = false;

    } else {
      commandArguments.push(argument);
    }
  }

  var commands = processArguments(commandArguments, []);

  if (options.verbose) {
    console.log('pattern is:');
    console.log(options.pattern);
  }

  // Watch file selected by glob for changes
  gaze(options.pattern, function(err) {

    if (err) throw err;

    // Log startup message
    console.log('eye is watching...');

    // Log watched files
    if (options.verbose) {
      console.log('watched files:');
      console.log(this.watched());
    }

    this.on('error', function(err) {
      throw err;
    });

    this.on('all', function(event, filepath) {

      // Log file event
      if (options.verbose) console.log(filepath + ' was ' + event);

      if (options.useQueue) {
        // Add commands to queue
        queue = queue.concat(commands);
      } else if (! queue.length) {
        queue = [].concat(commands);
      }

      // If queue isn't being run, run it
      if (! running) {

        runCommands(commands);
      // If commands are in the process of running
      } else if (options.interrupt && cmdProcess) {
        // The closing of the command process will remove the first queue item
        // so we add and empty queue item so it won't remove the next command
        if (! options.queue) queue.unshift('');

        cmdProcess.kill();
      }
    });
  });
};

function runCommands (commands) {
  running = true;

  // Run the first command in the queue
  var command = queue[0];

  if (options.verbose) {
    console.log('running: ' + command.cmd + ' ' + command.options.join(' '));
    console.log('result:');
  }

  cmdProcess = spawn(command.cmd, command.options);

  cmdProcess.stdout.on('data', function (data) {
    process.stdout.write('' + data);
  });

  cmdProcess.stderr.on('data', function (data) {
    process.stdout.write('' + data);
  });

  cmdProcess.on('close', function () {
    // Remove executed command from queue
    queue.shift();
    // If there are more commands in the queue, recurse
    if (queue.length > 0) runCommands(commands);
    running = false;
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
