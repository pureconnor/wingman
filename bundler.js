const fs = require('fs')
const babylon = require('babylon')
/*
    This file is used for reading the contents of the file
    using a native node module 'fs'
*/

function createAsset(filename){
    // Reads contents of file as a string
    const content = fs.readFileSync(filename, 'utf-8')

    const ast = babylon.parse(content, {
        sourceType: 'module'
    });
    
    console.log(ast)
}

createAsset('./example/entry.js');