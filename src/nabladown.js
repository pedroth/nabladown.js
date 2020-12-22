import katex from "katex";
// import "katex/dist/katex.min.css";

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
    filter: predicate => stream(array.filter(predicate)),
    log: () => {
      let s = stream(array);
      while (s.hasNext()) {
        console.log(s.peek());
        s = s.next();
      }
    }
  };
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
 * *^{1..2}
 *                                                                                      */
//========================================================================================

/**
 * Token := {type: String, text: String}
 *
 * keywords :=  #$][)('\n'*
 * tokens: rep(*, 1..2), rep($,1..2), rep(#,1..6), 'text', ']', '[', '(', ')', '\n'
 * 'text' := keywords
 *
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
      () => tokenRepeatLessThan("*", 2)(s),
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
    let textArray = [];
    while (auxStream.peek() === symbol && n >= 0) {
      n--;
      textArray.push(auxStream.peek());
      auxStream = auxStream.next();
    }
    const finalN = repeat - n;
    if (finalN > 0) {
      return pair(
        { type: symbol, repeat: finalN, text: textArray.join("") },
        auxStream
      );
    }
    throw new Error(
      `Error occurred while tokening repeated #${repeat}, with symbol ${symbol} ` +
        auxStream.toString()
    );
  };
}

function tokenSymbol(symbol) {
  return stream => {
    const sym = [...symbol];
    let s = stream;
    let i = 0;
    while (i < sym.length) {
      if (s.peek() === sym[i]) {
        i++;
        s = s.next();
      } else {
        throw new Error(
          `Error occurred while tokening unique symbol ${symbol} ` +
            auxStream.toString()
        );
      }
    }
    return pair({ type: symbol, repeat: 1, text: symbol }, s);
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
 * Statement -> Title | Seq
 * Title -> '#'Seq
 * Seq -> SeqTypes Seq | epsilon
 * SeqTypes -> Formula / Link / Italic/ Bold/ Text
 * Formula -> '$' AnyBut('$') '$'
 * Link -> [LinkStat](AnyBut('\n', ')'))
 * LinkStat -> (Formula / AnyBut('\n', ']')) LinkStat | epsilon
 * Text -> ¬["\n"]
 * Italic -> *SeqTypes*
 * Bold -> **SeqTypes**
 * AnyBut(s) -> ¬s AnyBut(s) | epsilon
 */

/**
 * parse: String => Abstract syntactic tree
 * @param {*} string
 * @returns Parsing Tree
 */
export function parse(string) {
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const program = parseProgram(tokenStream);
  console.log("Parse tree", program.left);
  return program.left;
}

/**
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
 * stream => pair(Expression, stream)
 *
 * @param {*} stream
 */
function parseExpression(stream) {
  const { left: Statement, right: nextStream } = parseStatement(stream);
  if (nextStream.peek().type === "\n") {
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
      const { left: Seq, right: nextStream } = parseSeq(stream);
      return pair({ type: "statement", Seq }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(Title, stream)
 * @param {*} stream
 */
function parseTitle(stream) {
  if (stream.peek().type === "#") {
    const level = stream.peek().repeat;
    const { left: Seq, right: nextStream } = parseSeq(stream.next());
    return pair({ type: "title", Seq, level }, nextStream);
  }
  throw new Error(
    "Error occurred while parsing Title," + nextStream.toString()
  );
}

/**
 *
 * stream => pair(Seq, stream)
 * @param {*} stream
 */
function parseSeq(stream) {
  return or(
    () => {
      const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream);
      const { left: Seq, right: nextNextStream } = parseSeq(nextStream);
      return pair({ type: "seq", SeqTypes, Seq }, nextNextStream);
    },
    () => pair({ type: "seq", isEmpty: true }, stream)
  );
}

/**
 *
 * stream => pair(SeqTypes, stream)
 * @param {*} stream
 */
function parseSeqTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: "seqTypes", Formula }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: "seqTypes", Link }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: "seqTypes", Italic }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: "seqTypes", Bold }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: "seqTypes", Text }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(Text, stream)
 * @param {*} stream
 */
function parseText(stream) {
  const token = stream.peek();
  if (!["\n"].some(s => token.type === s)) {
    const text = token.text || "";
    return pair({ type: "text", text: text }, stream.next());
  }
  throw new Error("Error occurred while parsing Text," + stream.toString());
}

