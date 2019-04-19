function run(ast) {
  const context = {
    vars: {}
  };

  evalStatementList(context, ast);
}

function evalStatementList(context, ast) {
  ast.forEach(statement => evalStatement(context, statement));
}

function evalStatement(context, statement) {
  if (statement.type === "variable_declaration") {
    context[statement.name] = evalValue(context, statement.value);
  } else {
    return evalValue(context, statement);
  }
}

function evalValue(context, value) {
  if (value.type === "call") {
    const evaluatedParams = value.params.map(param =>
      evalValue(context, param)
    );

    switch (value.func) {
      case "log": {
        console.log(JSON.stringify(evaluatedParams));
        return undefined;
      }
      case "add": {
        return { type: "numeric", value: add(evaluatedParams) };
      }
      default: {
        throw new Error(`Unknown function: ${value.func}`);
      }
    }
  }

  if (value.type === "num") {
    return { type: "numeric", value: value.value };
  }

  if (value.type === "id") {
    const contextValue = context[value.value];
    if (contextValue === undefined) {
      throw new Error(`Missing variable: ${value.value}`);
    }

    return contextValue;
  }

  throw new Error(`Unknown value type: ${JSON.stringify(value)}`);
}

function add(params) {
  return params.reduce((accum, value) => {
    if (value.type !== "numeric") {
      throw new Error(
        `Expected numeric type, but got: ${JSON.stringify(value)}`
      );
    }
    return accum + value.value;
  }, 0);
}

module.exports = run;
