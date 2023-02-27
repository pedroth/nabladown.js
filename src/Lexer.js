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
      while (auxStream.peek() === symbol && n > 0) {
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
  const orderedListParser = stream => {
    const char = stream.peek()
    if (Number.isNaN(Number.parseInt(char))) {
      throw new Error(
        `Error occurred while tokening ordered list start with symbol ${char} ` +
        stream.toString()
      );
    }
    const nextStream = stream.next();
    return or(
      () => {
        const { left: token, right: nextNextStream } = orderedListParser(nextStream)
        return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream)
      },
      () => {
        const char2 = nextStream.peek();
        if (char2 !== ".") {
          throw new Error(
            `Error occurred while tokening ordered list start with symbol ${char2} ` +
            stream.toString()
          )
        }
        return pair(
          tokenBuilder()
            .type(ORDER_LIST_SYMBOL)
            .text(char + char2)
            .build(),
          nextStream.next()
        )
      }
    )
  }
  return {
    lookahead: () => [...Array(10)].map((_, i) => "" + i),
    parse: orderedListParser
  }
}

/**
 * Optimized or with lookahead, instead of normal or()
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

// order matters
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
  tokenSymbol(":"),
  tokenSymbol("!"),
  tokenSymbol("\n"),
  tokenSymbol("\t"),
  tokenSymbol(" "),
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
        if (!isFirstChar && tokenParserLookaheads.includes(char)) break;
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
// const TOKEN_PARSER_FINAL = s => or(...[...TOKENS_PARSERS, tokenText()].map(p => () => p.parse(s))) // non optimized "or" runs at 1/5 of the speed

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