//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

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
    hasNext: () => array.length >= 1,
    isEmpty: () => array.length === 0,
    toString: () =>
      array.map(s => (typeof s === "string" ? s : JSON.stringify(s))).join(""),
    filter: predicate => stream(array.filter(predicate))
  };
}

/**
 * stream => {}
 * @param {*} stream: Stream
 */
function readStream(stream) {
  while (stream.hasNext()) {
    console.log(stream.peek());
    stream = stream.next();
  }
}

/**
 *  Select one rule
 * @param  {...any} rules
 */
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

//========================================================================================
/*                                                                                      *
 *                                     LEX ANALYSIS                                     *
 *                                                                                      */
//========================================================================================

//========================================================================================
/*                                                                                      *
 * Tokens
 * #^{1..6}
 * $^{1..2}
 * \n
 * [
 * ]
 * (
 * )
 *                                                                                      */
//========================================================================================

/**
 * Token := {type: String, text: String}
 */

/**
 * stream<char> => stream<tokens>
 * @param {*} s:Stream<Chars>
 * @returns Stream<Tokens>
 */
function tokenizer(charStream) {
  const acc = [];
  let s = charStream;
  while (s.hasNext()) {
    const { left: token, right: next } = or(
      () => tokenRepeatLessThan("#", 6)(s),
      () => tokenRepeatLessThan("$", 2)(s),
      () => tokenSymbol("\n")(s),
      () => tokenSymbol("[")(s),
      () => tokenSymbol("]")(s),
      () => tokenSymbol("(")(s),
      () => tokenSymbol(")")(s),
      () => tokenText(s)
    );
    acc.push(token);
    s = next;
  }
  return stream(acc);
}

function tokenRepeatLessThan(symbol, repeat) {
  return stream => {
    let n = repeat;
    let auxStream = stream;
    while (auxStream.peek() === symbol && n >= 0) {
      n--;
      auxStream = auxStream.next();
    }
    const finalN = repeat - n;
    if (finalN > 0) {
      return pair({ type: symbol, repeat: finalN, text: symbol }, auxStream);
    }
    throw new Error(
      `Error occurred while tokening repeated #${repeat}, with symbol ${symbol} ` +
        auxStream.toString()
    );
  };
}

function tokenSymbol(symbol) {
  return stream => {
    if (stream.peek() === symbol) {
      return pair({ type: symbol, repeat: 1, text: symbol }, stream.next());
    }
    throw new Error(
      `Error occurred while tokening unique symbol ${symbol} ` +
        auxStream.toString()
    );
  };
}

function tokenText(stream) {
  const keyWords = [..."#$[]()\n"];
  const token = [];
  let s = stream;
  while (s.hasNext() && !keyWords.includes(s.peek())) {
    token.push(s.peek());
    s = s.next();
  }
  return pair({ type: "text", text: token.join("") }, s);
}

//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

/**
 * Grammar
 *
 * Program -> Expression Program | epsilon
 * Expression -> Statement'\n'
 * Statement -> Title | Textual
 * Title -> '#'Textual
 * Textual -> TextualTypes Textual | epsilon
 * TextualTypes -> Text | Formula | Link
 * Text -> ('text' | '#' | '(' | ')' )
 * Formula -> '$' 'anything' '$'
 * Link -> [Statement]('text')
 */

/**
 * parse: String => Abstract syntactic tree
 * @param {*} string
 * @returns Parsing Tree
 */
