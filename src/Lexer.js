import { measureTime, or, pair, stream, MultiMap } from "./Utils";

//========================================================================================
/*                                                                                      *
 *                                     LEX UTILS                                        *
 *                                                                                      */
//========================================================================================
export const EXEC_SYMBOL = ">>>"
export const CUSTOM_SYMBOL = ":::"
export const CODE_SYMBOL = "```"
export const ORDER_LIST_SYMBOL = "order_list"
export const LINE_SEPARATOR_SYMBOL = "---"
export const TEXT_SYMBOL = "text"

const tokenBuilder = () => {
  let _type, _text, _repeat = 1;
  const builder = {
    type: t => { _type = t; return builder; },
    text: t => { _text = t; return builder; },
    repeat: r => { _repeat = r; return builder; },
    build: () => ({ type: _type, text: _text, repeat: _repeat })
  };
  return builder;
}

function tokenSymbol(symbol) {
  const sym = [...symbol];
  return {
    lookahead: () => sym[0],
    parse: stream => {
      let s = stream;
      let i = 0;
      while (i < sym.length) {
        if (s.peek() === sym[i]) {
          i++;
          s = s.next();
          continue
        }
        throw new Error(
          `Error occurred while tokening unique symbol ${symbol} ` +
          s.toString()
        );
      }
      return pair(
        tokenBuilder()
          .type(symbol)
          .text(symbol)
          .build(),
        s
      );
    }
  };
}

function tokenRepeat(symbol, repeat) {
  return {
    lookahead: () => symbol,
    parse: stream => {
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
          tokenBuilder()
            .type(symbol)
            .repeat(finalN)
            .text(textArray.join(""))
            .build(),
          auxStream
        );
      }
      throw new Error(
        `Error occurred while tokening repeated #${repeat}, with symbol ${symbol} ` +
        auxStream.toString()
      );
    }
  }
}

function tokenOrderedList() {
  /**
   * 
   * @param {*} stream 
   * @returns pair(token, stream)
   */
  const orderListParser = stream => {
    const char = stream.peek()
    if (Number.parseInt(char) === NaN) return new Error(
      `Error occurred while tokening ordered list start with symbol ${char} ` +
      stream.toString()
    );
    const nextStream = stream.next();
    return or(
      () => {
        const { left: token, nextNextStream } = orderListParser(nextStream)
        return pair(tokenBuilder().symbol(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream)
      },
      () => {
        const char2 = nextStream.peek();
        if (char2 !== ".") return new Error(
          `Error occurred while tokening ordered list start with symbol ${char2} ` +
          stream.toString()
        )
        return pair(
          tokenBuilder()
            .symbol(ORDER_LIST_SYMBOL)
            .text(char + char2)
            .build(),
          nextStream.next()
        )
      }
    )
  }
  return {
    lookahead: () => [...Array(10)].map((_, i) => "" + i),
    parse: orderListParser
  }
}

/**
 * 
 * @param  {{lookahead: () => Array<string>, parser: stream => pair(token, stream)}} tokenParsers 
 * @returns {stream => pair(token, stream)} 
 */
function orToken(...tokenParsers) {
  const orMap = new MultiMap();
  let defaultParsers = []
  tokenParsers.forEach(parser => {
    const lookaheads = parser.lookahead()
    const parse = parser.parse;
    if (!lookaheads) {
      defaultParsers.push(parse)
      return;
    };
    if (Array.isArray(lookaheads)) {
      lookaheads.forEach(lookahead => {
        orMap.put(lookahead, parse);
      });
      return;
    }
    orMap.put(lookaheads, parse);
  })
  return stream => {
    const char = stream.peek();
    const parsers = orMap.get(char) || []
    return or(
      ...parsers.map(parser => () => parser(stream)),
      ...defaultParsers.map(parser => () => parser(stream))
    );
  }
}


//========================================================================================
/*                                                                                      *
 *                                     LEX ANALYSIS                                     *
 *                                                                                      */
//========================================================================================

// order matter
const TOKENS_PARSERS = [
  tokenRepeat("#", 6),
  tokenRepeat("$", 2),
  tokenRepeat("*", 2),
  tokenSymbol(EXEC_SYMBOL),
  tokenSymbol(CUSTOM_SYMBOL),
  tokenSymbol("["),
  tokenSymbol("]"),
  tokenSymbol("("),
  tokenSymbol(")"),
  tokenSymbol(LINE_SEPARATOR_SYMBOL),
  tokenSymbol("-"),
  tokenSymbol(CODE_SYMBOL),
  tokenSymbol("`"),
  tokenSymbol("!"),
  tokenSymbol("\n"),
  tokenSymbol("\t"),
  tokenOrderedList(),
]

/**
 *  Text tokenizer used as default tokenizer
 * @returns {lookahead: () => string | Array<string> | undefined}
 */
function tokenText() {
  const tokenParserLookaheads = TOKENS_PARSERS
    .map(({ lookahead }) => lookahead())
    .map(lookaheads => Array.isArray(lookaheads) ? lookaheads : [lookaheads])
    .flatMap(x => x);
  return {
    lookahead: () => { },
    parse: stream => {
      let s = stream;
      const token = [];
      let isFirstChar = true;
      while (s.hasNext()) {
        const char = s.peek();
        // it can take a lookahead char if it is the first it sees.
        if(!isFirstChar && tokenParserLookaheads.includes(char)) break; 
        token.push(char);
        s = s.next();
        isFirstChar = false;
      }
      return pair(
        tokenBuilder()
          .type(TEXT_SYMBOL)
          .text(token.join(""))
          .build(),
        s
      );
    }
  }
}

const TOKEN_PARSER_FINAL = orToken(...TOKENS_PARSERS, tokenText())
/**
 * stream<char> => stream<tokens>
 * @param {*} s:Stream<Chars>
 * @returns Stream<Tokens>
 */
export function tokenizer(charStream) {
  const acc = [];
  let s = charStream;
  while (s.hasNext()) {
    const { left: token, right: next } = TOKEN_PARSER_FINAL(s);
    acc.push(token);
    s = next;
  }
  return stream(acc);
}

const TEXT = "# Nabladown.js \n A parser and renderer for the `Nabladown` language. \n NablaDown.js is a `JS` library able to `parse: String -> Abstract Syntax Tree` a pseudo/flavored **Markdown** language and `render: Abstract Syntax Tree -> HTML` it into `HTML`.The purpose of this library is to render beautiful documents in `HTML`, using a simple language as **Markdown**, with the focus of rendering `code`,`equations` and `interaction`.The library is written in a way, that is possible to create and compose multiple renderers together. This way is possible to add feature on top of a basic renderer. More on that below. # Contents 1. [Language cheat sheet](#language-cheat-sheet) 2. [Import](#import) 3. [Usage](#usage)4. [Extending basic renderer](#extending-basic-renderer)5. [Building yourself](#building-yourself) 6. [TODO](#todo)"
// const TEXT = "# Nabladown.js    ::     \n"

console.log(measureTime(() => {
  const charStream = stream(TEXT);
  const tokenStream = tokenizer(charStream);
}))
