import fs from 'fs'
import path from 'path'
import colors from 'colors'
import archy from './archy';

export const RESOURCE_TYPE = {
    npm:'npm', 
    local: 'local', 
    json: 'json'
};

/**
 * @class RequireTree
 * @description
 * Provides a model representation of 
 * the require tree as its being built out
 */
export class RequireTree {

    // default constructor with a memoize instance
    constructor(options = {}) {
        
    }

    /**
     * @name search
     * @description
     * Searches throughout a node and attempts to analyze and
     * visit all child require statements
     * 
     * @return {RNode} node
     */
    search( rootFile ) {
        
        if ( typeof(rootFile) === 'undefined' ) {
            return null;
        }
        
        const memoize = {};
        const root = new RNode(rootFile,0);
        
        let stats = {
            maxDepth: 0
        };
        
        const recurseSearch = (node, visited = [], depth=0) => {
            
            stats.maxDepth = Math.max(stats.maxDepth, depth);
            
            this.analyzeType(node);
            const {val} = node
            
            // memoize to deal with circular dependencies
            if (typeof (val) !== 'undefined' && memoize[val]) {
                return;
            }
            memoize[val] = true;
                        
            if (node.type !== RESOURCE_TYPE.local) {
                return;
            }
            
            // analyze local resources 
            let requires = this.getRequireStatements(val, visited);
            node.addCollection(requires,depth+1);
            for (let i = 0; i < requires.length; ++i) {
                recurseSearch(node.children[i], [...visited, path.dirname(val)], depth + 1);
            }
        }
        
        recurseSearch(root);
        return {
            root,
            stats
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
    analyzeType(node) {
        if ( !this.isLocalType(node.val) ) {
            return (node.type = RESOURCE_TYPE.npm);
        }
        if (node.val.indexOf('json') !== -1) {
            return (node.type = RESOURCE_TYPE.json);
        }
        return (node.type = RESOURCE_TYPE.local)
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
    isLocalType(fileName) {
        return Array.isArray(fileName.match(/^\.{1,2}/)) || (fileName.indexOf('/') !== -1);
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
    getRequireStatements(file, dir) {
        const JS_TYPE = '.js'

        if (file.indexOf('json') !== -1) {
            return [];
        }

        if (file.lastIndexOf('.js') === -1) {
            file = `${file}${JS_TYPE}`;
        }

        const re = /require\(['"](.*)['"]\)/ig;
        const encoding = 'utf8';

        try {
            var content = fs.readFileSync(path.resolve(...dir, file));
            let output = []
            var match;
            while ((match = re.exec(content)) !== null) {
                output.push(match[1]);
            }
            return output;
        }
        catch (error) {
            // missing file
        }
        return [];

    }
        
}

/**
 * @class RNode
 * @description
 * Represents a standard non-binary tree structure
 */
export class RNode {

    // default constructor
    constructor(val, depth=0, type=RESOURCE_TYPE.local) {
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
    add( node ) {
        this.children.push(node)
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
    intersect( rNode ) {
        
        let myKeys = this.getFileNames(),
            rKeys = rNode.getFileNames(),
            intersect = [];
                        
        for (var key in myKeys) {
            if ( rKeys.hasOwnProperty(key)) {
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
    getFileNames() {
       let names = {};
       let dfs = [this];
       while (dfs.length) {
           let {val, children} = dfs.pop();
           names[val] = val;
           dfs = [...dfs, ...children];
       } 
       return names;
    }

    /**
     * @name print
     * @description
     * Prints out the values in a tree like structure
     */
    print(fmt) {
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
        let s = archy(this);
        console.log(s);     
    }
    
    addCollection(col, depth=0) {
        col.forEach(val=> this.add(new RNode(val,depth)) );
    }
}

// execute the command line if we aren't the module 
// parent
if (!module.parent) {
    (require('./cli')).execute(new RequireTree());        
}