function parse(string) {
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const program = parseProgram(tokenStream);
  console.log("Parse tree", program.left);
  return program.left;
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
 * Expression -> Statement'\n';
 *
 * stream => pair(Expression, stream)
 *
 * @param {*} stream
 */
function parseExpression(stream) {
  const { left: Statement, right: nextStream } = parseStatement(stream);
  if (nextStream.peek()?.type === "\n") {
    return pair(
      {
        type: "expression",
        Statement
      },
      nextStream.next()
    );
  }
  throw new Error(
    "Error occurred while parsing expression," + nextStream.toString()
  );
}

/**
 * Statement -> Title | Textual
 *
 * stream => pair(Statement, stream)
 * @param {*} stream
 */
function parseStatement(stream) {
  return or(
    () => {
      const { left: Title, right: nextStream } = parseTitle(stream);
      return pair({ type: "statement", Title }, nextStream);
    },
    () => {
      const { left: Textual, right: nextStream } = parseTextual(stream);
      return pair({ type: "statement", Textual }, nextStream);
    }
  );
}

/**
 * Title -> '#'Textual
 *
 * stream => pair(Title, stream)
 * @param {*} stream
 */
function parseTitle(stream) {
  if (stream.peek()?.type === "#") {
    const level = stream.peek().repeat;
    const { left: Textual, right: nextStream } = parseTextual(stream.next());
    return pair({ type: "title", Textual, level }, nextStream);
  }
  throw new Error(
    "Error occurred while parsing Title," + nextStream.toString()
  );
}

/**
 * Textual -> TextualTypes Textual | epsilon
 *
 * stream => pair(Textual, stream)
 * @param {*} stream
 */
function parseTextual(stream) {
  return or(
    () => {
      const { left: TextualTypes, right: nextStream } = parseTextualTypes(
        stream
      );
      const { left: Textual, right: nextNextStream } = parseTextual(nextStream);
      return pair({ type: "textual", TextualTypes, Textual }, nextNextStream);
    },
    () => pair({ type: "textual", isEmpty: true }, stream)
  );
}

/**
 * TextualTypes -> Text | Formula | Link
 *
 * stream => pair(TextualTypes, stream)
 * @param {*} stream
 */
function parseTextualTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: "textualTypes", Formula }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: "textualTypes", Link }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: "textualTypes", Text }, nextStream);
    }
  );
}

/**
 * Text -> ('Txt' | '#' | '(' | ')' )
 *
 * stream => pair(Text, stream)
 * @param {*} stream
 */
function parseText(stream) {
  const token = stream.peek();
  if (
    token?.type === "text" ||
    token?.type === "#" ||
    token?.type === "(" ||
    token?.type === ")"
  ) {
    const text = token?.text || "";
    return pair({ type: "text", text: text }, stream.next());
  }
  throw new Error("Error occurred while parsing Textual," + stream.toString());
}

/**
 * Formula -> '$' 'anything' '$'
 *
 * stream => pair(Formula, stream)
 * @param {*} stream
 */
function parseFormula(stream) {
  const token = stream.peek();
  const repeat = token.repeat;
  const error = new Error(
    "Error occurred while parsing Formula," + stream.toString()
  );
  if (token?.type === "$") {
    let s = stream.next();
    const insideTokens = [];
    let dollarCount = 1;
    while (s.hasNext()) {
      if (s.peek()?.type === "$" && s.peek()?.repeat === repeat) {
        dollarCount++;
        s = s.next();
        break;
      }
      insideTokens.push(s.peek().text);
      s = s.next();
    }
    if (dollarCount <= 1) throw error;
    return pair({ type: "formula", equation: insideTokens.join("") }, s);
  }
  throw error;
}

/**
 * Link -> [Statement]('Txt')
 *
 * stream => pair(Link, stream)
 * @param {*} stream
 */
function parseLink(stream) {
  // ugly
  if (stream.peek()?.type === "[") {
    const nextStream = stream.next();
    const { left: Statement, right: nextNextStream } = parseStatement(
      nextStream
    );
    if (nextNextStream.peek()?.type === "]") {
      const next3Stream = nextNextStream.next();
      if (next3Stream.peek()?.type === "(") {
        const next4Stream = next3Stream.next();
        if (next4Stream.peek()?.type === "text") {
          const next5Stream = next4Stream.next();
          if (next5Stream.peek()?.type === ")") {
            return pair(
              { type: "link", Statement, link: next4Stream.peek().text },
              next5Stream.next()
            );
          }
        }
      }
    }
  }
  throw new Error("Error occurred while parsing Link," + stream.toString());
}

//========================================================================================
/*                                                                                      *
 *                                        RENDER                                        *
 *                                                                                      */
//========================================================================================

/**
 * render: Abstract syntactic tree => HTML
 * @param {*} tree
 * @returns HTML object
 *
 */
function render(tree) {
  const listOfExpressions = renderProgram(tree);
  const body = document.createElement("div");
  listOfExpressions.forEach(e => body.appendChild(e));
  return body;
}
/**
 * Program -> Expression Program | epsilon
 *
 * program => [HTML]
 *
 * @param {*} program
 */
