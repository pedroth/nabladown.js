//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

import { tokenizer } from "./Lexer";
import { or, pair, stream } from "./Utils";

/**
 * Grammar
 *
 * Program -> Expression Program | epsilon
 * Expression -> Statement'\n'
 * Statement -> Title | Seq
 * Title -> '#' Seq | '#'Seq
 * Seq -> SeqTypes Seq | epsilon
 * SeqTypes -> Formula / Html / Code / Link / Italic / Bold / Text
 * Formula -> '$' AnyBut('$') '$'
 * Html -> '+++' AnyBut('+') '+++'
 * Code -> LineCode / BlockCode
 * LineCode -> `AnyBut('\n', '`')`
 * BlockCode-> ```Text \n AnyBut('`')```
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
    // shortcut in parsing this rule
    const filterNextSpace =
      stream.next().peek().type === " " ? stream.next().next() : stream.next();
    const { left: Seq, right: nextStream } = parseSeq(filterNextSpace);
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
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: "seqTypes", Html }, nextStream);
    },
    () => {
      const { left: Code, right: nextStream } = parseCode(stream);
      return pair({ type: "seqTypes", Code }, nextStream);
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
 * stream => pair(Html, stream)
 * @param {*} stream
 */
function parseHtml(stream) {
  const token = stream.peek();
  const repeat = token.repeat;
  const error = new Error(
    "Error occurred while parsing Html," + stream.toString()
  );
  if (token.type === "+" && repeat === 3) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(
      token => ["+"].includes(token.type) && 3 === token?.repeat
    )(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "+" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: "html",
          html: AnyBut.textArray.join("")
        },
        nextStream.next()
      );
    }
  }
  throw error;
}

/**
 *
 * stream => pair(Code, stream)
 * @param {*} stream
 */
function parseCode(stream) {
  return or(
    () => {
      const { left: LineCode, right: nextStream } = parseLineCode(stream);
      return pair({ type: "code", LineCode }, nextStream);
    },
    () => {
      const { left: BlockCode, right: nextStream } = parseBlockCode(stream);
      return pair({ type: "code", BlockCode }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(LineCode, stream)
 * @param {*} stream
 */
function parseLineCode(stream) {
  const lineCodeTokenPredicate = t => t.type === "`" && t.repeat === 1;
  const token = stream.peek();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(
      t => lineCodeTokenPredicate(t) || t.type === "\n"
    )(stream.next());
    if (lineCodeTokenPredicate(nextStream.peek())) {
      return pair(
        { type: "lineCode", code: AnyBut.textArray.join("") },
        nextStream.next()
      );
    }
  }
  throw new Error("Error occurred while parsing LineCode," + stream.toString());
}

/**
 *
 * stream => pair(BlockCode, stream)
 * @param {*} stream
 */
function parseBlockCode(stream) {
  throw new Error(
    "Error occurred while parsing BlockCode," + stream.toString()
  );
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
