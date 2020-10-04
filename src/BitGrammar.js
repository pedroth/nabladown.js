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
    filter: (predicate) => stream(array.filter(predicate)),
  };
}

/**
 * creates abstract syntax tree from string, string => AST
 * @param {*} string
 */
function parse(string) {
  console.log("Test", string);
  const filterStream = stream(string).filter((c) => c !== " " && c !== "\n");
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
          program: program,
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
        S,
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
      const { left: D1, right: nextStream } = parseD(stream.next());
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
      return pair({ type: "N", int: D, decimal: null }, nextStream);
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

function execute(tree) {}

(() => {
  let timer = null;
  const editor = ace.edit("input");
  const output = document.getElementById("output");
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => (output.value = JSON.stringify(parse(editor.getValue()))),
      250
    );
  });
})();
