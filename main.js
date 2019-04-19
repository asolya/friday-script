const fs = require("fs");
const lexer = require("./lexer");
const parser = require("./parser");

let content;
// First I want to read the file
fs.readFile("./test.frs", function read(err, data) {
  if (err) {
    throw err;
  }
  content = data;

  const lexems = lexer(content.toString());
  console.log("Lexems", lexems);
  const [status, ast, rest] = parser(lexems);
  console.log("Status: ", status);
  console.log("AST: ", ast);
  console.log("Rest: ", rest);
});
