/*
    This file is used for reading the contents of the file
    using a native node module 'fs'
*/
const fs = require('fs')
const babylon = require('babylon')
const traverse = require('babel-traverse').default;

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

    // Return object with information about 
    // asset 
    return {
        id, 
        filename,
        dependencies
    };

}

const mainAsset = createAsset('./example/entry.js');

console.log(mainAsset);