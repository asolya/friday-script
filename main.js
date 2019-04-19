const fs = require('fs');
const lexer = require('./lexer');

let content;
// First I want to read the file
fs.readFile('./test.frs', function read(err, data) {
    if (err) {
        throw err;
    }
    content = data;

    const lexems = lexer(content.toString());  
    console.log(lexems);
});