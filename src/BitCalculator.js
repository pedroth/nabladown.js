/**
 * Grammar
 *
 * Program -> Expression Program | epsilon
 * Expression -> S;
 * S -> N + S | N + F | F + S | F
 * F -> N * F | N * E | E * F | E
 * E -> (S) | N
 * N -> D.D | D
 * D ->  0D | 1D | epsilon
 */

/**
 * creates a pair pair: (a,b) => pair
 * @param {*} a left
 * @param {*} b right
 */
function pair(a, b) {
  return { left: a, right: b };
}

/**
 * creates a stream from a string, string => stream
 * @param {*} string
 */
function stream(stringOrArray) {
  // copy array or string to array
  const array = [...stringOrArray];
  return {
    next: () => stream(array.slice(1)),
    peek: () => array[0],
    hasNext: () => array.length > 1,
    isEmpty: () => array.length === 0,
    toString: () => array.join(""),
    filter: predicate => stream(array.filter(predicate))
  };
}

/**
 * creates abstract syntax tree from string, string => AST
 * @param {*} string
 */
function parse(string) {
  const filterStream = stream(string).filter(c => c !== " " && c !== "\n");
  return parseProgram(filterStream).left;
}

function or(...rules) {
  let accError = null;
  for (let i = 0; i < rules.length; i++) {
    try {
      return rules[i]();
    } catch (error) {
      accError = error;
    }
  }
  throw accError;
}

/**
 * Program -> Expression Program | epsilon(EndOfFile really...)
 *
 * stream => pair(Program, stream)
 *
 * @param {*} stream
 */
function parseProgram(stream) {
  return or(
    () => {
      const { left: expression, right: nextStream } = parseExpression(stream);
      const { left: program, right: nextNextStream } = parseProgram(nextStream);
      return pair(
        {
          type: "program",
          expression: expression,
          program: program
        },
        nextNextStream
      );
    },
    () => pair({ type: "program", expression: null, program: null }, stream)
  );
}

/**
 * Expression -> S;
 *
 * stream => pair(Expression, stream)
 *
 * @param {*} stream
 */
function parseExpression(stream) {
  const { left: S, right: nextStream } = parseS(stream);
  if (nextStream.peek() === ";") {
    return pair(
      {
        type: "expression",
        S
      },
      nextStream.next()
    );
  }
  throw new Error(
    "Error occurred while parsing expression," + nextStream.toString()
  );
}

/**
 * S -> N + S | N + F | F + S | F
 *
 * stream => pair(S, stream)
 *
 * @param {*} stream
 */
