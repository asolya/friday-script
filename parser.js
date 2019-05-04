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
    const [status, statements, rest] = parseStatementList(lexems.slice(1));
    if (!status) {
      throw new Error(
        `Bad status of parseStatementList: ${JSON.stringify(lexems.slice(1))}`
      );
    }
    if (rest[0].type !== "close_brace") {
      throw new Error(`Expected a close brace, got: ${JSON.stringify(rest)}`);
    }

    return [true, statements, rest.slice(1)];
  }
  if (lexems[0].type === "while") {
    if (lexems[1].type !== "open_bracket") {
      throw new Error(
        `Expected bracket after while, got: ${JSON.stringify(lexems)}`
      );
    }
    let [status, condition, rest] = parseValue(lexems.slice(2));
    if (!status) {
      throw new Error(
        `Error in parsing value: ${JSON.stringify(lexems.slice(1))}`
      );
    }
    if (rest[0].type !== "close_bracket") {
      throw new Error(`Expected a close bracket, got: ${JSON.stringify(rest)}`);
    }

    let whileStatement;
    [status, whileStatement, rest] = parseStatement(rest.slice(1));
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
    if (lexems[1].type !== "open_bracket") {
      throw new Error(
        `Expected open bracket after function: ${JSON.stringify(lexems)}`
      );
    }

    lexems = lexems.slice(2);
    const args = [];

    while (true) {
      if (lexems[0].type !== "id") {
        break;
      }

      args.push(lexems[0].value);

      if (lexems[1].type !== "comma") {
        lexems = lexems.slice(1);
        break;
      }

      lexems = lexems.slice(2);
    }

    if (lexems[0].type !== "close_bracket") {
      throw new Error(
        `Expected a close bracket, got: ${JSON.stringify(lexems)}`
      );
    }

    if (lexems[1].type !== "open_brace") {
      throw new Error(`Expected a open brace, got: ${JSON.stringify(lexems)}`);
    }

    lexems = lexems.slice(2);

    const [status, body, rest] = parseStatementList(lexems);
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
    if (rest[0].type !== "close_brace") {
      throw new Error(`Expected a open brace, got: ${JSON.stringify(rest)}`);
    }
    lexems = rest.slice(1);
    return [true, func, lexems];
  }

  return [false, {}, lexems];
}

module.exports = parser;
