'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = archy;
// fork of https://github.com/substack/node-archy
// es-6 ified and added some necessary functionally to implement print formatting
// k&r format for readibility

function archy(obj) {
    var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var chr = function chr(s) {
        var chars = {
            '│': '|',
            '└': '`',
            '├': '+',
            '─': '-',
            '┬': '-'
        };
        return opts.unicode === false ? chars[s] : s;
    };

    if (typeof obj === 'string') {
        obj = { val: obj };
    }

    var children = obj.children || [];
    var lines = (obj.val || '').split('\n');
    var splitter = '\n' + prefix + (children.length ? chr('│') : ' ') + ' ';

    return prefix + lines.join(splitter) + '\n' + children.map(function (node, ix) {
        var last = ix === children.length - 1;
        var more = node.children && node.children.length;
        var prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

        return prefix + (last ? chr('└') : chr('├')) + chr('─') + (more ? chr('┬') : chr('─')) + ' ' + archy(node, prefix_, opts).slice(prefix.length + 2);
    }).join('');
};