function renderProgram(program) {
  if (program.expression === null && program.program === null) return [];
  const expression = renderExpression(program.expression);
  const listOfExpression = renderProgram(program.program);
  return [expression, ...listOfExpression];
}

/**
 * Expression -> Statement'\n';
 *
 * expression => HTML
 *
 * @param {*} expression
 */
function renderExpression(expression) {
  return renderStatement(expression.Statement);
}

/**
 * Statement -> Title | Textual
 *
 * statement => HTML
 * @param {*} statement
 */
function renderStatement(statement) {
  return returnOne(
    [
      { predicate: s => !!s.Title, value: s => renderTitle(s.Title) },
      { predicate: s => !!s.Textual, value: s => renderTextual(s.Textual) }
    ],
    document.createElement("div")
  )(statement);
}

/**
 * Title -> '#'Textual
 *
 * title => HTML
 * @param {*} title
 */
function renderTitle(title) {
  const { level, Textual: textual } = title;
  const header = document.createElement(`h${level}`);
  header.appendChild(renderTextual(textual));
  return header;
}

/**
 * Textual -> TextualTypes Textual | epsilon
 *
 * textual => HTML
 * @param {*} textual
 */
function renderTextual(textual) {
  if (!textual.Textual && !textual.TextualTypes)
    return document.createElement("div");
  const textualTypesDiv = renderTextualTypes(textual.TextualTypes);
  const textualDiv = renderTextual(textual.Textual);
  return textualDiv.appendChild(textualTypesDiv);
}

/**
 * TextualTypes -> Text | Formula | Link
 *
 * textualTypes => HTML
 *
 * @param {*} textualTypes
 */
function renderTextualTypes(textualTypes) {
  returnOne(
    [
      { predicate: t => !!t.Text, value: t => renderText(t.Text) },
      { predicate: t => !!t.Formula, value: t => renderFormula(t.Formula) },
      { predicate: t => !!t.Link, value: t => renderLink(t.Link) }
    ],
    document.createElement("div")
  )(textualTypes);
}

/**
 * Text -> ('Txt' | '#' | '(' | ')' ) Text | epsilon
 *
 * text => HTML
 * @param {*} text
 */
function renderText(text) {
  const { text: txt } = text;
  const div = document.createElement("div");
  div.setAttribute("style", "{}");
  div.innerHTML = txt;
  return div;
}

/**
 * Formula -> '$' 'anything' '$'
 *
 * formula => HTML
 * @param {*} formula
 */
function renderFormula(formula) {
  //must check if katex exist
  const Katex = katex || { render: () => {} };
  const { equation } = formula;
  const div = document.createElement("div");
  Katex.render(equation, div, {
    throwOnError: false
  });
  return div;
}

/**
 * Link -> [Statement]('Txt')
 *
 * link => HTML
 * @param {*} link
 */
function renderLink(link) {
  const { Statement, link: hyperlink } = link;
  const div = document.createElement("a");
  console.log("Link", hyperlink);
  div.setAttribute("href", hyperlink);
  div.setAttribute("target", "_blank");
  const childStatement = renderStatement(Statement);
  div.appendChild(childStatement);
  return div;
}

//========================================================================================
/*                                                                                      *
 *                                          UI                                          *
 *                                                                                      */
//========================================================================================

function onResize() {
  const style = document.getElementById("composer").style;
  if (window.innerWidth >= window.innerHeight) {
    style["flex-direction"] = "row";
    document.getElementById("inputContainer").style.width = `${
      window.innerWidth / 2
    }px`;
    document.getElementById("outputContainer").style.width = `${
      window.innerWidth / 2
    }px`;
  } else {
    style["flex-direction"] = "column";
    document.getElementById("inputContainer").style.width = `${100}%`;
    document.getElementById("outputContainer").style.width = `${100}%`;
  }
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

onResize();
window.addEventListener("resize", onResize);

(() => {
  let timer = null;
  const editor = ace.edit("input");
  editor.setValue("#Pedro\n blabla\n");
  const output = document.getElementById("output");
  editor.getSession().on("change", () => {
    console.log("On Change");
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      removeAllChildNodes(output);
      output.appendChild(render(parse(editor.getValue())));
    }, 250);
  });
})();
