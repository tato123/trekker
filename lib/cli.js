'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.execute = execute;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description
 * Extreemly naive implementation of a CLI for handling this
 */
function execute(rt) {

    var intersect = function intersect(files) {
        var results = rt.search(files[0]);
        var results2 = rt.search(files[1]);
        console.log(results.root.intersect(results2.root));
    };

    var print = function print(files) {
        var results = rt.search(files[0]);
        results.root.print();
    };

    var parseCLI = function parseCLI() {
        _commander2.default.version('0.0.1').usage('[options] <file ...>').option('-i, --intersect <file1> <file2>', 'Print out the intersection of two nodejs files', intersect).option('-p, --print <file1>', 'Print out the require tree of a nodejs file', print).parse(process.argv);
    };

    // parse out our values
    parseCLI();
}