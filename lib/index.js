'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RNode = exports.RequireTree = exports.RESOURCE_TYPE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _archy = require('./archy');

var _archy2 = _interopRequireDefault(_archy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RESOURCE_TYPE = exports.RESOURCE_TYPE = {
    npm: 'npm',
    local: 'local',
    json: 'json'
};

/**
 * @class RequireTree
 * @description
 * Provides a model representation of 
 * the require tree as its being built out
 */

var RequireTree = exports.RequireTree = function () {

    // default constructor with a memoize instance

    function RequireTree() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, RequireTree);
    }

    /**
     * @name search
     * @description
     * Searches throughout a node and attempts to analyze and
     * visit all child require statements
     * 
     * @return {RNode} node
     */


    _createClass(RequireTree, [{
        key: 'search',
        value: function search(rootFile) {
            var _this = this;

            if (typeof rootFile === 'undefined') {
                return null;
            }

            var memoize = {};
            var root = new RNode(rootFile, 0);

            var stats = {
                maxDepth: 0
            };

            var recurseSearch = function recurseSearch(node) {
                var visited = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
                var depth = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];


                stats.maxDepth = Math.max(stats.maxDepth, depth);

                _this.analyzeType(node);
                var val = node.val;

                // memoize to deal with circular dependencies

                if (typeof val !== 'undefined' && memoize[val]) {
                    return;
                }
                memoize[val] = true;

                if (node.type !== RESOURCE_TYPE.local) {
                    return;
                }

                // analyze local resources
                var requires = _this.getRequireStatements(val, visited);
                node.addCollection(requires, depth + 1);
                for (var i = 0; i < requires.length; ++i) {
                    recurseSearch(node.children[i], [].concat(_toConsumableArray(visited), [_path2.default.dirname(val)]), depth + 1);
                }
            };

            recurseSearch(root);
            return {
                root: root,
                stats: stats
            };
        }

        /**
         * @name analyzeType
         * @description
         * Naively analyzes the file types based on location
         * and file extension
         * 
         * @param {RNode} node
         */

    }, {
        key: 'analyzeType',
        value: function analyzeType(node) {
            if (!this.isLocalType(node.val)) {
                return node.type = RESOURCE_TYPE.npm;
            }
            if (node.val.indexOf('json') !== -1) {
                return node.type = RESOURCE_TYPE.json;
            }
            return node.type = RESOURCE_TYPE.local;
        }

        /**
         * @name isLocalType
         * @description
         * Checks if it's a local type, avoids traversing
         * npm module types
         * 
         * @param {String} fileName
         * @return {boolean}
         */

    }, {
        key: 'isLocalType',
        value: function isLocalType(fileName) {
            return Array.isArray(fileName.match(/^\.{1,2}/)) || fileName.indexOf('/') !== -1;
        }

        /**
         * @name getRequireStatements
         * @description
         * Pulls the require statements from the current file
         * without actually requiring anything
         * 
         * @param {String} file filename
         * @return {Array}
         */

    }, {
        key: 'getRequireStatements',
        value: function getRequireStatements(file, dir) {
            var JS_TYPE = '.js';

            if (file.indexOf('json') !== -1) {
                return [];
            }

            if (file.lastIndexOf('.js') === -1) {
                file = '' + file + JS_TYPE;
            }

            var re = /require\(['"](.*)['"]\)/ig;
            var encoding = 'utf8';

            try {
                var content = _fs2.default.readFileSync(_path2.default.resolve.apply(_path2.default, _toConsumableArray(dir).concat([file])));
                var output = [];
                var match;
                while ((match = re.exec(content)) !== null) {
                    output.push(match[1]);
                }
                return output;
            } catch (error) {
                // missing file
            }
            return [];
        }
    }]);

    return RequireTree;
}();

/**
 * @class RNode
 * @description
 * Represents a standard non-binary tree structure
 */


var RNode = exports.RNode = function () {

    // default constructor

    function RNode(val) {
        var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var type = arguments.length <= 2 || arguments[2] === undefined ? RESOURCE_TYPE.local : arguments[2];

        _classCallCheck(this, RNode);

        this.val = val;
        this.depth = depth;
        this.type = type;
        this.children = [];
    }

    /**
     * @name add
     * @description
     * Wraps the child push method, primarily just adds an abstraction
     * on top of children 
     * 
     * @param {RNode} node
     * @return none
     */


    _createClass(RNode, [{
        key: 'add',
        value: function add(node) {
            this.children.push(node);
        }

        /**
         * @name intersect
         * @description
         * Checks for an intersection between two nodes, the algorithm
         * is pretty naive, gets all unique label values and checks if 
         * there is an overlap.
         * 
         * @param {RNode} node
         * @return {Array} returns an array of all files that intersect
         */

    }, {
        key: 'intersect',
        value: function intersect(rNode) {

            var myKeys = this.getFileNames(),
                rKeys = rNode.getFileNames(),
                intersect = [];

            for (var key in myKeys) {
                if (rKeys.hasOwnProperty(key)) {
                    intersect.push(key);
                }
            }

            return intersect;
        }

        /**
         * @name getFileNames
         * @description
         * Gets all the file names within this particular
         * object
         * 
         * @return {Object}
         */

    }, {
        key: 'getFileNames',
        value: function getFileNames() {
            var names = {};
            var dfs = [this];
            while (dfs.length) {
                var _dfs$pop = dfs.pop();

                var val = _dfs$pop.val;
                var children = _dfs$pop.children;

                names[val] = val;
                dfs = [].concat(_toConsumableArray(dfs), _toConsumableArray(children));
            }
            return names;
        }

        /**
         * @name print
         * @description
         * Prints out the values in a tree like structure
         */

    }, {
        key: 'print',
        value: function print(fmt) {
            /*
            let spaces = '';
            for (let j=0; j<this.depth; j++) {
                spaces += '  ';
            }
            
            switch (this.type) {
                case RESOURCE_TYPE.npm:
                    console.log(`${spaces}${this.val}`.yellow);
                    break;
                case RESOURCE_TYPE.json:
                    console.log(`${spaces}${this.val}`.blue);
                    break;
                default:                
                    console.log(`${spaces}${this.val}`);
            }
            
            this.children.forEach(node=>node.print()); */
            var s = (0, _archy2.default)(this);
            console.log(s);
        }
    }, {
        key: 'addCollection',
        value: function addCollection(col) {
            var _this2 = this;

            var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

            col.forEach(function (val) {
                return _this2.add(new RNode(val, depth));
            });
        }
    }]);

    return RNode;
}();

// execute the command line if we aren't the module
// parent


if (!module.parent) {
    require('./cli').execute(new RequireTree());
}