/**
 *
 * stream => pair(Italic, stream)
 * @param {*} stream
 */
function parseItalic(stream) {
  const token = stream.peek();
  if (token.type === "*" && token.repeat === 1) {
    const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "*" && nextToken.repeat === 1) {
      return pair({ type: "italic", SeqTypes }, nextStream.next());
    }
  }
  throw new Error(
    "Error occurred while parsing Italic," + nextStream.toString()
  );
}

/**
 *
 * stream => pair(Bold, stream)
 * @param {*} stream
 */
function parseBold(stream) {
  const token = stream.peek();
  if (token.type === "*" && token.repeat === 2) {
    const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "*" && nextToken.repeat === 2) {
      return pair({ type: "bold", SeqTypes }, nextStream.next());
    }
  }
  throw new Error(
    "Error occurred while parsing Italic," + nextStream.toString()
  );
}

/**
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
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token =>
      ["$"].includes(token.type)
    )(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: "formula",
          equation: AnyBut.textArray.join(""),
          isInline: nextToken?.repeat === 1
        },
        nextStream.next()
      );
    }
  }
  throw error;
}

/**
 *
 * (token => boolean) => pair(AnyBut, stream)
 * @param {*} tokenPredicate: token => boolean
 */
function parseAnyBut(tokenPredicate) {
  return stream => {
    return or(
      () => {
        const peek = stream.peek();
        if (!tokenPredicate(peek)) {
          const { left: AnyBut, right: nextStream } = parseAnyBut(
            tokenPredicate
          )(stream.next());
          return pair(
            { type: "anyBut", textArray: [peek.text, ...AnyBut.textArray] },
            nextStream
          );
        }
        throw new Error(
          "Error occurred while parsing AnyBut," + stream.toString()
        );
      },
      () => pair({ type: "anyBut", textArray: [] }, stream)
    );
  };
}

/**
 *
 * stream => pair(Link, stream)
 * @param {*} stream
 */
function parseLink(stream) {
  // ugly
  if (stream.peek().type === "[") {
    const nextStream = stream.next();
    const { left: LinkStat, right: nextNextStream } = parseLinkStat(nextStream);
    if (nextNextStream.peek().type === "]") {
      const next3Stream = nextNextStream.next();
      if (next3Stream.peek().type === "(") {
        const { left: AnyBut, right: next4Stream } = parseAnyBut(token =>
          ["\n", ")"].includes(token.type)
        )(next3Stream.next());
        if (next4Stream.peek().type === ")") {
          return pair(
            { type: "link", LinkStat, link: AnyBut.textArray.join("") },
            next4Stream.next()
          );
        }
      }
    }
  }
  throw new Error("Error occurred while parsing Link," + stream.toString());
}

/**
 * stream => pair(LinkStat, stream)
 * @param {*} stream
 */
