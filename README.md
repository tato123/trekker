# Overview

Trekker is a static analysis tool for analyzing required / imported files within a nodejs project for given files. Currently trekker traverses 
all dependencies and statically analyzes all require statements. Trekker can serialize those dependencies, determine intersections between
two files and print all required files. As trekker continues to grow it will provide tools to determine file coupling, import complexity, and
more. 

Trekker will be written as an extensible tool, rather than trying to provide all functionality directly within trekker, the main project
will handle graphing relationships and then allowing middleware to execute analysis on relationships

### Caveat

Trekker is still in development, please feel free to leave any comments, suggestions, or issues on how to improve the project in the Github project
issues.

# Running Trekker 

Running from Github as a command line tool

``` javascript
npm run compile
node lib/index ...commands go here...
```

Including trekker within your project

``` javascript
import trekker from 'trekker'

var trekker = require('trekker'); 
```

#Copyright

Copyright © 2016

#License

trekker is under MIT license - http://www.opensource.org/licenses/mit-license.php

