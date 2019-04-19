const fs = require("fs");
const lexer = require("./lexer");
const parser = require("./parser");
const interpreter = require("./interpreter");

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
  console.log("--------------------------------");

  interpreter(ast);
});
