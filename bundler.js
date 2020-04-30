/*
    This file is used for reading the contents of the file
    using a native node module 'fs'
*/
const fs = require('fs')
const babylon = require('babylon')
const traverse = require('babel-traverse').default;
const path = require('path')
const babel = require('babel-core')

// Counter for assets
let ID = 0;

function createAsset(filename){

    // Reads contents of file as a string
    const content = fs.readFileSync(filename, 'utf-8')

    // Generate AST by calling parse.
    // Accepts content of file
    // Explicity mention source type as module
    // Required when using 'import' and 'export'
    const ast = babylon.parse(content, {
        sourceType: 'module'
    });

    // Dependency array from traversing files
    const dependencies = [];

    // Traverse tree and push node type of 
    // import declaration dependencies to 
    // dependency array
    traverse(ast, {
        ImportDeclaration: ({node}) => {
            dependencies.push(node.source.value);
        },
    });

    // Unique identifier for each asset
    // found in Abstract state tree
    const id = ID++;

    // Get code from assets, and transform to universal
    // understood syntax on all browsers
    // Presets is a set of rules on how to transform the code
    const {code} = babel.transformFromAst(ast, null, {
        presets: ['env'],
    });

    // Return object with information about 
    // asset 
    return {
        id, 
        filename,
        dependencies,
        code
    };
}

// Get AST graph by taking entry path
// parsing it, and go over each of its
// dependencies 
function createGraph(entry) {
    const mainAsset = createAsset(entry);
    const queue = [mainAsset];

    // Every item in queue, go over it
    // and parse each of it's dependecies
    // and then add those to the queue
    // keep going until queue is empty
    for(const asset of queue){
        // Turn asset path from relative to absolute
        const dirname = path.dirname(asset.filename);

        asset.mapping = {};

        // For each dependency, get the absolute path
        // from relative path. Call the create asset function
        // on each child
        asset.dependencies.forEach(relativePath => {
            const absolutePath = path.join(dirname, relativePath);

            const child = createAsset(absolutePath);
            
            // Relationship between dependencies 
            // An object with key of relative path
            // and value of its id, to better 
            // show which other object of the dependency
            // array it is related to
            asset.mapping[relativePath] = child.id;

            queue.push(child);
        });
    }

    return queue;
}

// Turn the graph into a bundle
function bundle(graph){
    let modules = '';

    // Use transpiler to convert syntax
    // to universal language understood by all
    // browsers (babel)
    graph.forEach(mod => {
        modules += `${mod.id}:[
            function(require, module, exports){
                ${mod.code}
            },

        ],`;
    });
    
    // Bundle represented as large string, 
    // self-invoking function that creates object
    // that represents every module in the application
    const result = `
        (function() {

        })({${modules}})
    `;

    return result;
}

const graph = createGraph('./example/entry.js')
const result = bundle(graph)

console.log(result)