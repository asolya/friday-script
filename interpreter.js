function run(ast) {
  const context = {
    vars: {}
  };

  evalStatementList(context, ast);
}

function evalStatementList(context, ast) {
  ast.list.forEach(statement => evalStatement(context, statement));
}

function evalStatement(context, statement) {
  switch (statement.type) {
    case "variable_declaration": {
      context[statement.name] = evalValue(context, statement.value);
      break;
    }
    case "while": {
      while (true) {
        let condition = evalValue(context, statement.condition);
        if (condition.type !== "boolean") {
          throw new Error("Expected boolean in while condition");
        }
        if (!condition.value) {
          break;
        }
        evalStatement(context, statement.statement);
      }
      break;
    }
    case "statement_list": {
      evalStatementList(context, statement);
      break;
    }
    default: {
      return evalValue(context, statement);
    }
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
      case "lessThan": {
        return { type: "boolean", value: lessThan(evaluatedParams) };
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

  if (value.type === "variable_assigment") {
    return (context[value.name] = evalValue(context, value.value));
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

function lessThan(params) {
  if (params.length < 2) {
    throw new Error(
      `lessThan function expects to get to parameters, but got ${JSON.stringify(
        params
      )}`
    );
  }

  const [first, second] = params;

  if (first.type !== "numeric") {
    throw new Error(
      `lessThan function expects to get to numeric parameters, but got first params as ${JSON.stringify(
        first
      )}`
    );
  }

  if (second.type !== "numeric") {
    throw new Error(
      `lessThan function expects to get to numeric parameters, but got first params as ${JSON.stringify(
        second
      )}`
    );
  }

  return first.value < second.value;
}

module.exports = run;
