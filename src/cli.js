import program from 'commander';



/**
 * @description
 * Extreemly naive implementation of a CLI for handling this
 */
export function execute(rt) {
                
    const intersect = (files) => {
        let results = rt.search(files[0]);        
        let results2 = rt.search(files[1]);
        console.log(results.root.intersect(results2.root));
    };
    
    const print = (files) => {
        let results = rt.search(files[0]); 
        results.root.print();
    }

    const parseCLI = () => {
        program
            .version('0.0.1')
            .usage('[options] <file ...>')
            .option('-i, --intersect <file1> <file2>', 'Print out the intersection of two nodejs files', intersect)
            .option('-p, --print <file1>', 'Print out the require tree of a nodejs file', print)        
            .parse(process.argv);
    };
    
    // parse out our values
    parseCLI();            
}
