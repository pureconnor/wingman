const fs = require('fs')
/*
    This file is used for reading the contents of the file
    using a native node module 'fs'
*/

function createAsset(filename){
    // Reads contents of file as a string
    const content = fs.readFileSync(filename, 'utf-8')

    console.log(content)
}

createAsset('./example/entry.js');