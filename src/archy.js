// fork of https://github.com/substack/node-archy
// es-6 ified and added some necessary functionally to implement print formatting
// k&r format for readibility


export default function archy(obj, prefix = '', opts = {}) {
    const chr = (s) => {
        let chars = {
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

    let children = obj.children || [];
    let lines = (obj.val || '').split('\n');
    let splitter = '\n' + prefix + (children.length ? chr('│') : ' ') + ' ';

    return prefix
        + lines.join(splitter) + '\n'
        + children.map((node, ix) =>{
            let last = ix === children.length - 1;
            let more = node.children && node.children.length;
            let prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

            return prefix
                + (last ? chr('└') : chr('├')) + chr('─')
                + (more ? chr('┬') : chr('─')) + ' '
                + archy(node, prefix_, opts).slice(prefix.length + 2)
                ;
        }).join(''); 
};