function parseS(stream) {
  return or(
    () => {
      const { left: N, right: nextStream } = parseN(stream);
      if (nextStream.peek() === "+") {
        const { left: S, right: nextNextStream } = parseS(nextStream.next());
        return pair({ type: "S", N, S }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing S," + nextStream.toString()
      );
    },
    () => {
      const { left: S, right: nextStream } = parseN(stream);
      if (nextStream.peek() === "+") {
        const { left: F, right: nextNextStream } = parseF(nextStream.next());
        return pair({ type: "S", N, F }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing S," + nextStream.toString()
      );
    },
    () => {
      const { left: F, right: nextStream } = parseF(stream);
      if (nextStream.peek() === "+") {
        const { left: S, right: nextNextStream } = parseS(nextStream.next());
        return pair({ type: "S", F, S }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing S," + nextStream.toString()
      );
    },
    () => {
      const { left: F, right: nextStream } = parseF(stream);
      return pair({ type: "S", F }, nextStream);
    }
  );
}

/**
 * F -> N * F | N * E | E * F | E
 *
 * stream => pair(F, stream)
 *
 * @param {*} stream
 */
function parseF(stream) {
  return or(
    () => {
      const { left: N, right: nextStream } = parseN(stream);
      if (nextStream.peek() === "*") {
        const { left: F, right: nextNextStream } = parseF(nextStream.next());
        return pair({ type: "F", N, F }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing F," + nextStream.toString()
      );
    },
    () => {
      const { left: N, right: nextStream } = parseN(stream);
      if (nextStream.peek() === "*") {
        const { left: E, right: nextNextStream } = parseE(nextStream.next());
        return pair({ type: "F", N, E }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing F," + nextStream.toString()
      );
    },
    () => {
      const { left: E, right: nextStream } = parseE(stream);
      if (nextStream.peek() === "*") {
        const { left: F, right: nextNextStream } = parseF(nextStream.next());
        return pair({ type: "F", E, F }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing F," + nextStream.toString()
      );
    },
    () => {
      const { left: E, right: nextStream } = parseE(stream);
      return pair({ type: "F", E }, nextStream);
    }
  );
}

/**
 * E -> (S) | N
 *
 * stream => pair(E, stream)
 *
 * @param {*} stream
 */
function parseE(stream) {
  return or(
    () => {
      if (stream.peek() === "(") {
        const { left: S, right: nextStream } = parseS(stream.next());
        if (nextStream.peek() === ")") {
          return pair({ type: "E", S }, nextStream.next());
        }
      }
      throw new Error(
        "Error occurred while parsing E," + nextStream.toString()
      );
    },
    () => {
      const { left: N, right: nextStream } = parseN(stream);
      return pair({ type: "E", N }, nextStream);
    }
  );
}

/**
 * N -> D.D | D
 *
 * stream => pair(N, stream)
 *
 * @param {*} stream
 */
function parseN(stream) {
  return or(
    () => {
      const { left: D1, right: nextStream } = parseD(stream);
      if (nextStream.peek() === ".") {
        const { left: D2, right: nextNextStream } = parseD(nextStream.next());
        return pair({ type: "N", int: D1, decimal: D2 }, nextNextStream);
      }
      throw new Error(
        "Error occurred while parsing N," + nextStream.toString()
      );
    },
    () => {
      const { left: D, right: nextStream } = parseD(stream);
      return pair({ type: "N", int: D }, nextStream);
    }
  );
}

/**
 * D ->  0D | 1D | epsilon
 *
 * stream => pair(D, stream)
 *
 * @param {*} stream
 */
function parseD(stream) {
  return or(
    () => {
      if (stream.peek() === "0") {
        const { left: D, right: nextStream } = parseD(stream.next());
        return pair({ type: "D", int: D?.int ? "0" + D.int : "0" }, nextStream);
      }
      throw new Error("Error occurred while parsing D," + stream.toString());
    },
    () => {
      if (stream.peek() === "1") {
        const { left: D, right: nextStream } = parseD(stream.next());
        return pair({ type: "D", int: D?.int ? "1" + D.int : "1" }, nextStream);
      }
      throw new Error("Error occurred while parsing D," + stream.toString());
    },
    () => pair({ type: "D", int: null }, stream)
  );
}

function readStream(stream) {
  while (stream.hasNext()) {
    console.log(stream.peek());
    stream = stream.next();
  }
}
/**
 * Return values of expressions
 * @param {*} tree
 * @returns String
 */
function execute(tree) {
  console.log("PEDRO");
  const listOfExpression = exeProgram(tree);
  return listOfExpression.length > 0 ? listOfExpression.join("\n") : "Empty";
}

/**
 * Program -> Expression Program | epsilon
 * @param {*} program
 * @returns Array<Number>
 */
function exeProgram(program) {
  if (program.expression === null && program.program === null) return [];
  const expression = exeExpression(program.expression);
  const listOfExpression = exeProgram(program.program);
  return ["> " + expression, ...listOfExpression];
}
/**
 * Expression -> S;
 * @param {*} expression
 * @returns Number
 */
function exeExpression(expression) {
  return exeS(expression.S);
}

/**
 * S -> N + S | N + F | F + S | F
 * @param {*} S
 * @returns Number
 */
function exeS(S) {
  return returnOne(
    [
      { predicate: s => !!s.N && !!s.S, value: s => exeN(s.N) + exeS(s.S) },
      { predicate: s => !!s.N && !!s.F, value: s => exeN(s.N) + exeF(s.F) },
      { predicate: s => !!s.F && !!s.S, value: s => exeF(s.F) + exeS(s.S) },
      { predicate: s => !!s.F, value: s => exeF(s.F) }
    ],
    0
  )(S);
}

/**
 * F -> N * F | N * E | E * F | E
 * @param {*} F
 * @returns Number
 */
function exeF(F) {
  return returnOne(
    [
      { predicate: f => !!f.N && !!f.F, value: f => exeN(f.N) * exeF(f.F) },
      { predicate: f => !!f.N && !!f.E, value: f => exeN(f.N) * exeE(f.E) },
      { predicate: f => !!f.E && !!f.F, value: f => exeE(f.E) * exeF(f.F) },
      { predicate: f => !!f.E, value: f => exeE(f.E) }
    ],
    0
  )(F);
}

/**
 *  E -> (S) | N
 * @param {*} E
 * @returns Number
 */
function exeE(E) {
  return returnOne(
    [
      { predicate: e => !!e.S, value: e => exeS(e.S) },
      { predicate: e => !!e.N, value: e => exeN(e.N) }
    ],
    0
  )(E);
}

/**
 * Converts Binary into base10
 * @param {*} N
 * @returns Number
 */
function exeN(N) {
  const integerBits = exeD(N.int);
  const decimalBits = exeD(N.decimal);
  let integer = 0;
  let id = 1;
  for (let i = integerBits.length - 1; i >= 0; i--) {
    integer += id * integerBits[i];
    id *= 2;
  }
  let decimal = 0;
  id = 0.5;
  for (let i = 0; i < decimalBits.length; i++) {
    decimal += id * decimalBits[i];
    id /= 2;
  }
  return integer + decimal;
}

/**
 *
 * @param {*} D
 * returns Array<0|1>
 */
function exeD(D) {
  return !D?.int ? [0] : [...D.int].map(x => Number.parseInt(x));
}

/**
 * Returns a value based on the predicate
 * @param {*} listOfPredicates
 * @param {*} defaultValue
 */
function returnOne(listOfPredicates, defaultValue) {
  return input => {
    for (let i = 0; i < listOfPredicates.length; i++) {
      if (listOfPredicates[i].predicate(input))
        return listOfPredicates[i].value(input);
    }
    return defaultValue;
  };
}

function getReadMe() {
  return `
    Simple Binary calculator

    Available operators: *, +, ()
    Numbers in binary, e.g: 11.0010010 ~ 3.14

    code e.g: (1 + 1.1) * 0.1; 1 + 1 + 1 * 10;
  `;
}

(() => {
  let timer = null;
  const editor = ace.edit("input");
  const output = document.getElementById("output");
  output.value = getReadMe();
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () =>
        (output.value = getReadMe() + "\n" + execute(parse(editor.getValue()))),
      250
    );
  });
})();
