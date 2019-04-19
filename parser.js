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

    if (rest[0].type !== "semicolon") {
      throw new Error(`Semicolon is expected a.k.a. JS. ${lexems}`);
    }
    lexems = rest.slice(1);
    list.push(statement);
  }
  return [true, list, lexems];
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

    return [
      true,
      { type: "variable_declaration", name: lexems[1].value, value },
      rest
    ];
  } else {
    return parseValue(lexems);
  }
}

function parseValue(lexems) {
  if (lexems[0].type === "num") {
    return [true, { type: "num", value: lexems[0].value }, lexems.slice(1)];
  }
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

  return [false, {}, lexems];
}

module.exports = parser;
