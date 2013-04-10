#eye
> Tiny command line tool for running a command whenever file changes.

###Installation
```
npm install -g eye
```
##Getting Started

Eye watches files specified by a glob pattern such as ```**/*.js``` and runs the provided command whenever one of those files changes.

After you have install eye, move to a directory with < 50 files ( so you don't create ridiculous amounts of listeners) and run:

```
eye ls
``` 

Eye will watch all files that match the default glob ```'**/*', '!**/node_modules/**'```  and run ``` npm test ``` when any of the matching files change.

##Options

All of the options are preceded with ```--*``` so they don't conflict with any command options you might be running.
###Custom Glob
Use the ```--*glob=``` option to use custom globs to specify the files you want to watch. The globs are matched using [minimatch](https://github.com/isaacs/minimatch).

This will watch all ```.json``` files in the current directory and any child directories:

```
eye ls --*glob=**/*.json
``` 

Here is an example with two globs, it matches all ```.json``` files that are not in the ```node_modules``` directory:

```eye ls --*glob=**/*.json,%**/node_modules/**```

 
Note that I am using the ```%``` character in place of ```!```, this is because [Unix uses it](http://www.ssec.wisc.edu/mcidas/doc/users_guide/2011.1/exclamation.html) and so we have to use ```%``` in the terminal and convert it to ```!```.

###Verbose
Use the ```--*verbose``` option to have eye log useful information.

```eye --*verbose --*glob=index.js,*.json ls -a```

Will log:

```
pattern is:
[ 'index.js', '*.json' ]
```
```
watched files:
{ '/Users/colinwren/Projects/eye/':
   [ '/Users/colinwren/Projects/eye/index.js',
     '/Users/colinwren/Projects/eye/package.json' ] }
```

And when a file changes and the command runs it will log:
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