function parseLinkStat(stream) {
  return or(
    () => {
      return or(
        () => {
          const { left: Formula, right: nextStream } = parseFormula(stream);
          const { left: LinkStat, right: nextNextStream } = parseLinkStat(
            nextStream
          );
          return pair({ type: "linkStat", Formula, LinkStat }, nextNextStream);
        },
        () => {
          const { left: AnyBut, right: nextStream } = parseAnyBut(token =>
            ["\n", "]"].includes(token.type)
          )(stream);
          if (AnyBut.textArray.length === 0)
            throw new Error(
              "Error occurred while parsing LinkStat," + stream.toString()
            );
          const { left: LinkStat, right: nextNextStream } = parseLinkStat(
            nextStream
          );
          return pair({ type: "linkStat", AnyBut, LinkStat }, nextNextStream);
        }
      );
    },
    () => pair({ type: "linkStat", isEmpty: true }, stream)
  );
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
export function render(tree) {
  const listOfExpressions = renderProgram(tree);
  const body = document.createElement("div");
  listOfExpressions.forEach(e => body.appendChild(e));
  return body;
}
/**
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
 *
 * expression => HTML
 *
 * @param {*} expression
 */
function renderExpression(expression) {
  return renderStatement(expression.Statement);
}

/**
 *
 * statement => HTML
 * @param {*} statement
 */
function renderStatement(statement) {
  return returnOne(
    [
      { predicate: s => !!s.Title, value: s => renderTitle(s.Title) },
      { predicate: s => !!s.Seq, value: s => renderSeq(s.Seq) }
    ],
    document.createElement("div")
  )(statement);
}

/**
 * title => HTML
 * @param {*} title
 */
function renderTitle(title) {
  const { level, Seq } = title;
  const header = document.createElement(`h${level}`);
  header.appendChild(renderSeq(Seq));
  return header;
}

/**
 * seq => HTML
 * @param {*} seq
 */
function renderSeq(seq) {
  const div = document.createElement("div");
  const seqArray = renderAuxSeq(seq);
  if (seqArray.length === 0)
    return div.appendChild(document.createElement("br"));
  seqArray.forEach(seqDiv => div.appendChild(seqDiv));
  div.setAttribute("style", "display: flex; align-items: center");
  return div;
}

function renderAuxSeq(seq) {
  if (seq.isEmpty) return [];
  const seqTypesDiv = renderSeqTypes(seq.SeqTypes);
  const seqDivArray = renderAuxSeq(seq.Seq);
  return [seqTypesDiv, ...seqDivArray];
}

/**
 * seqTypes => HTML
 *
 * @param {*} seqTypes
 */
function renderSeqTypes(seqTypes) {
  return returnOne(
    [
      { predicate: t => !!t.Text, value: t => renderText(t.Text) },
      { predicate: t => !!t.Formula, value: t => renderFormula(t.Formula) },
      { predicate: t => !!t.Link, value: t => renderLink(t.Link) }
    ],
    document.createElement("div")
  )(seqTypes);
}

/**
 * text => HTML
 * @param {*} text
 */
function renderText(text) {
  const { text: txt } = text;
  const div = document.createElement("pre");
  div.innerHTML = txt;
  return div;
}

/**
 * italic => HTML
 * @param {*} italic
 */
function renderItalic(italic) {
  const { SeqTypes } = italic;
  const div = document.createElement("em");
  div.appendChild(renderSeqTypes(SeqTypes));
  return div;
}

/**
 * bold => HTML
 * @param {*} bold
 */
function renderBold(bold) {
  const { SeqTypes } = bold;
  const div = document.createElement("strong");
  div.appendChild(renderSeqTypes(SeqTypes));
  return div;
}

/**
 * anyBut => HTML
 * @param {*} anyBut
 */
function renderAnyBut(anyBut) {
  const { textArray } = anyBut;
  const div = document.createElement("pre");
  div.innerHTML = textArray.join("");
  return div;
}

/**
 * formula => HTML
 * @param {*} formula
 */
function renderFormula(formula) {
  //must check if katex exist
  const Katex = katex || { render: () => {} };
  const { equation } = formula;
  const div = document.createElement("div");
  if (!formula.isInline) div.setAttribute("style", "flex-grow: 1");
  Katex.render(equation, div, {
    throwOnError: false,
    displayMode: !formula.isInline
  });
  return div;
}

/**
 * link => HTML
 * @param {*} link
 */
function renderLink(link) {
  const { LinkStat, link: hyperlink } = link;
  const div = document.createElement("a");
  div.setAttribute("href", hyperlink);
  hyperlink.includes("http") && div.setAttribute("target", "_blank");
  const childStatement = renderLinkStat(LinkStat);
  div.appendChild(childStatement);
  return div;
}

/**
 * linkStat => HTML
 * @param {*} linkStat
 */
function renderLinkStat(linkStat) {
  const ans = document.createElement("div");
  const seqArray = renderAuxLinkStat(linkStat);
  seqArray.forEach(seqDiv => ans.appendChild(seqDiv));
  ans.setAttribute("style", "display: block ruby;");
  return ans;
}

function renderAuxLinkStat(linkStat) {
  if (linkStat.isEmpty) return [];
  const linkStatTypesDiv = returnOne(
    [
      { predicate: l => !!l.AnyBut, value: l => renderAnyBut(l.AnyBut) },
      { predicate: l => !!l.Formula, value: l => renderFormula(l.Formula) }
    ],
    document.createElement("div")
  )(linkStat);
  const linkStatDivArray = renderAuxSeq(linkStat.LinkStat);
  return [linkStatTypesDiv, ...linkStatDivArray];
}
