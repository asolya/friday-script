function run(ast) {
  const context = new Context();

  evalStatementList(context, ast);
}

function evalStatementList(context, ast) {
  ast.list.forEach(statement => evalStatement(context, statement));
}

function evalStatement(context, statement) {
  switch (statement.type) {
    case "variable_declaration": {
      context.new(statement.name);
      context.set(statement.name, evalValue(context, statement.value));
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
    case "if": {
      let condition = evalValue(context, statement.condition);
      if (condition.type !== "boolean") {
        throw new Error("Expected boolean in while condition");
      }
      if (condition.value) {
        evalStatement(context, statement.thenStatement);
      } else if (statement.elseStatement !== undefined) {
        evalStatement(context, statement.elseStatement);
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
        const func = context.get(value.func);
        if (func === undefined) {
          throw new Error(`Unknown function: ${value.func}`);
        }

        context = new Context(context);
        for (let i = 0; i < func.args.length; i++) {
          context.new(func.args[i]);
          context.set(func.args[i], evaluatedParams[i] || undefined);
        }

        return evalStatement(context, func.body);
      }
    }
  }

  if (value.type === "num") {
    return { type: "numeric", value: value.value };
  }

  if (value.type === "id") {
    const contextValue = context.get(value.value);
    if (contextValue === undefined) {
      throw new Error(`Missing variable: ${value.value}`);
    }

    return contextValue;
  }

  if (value.type === "variable_assigment") {
    const evaluated = evalValue(context, value.value);
    context.set(value.name, evaluated);
    return evaluated;
  }

  if (value.type === "function") {
    return { type: "function", args: value.args, body: value.body };
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

function Context(parent) {
  const vars = {};

  this.new = function(name) {
    vars[name] = undefined;
  };

  this.get = function(name) {
    if (vars.hasOwnProperty(name)) {
      return vars[name];
    }

    if (parent !== undefined) {
      return parent.get(name);
    }
  };

  this.set = function(name, value) {
    if (vars.hasOwnProperty(name)) {
      vars[name] = value;
    }

    if (parent !== undefined) {
      parent.set(name, value);
    }
  };
}

module.exports = run;
