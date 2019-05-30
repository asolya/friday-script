function parser(lexems) {
  return parseStatementList(lexems);
}

function parseStatementList(lexems) {
  const list = [];

  while (lexems.length > 0) {
    // status is boolean
    let [status, statement, rest] = parseStatement(lexems);
    if (!status) {
      break;
    }
    lexems = rest;
    list.push(statement);
  }
  return [true, { type: "statement_list", list }, lexems];
}

function parseStatement(lexems) {
  if (lexems[0].type === "var") {
    if (lexems[1].type !== "id") {
      throw new Error(`Expected id: ${lexems}`);
    }

    if (lexems[2].type !== "equal") {
      throw new Error(`Expected equal sign: ${lexems}`);
    }

    const [status, value, rest] = parseValue(lexems.slice(3));

    if (!status) {
      throw new Error(`Expected value: ${lexems}`);
    }

    if (rest[0].type !== "semicolon") {
      throw new Error(
        `Expected semicolon after var declaration, got: ${lexems}`
      );
    }
    return [
      true,
      { type: "variable_declaration", name: lexems[1].value, value },
      rest.slice(1)
    ];
  }

  if (lexems[0].type === "open_brace") {
    return parseCombinatorBracket(
      lexems,
      "open_brace",
      "close_brace",
      parseStatementList
    );
  }

  if (lexems[0].type === "while") {
    let [status, condition, rest] = parseCombinatorBracket(
      lexems.slice(1),
      "open_bracket",
      "close_bracket",
      parseValue
    );

    let whileStatement;
    [status, whileStatement, rest] = parseStatement(rest);
    if (!status) {
      throw new Error(
        `Error in parsing while statement: ${JSON.stringify(rest)}`
      );
    }

    return [
      true,
      {
        type: "while",
        condition,
        statement: whileStatement
      },
      rest
    ];
  }

  if (lexems[0].type === "if") {
    let [status, condition, rest] = parseCombinatorBracket(
      lexems.slice(1),
      "open_bracket",
      "close_bracket",
      parseValue
    );

    let ifStatement;
    [status, ifStatement, lexems] = parseStatement(rest);
    if (!status) {
      throw new Error(
        `Error in parsing if statement: ${JSON.stringify(lexems)}`
      );
    }

    const ifAST = {
      type: "if",
      condition,
      thenStatement: ifStatement,
      elseStatement: undefined
    };
    if (rest[0].type == "else") {
      const [status, elseStatement, rest] = parseStatement(lexems.slice(1));
      if (!status) {
        throw new Error(
          `Error in parsing if statement: ${JSON.stringify(rest)}`
        );
      }

      ifAST.elseStatement = elseStatement;
      lexems = rest;
    }

    return [true, ifAST, lexems];
  }

  if (lexems[0].type === "return") {
    const [status, value, rest] = parseValue(lexems.slice(1));
    if (!status) {
      throw new Error(
        `Error in parsing while statement: ${JSON.stringify(rest)}`
      );
    }

    if (rest[0].type !== "semicolon") {
      throw new Error(
        `Expected semicolon after var declaration, got: ${lexems}`
      );
    }
    return [
      true,
      {
        type: "return",
        value
      },
      rest.slice(1)
    ];
  }

  // Value
  {
    const [status, value, rest] = parseValue(lexems);
    if (!status) {
      return [false, {}, lexems];
    }

    if (rest[0].type !== "semicolon") {
      throw new Error(
        `Expected semicolon after var declaration, got: ${lexems}`
      );
    }
    return [true, value, rest.slice(1)];
  }
}

function parseValue(lexems) {
  if (lexems[0].type === "num") {
    return [true, { type: "num", value: lexems[0].value }, lexems.slice(1)];
  }
  // function call
  if (lexems[0].type === "id" && lexems[1].type === "open_bracket") {
    const value = {
      type: "call",
      func: lexems[0].value,
      params: []
    };

    lexems = lexems.slice(2);
    while (true) {
      const [status, param, rest] = parseValue(lexems);
      if (!status) {
        break;
      }

      value.params.push(param);

      if (rest[0].type !== "comma") {
        lexems = rest;
        break;
      }

      lexems = rest.slice(1);
    }

    if (lexems[0].type !== "close_bracket") {
      throw new Error(`Expected close bracket: ${JSON.stringify(lexems)}`);
    }

    lexems = lexems.slice(1);
    return [true, value, lexems];
  }

  // variable assignment
  if (lexems[0].type === "id" && lexems[1].type === "equal") {
    const value = {
      type: "variable_assigment",
      name: lexems[0].value
    };
    const [status, param, rest] = parseValue(lexems.slice(2));
    if (!status) {
      throw new Error(`Expected value: ${JSON.stringify(lexems)}`);
    }
    value.value = param;
    return [true, value, rest];
  }

  if (lexems[0].type === "id") {
    return [true, { type: "id", value: lexems[0].value }, lexems.slice(1)];
  }

  if (lexems[0].type === "function") {
    lexems = lexems.slice(1);
    let [status, args, rest] = parseCombinatorBracket(
      lexems,
      "open_bracket",
      "close_bracket",
      lexems =>
        parseCombinatorList(lexems, "comma", lexems => {
          if (lexems[0].type !== "id") {
            return [false, undefined, undefined];
          }
          return [true, lexems[0].value, lexems.slice(1)];
        })
    );

    if (!status) {
      throw new Error(
        `Failed to parse function prototype: ${JSON.stringify(lexems)}`
      );
    }

    let body;
    [status, body, rest] = parseCombinatorBracket(
      rest,
      "open_brace",
      "close_brace",
      parseStatementList
    );
    if (!status) {
      throw new Error(
        `Failed to parse function body: ${JSON.stringify(lexems)}`
      );
    }

    const func = {
      type: "function",
      args,
      body
    };

    return [true, func, rest];
  }

  return [false, {}, lexems];
}

function parseCombinatorBracket(lexems, open, close, bodyParser) {
  if (lexems[0].type === open) {
    const [status, statements, rest] = bodyParser(lexems.slice(1));
    if (!status) {
      throw new Error(
        `Bad status of ${
          bodyParser.name
        } in parseCombinatorBracket, got: ${JSON.stringify(lexems.slice(1))}`
      );
    }
    if (rest[0].type !== close) {
      throw new Error(`Expected a ${close}, got: ${JSON.stringify(rest)}`);
    }

    return [true, statements, rest.slice(1)];
  } else {
    throw new Error(
      `Expected to see ${open} in parseCombinatorBracket, got: ${JSON.stringify(
        lexems
      )}`
    );
  }
}

function parseCombinatorList(lexems, delimeter = "comma", itemParser) {
  const items = [];

  while (true) {
    let [status, item, rest] = itemParser(lexems);
    if (!status)
      throw new Error(
        `Bad status of ${
          itemParser.name
        } in parseCombinatorList, got: ${JSON.stringify(lexems.slice(1))}`
      );

    items.push(item);

    if (rest[0].type !== delimeter) {
      return [true, items, rest];
    }

    lexems = rest.slice(1);
  }
}

module.exports = parser;
