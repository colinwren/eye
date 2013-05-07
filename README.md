#eye [![Build Status](https://travis-ci.org/colinwren/eye.png?branch=master)](https://travis-ci.org/colinwren/eye)
> Tiny command line tool for running a command whenever files change.

###Installation
```
npm install -g eye
```
##Getting Started

####Basic usage

eye watches files in the current directory that match a glob pattern such as ```**/*.js``` and when one of these files change, eye will run the command you passed to it.

After you have install eye, go to a directory with < 50 files (so you don't create ridiculous amounts of listeners) and run:

```
eye date
```

eye will watch all files that match the default glob ```'**/*', '!**/node_modules/**'```  and when any of those files change, it will run ```date``` and log the output:
```
Wed Apr 10 18:36:36 PDT 2013
```

####Features
eye supports multiple commands and options for those commands such as ```--short``` and ```-v```

Running:
```
eye git status --short and git add . -v
```
Will watch files that match the default glob and run ```git status --short``` and then ```git add . -v```. Notice that I used ```and``` instead of ```&&```, this is because Unix uses ```&&``` and so we have to use ```and```.

##Options

All of the options are preceded with ```--*``` so they don't conflict with any of the options for the commands you run.
###Custom Glob
The ```--*glob=``` option lets you use custom globs to specify the files you want to watch. eye uses [minimatch](https://github.com/isaacs/minimatch) for file globbing.

This will watch all ```.json``` files in the current directory and any child directories:

```
eye --*glob=**/*.json ls
```

Here is an example with two globs, it matches all ```.json``` files that are not in the ```node_modules``` directory:

```
eye --*glob=**/*.json,%**/node_modules/** npm test
```


Note that I am using the ```%``` character in place of ```!```, this is because [Unix uses it](http://www.ssec.wisc.edu/mcidas/doc/users_guide/2011.1/exclamation.html) and so we have to use ```%``` in the terminal and convert it to ```!```.

####Continue
Use the ```--*continue``` option to run commands without interuption.

By default, if eye is running a command and a file event occurs, eye will interrupt it and rerun the command. With this option, if a file event is triggered while a command is being run, the running command process won't be interrupted.

####Queuing
Use the ```--*queue``` option to have commands form a queue and be run one at a time until the queue is empty.

With this option, if eye is running a command and there are additional file change events, commands will be added to the queue. Once the initial command is finished, eye will execute the commands in the queue one by one until it has been emptied.

###Verbose
Use the ```--*verbose``` option to log useful information. This command:

```eye --*verbose --*glob=index.js,*.json ls -a```

Will log:

```
pattern is:
[ 'index.js', '*.json' ]
watched files:
{ '/Users/colinwren/Projects/eye/':
   [ '/Users/colinwren/Projects/eye/index.js',
     '/Users/colinwren/Projects/eye/package.json' ] }
```

And when a file changes, the command will run and log:
```
running: ls -a
result:
.
..
.git
.gitignore
LICENSE-MIT
bin
index.js
node_modules
package.json
```
