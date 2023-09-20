var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../node_modu
function pair(a, b) {
  return { left: a, right: b };
}
function stream(stringOrArray) {
  const array = [...stringOrArray];
  return {
    next: () => stream(array.slice(1)),
    take: (n) => stream(array.slice(n)),
    peek: () => array[0],
    hasNext: () => array.length > 1,
    isEmpty: () => array.length === 0,
    toString: () => array.map((s) => typeof s === "string" ? s : JSON.stringify(s)).join(""),
    filter: (predicate) => stream(array.filter(predicate)),
    log: () => {
      let s = stream(array);
      while (s.hasNext()) {
        console.log(s.peek());
        s = s.next();
      }
      console.log(s.peek());
    }
  };
}
function eatSymbol(n, symbolPredicate) {
  return function(stream2) {
    if (n === 0)
      return stream2;
    if (symbolPredicate(stream2)) {
      return eatSymbol(n - 1, symbolPredicate)(stream2.next());
    }
    throw new Error(`Caught error while eating ${n} symbols`, stream2.toString());
  };
}
function eatSpaces(tokenStream) {
  let s = tokenStream;
  if (s.peek().type !== " ")
    return s;
  while (s.peek().type === " ")
    s = s.next();
  return s;
}
function or(...rules) {
  let accError = null;
  for (let i = 0;i < rules.length; i++) {
    try {
      return rules[i]();
    } catch (error) {
      accError = error;
    }
  }
  throw accError;
}
function returnOne(listOfPredicates, lazyDefaultValue = createDefaultEl) {
  return (input) => {
    for (let i = 0;i < listOfPredicates.length; i++) {
      if (listOfPredicates[i].predicate(input))
        return listOfPredicates[i].value(input);
    }
    return lazyDefaultValue(input);
  };
}
function createDefaultEl() {
  const defaultDiv = document.createElement("div");
  defaultDiv.innerText = "This could be a bug!!";
  return defaultDiv;
}
function success(x) {
  return {
    filter: (p) => {
      if (p(x))
        return success(x);
      return fail();
    },
    map: (t) => {
      return success(t(x));
    },
    actual: () => x
  };
}
function fail() {
  const monad = {};
  monad.filter = () => monad;
  monad.map = () => monad;
  monad.actual = (lazyError) => lazyError();
  return monad;
}
function isAlpha(str) {
  const charCode = str.charCodeAt(0);
  return charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}
function isAlphaNumeric(str) {
  const charCode = str.charCodeAt(0);
  return charCode >= 48 && charCode <= 57 || charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}

class MultiMap {
  constructor() {
    this.map = {};
  }
  put(key, value) {
    if (!this.map[key])
      this.map[key] = [];
    this.map[key].push(value);
  }
  get(key) {
    const value = this.map[key];
    return value;
  }
}

// ../node_modu
var tokenSymbol = function(symbol) {
  const sym = [...symbol];
  return {
    symbol,
    lookahead: () => sym[0],
    parse: (stream2) => {
      let s = stream2;
      let i = 0;
      while (i < sym.length) {
        if (s.peek() === sym[i]) {
          i++;
          s = s.next();
          continue;
        }
        throw new Error(`Error occurred while tokening unique symbol ${symbol} ` + s.toString());
      }
      return pair(tokenBuilder().type(symbol).text(symbol).build(), s);
    }
  };
};
var tokenRepeat = function(symbol, repeat) {
  return {
    symbol,
    lookahead: () => symbol,
    parse: (stream2) => {
      let n = repeat;
      let auxStream = stream2;
      let textArray = [];
      while (auxStream.peek() === symbol && n > 0) {
        n--;
        textArray.push(auxStream.peek());
        auxStream = auxStream.next();
      }
      const finalN = repeat - n;
      if (finalN > 0) {
        return pair(tokenBuilder().type(symbol).repeat(finalN).text(textArray.join("")).build(), auxStream);
      }
      throw new Error(`Error occurred while tokening repeated #${repeat}, with symbol ${symbol} ` + auxStream.toString());
    }
  };
};
var tokenOrderedList = function() {
  const orderedListParser = (stream2) => {
    const char = stream2.peek();
    if (Number.isNaN(Number.parseInt(char))) {
      throw new Error(`Error occurred while tokening ordered list start with symbol ${char} ` + stream2.toString());
    }
    const nextStream2 = stream2.next();
    return or(() => {
      const { left: token, right: nextNextStream } = orderedListParser(nextStream2);
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream);
    }, () => {
      const char2 = nextStream2.peek();
      if (char2 !== ".") {
        throw new Error(`Error occurred while tokening ordered list start with symbol ${char2} ` + stream2.toString());
      }
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + char2).build(), nextStream2.next());
    });
  };
  return {
    symbol: ORDER_LIST_SYMBOL,
    lookahead: () => [...Array(10)].map((_, i) => "" + i),
    parse: orderedListParser
  };
};
var orToken = function(...tokenParsers) {
  const orMap = new MultiMap;
  let defaultParsers = [];
  tokenParsers.forEach((parser) => {
    const lookaheads = parser.lookahead();
    const parse = parser.parse;
    if (!lookaheads) {
      defaultParsers.push(parse);
      return;
    }
    if (Array.isArray(lookaheads)) {
      lookaheads.forEach((lookahead) => {
        orMap.put(lookahead, parse);
      });
      return;
    }
    orMap.put(lookaheads, parse);
  });
  return (stream2) => {
    const char = stream2.peek();
    const parsers = orMap.get(char) || [];
    return or(...parsers.map((parser) => () => parser(stream2)), ...defaultParsers.map((parser) => () => parser(stream2)));
  };
};
var tokenText2 = function() {
  const tokenParserLookaheads = TOKENS_PARSERS.map(({ lookahead }) => lookahead()).map((lookaheads) => Array.isArray(lookaheads) ? lookaheads : [lookaheads]).flatMap((x) => x);
  return {
    symbol: TEXT_SYMBOL,
    lookahead: () => {
    },
    parse: (stream2) => {
      let s = stream2;
      const token = [];
      let isFirstChar = true;
      while (s.hasNext()) {
        const char = s.peek();
        if (!isFirstChar && tokenParserLookaheads.includes(char))
          break;
        token.push(char);
        s = s.next();
        isFirstChar = false;
      }
      if (!s.isEmpty()) {
        token.push(s.peek());
        s = s.next();
      }
      return pair(tokenBuilder().type(TEXT_SYMBOL).text(token.join("")).build(), s);
    }
  };
};
function tokenizer(charStream) {
  const tokenArray = [];
  let s = charStream;
  while (s.hasNext()) {
    const { left: token, right: next } = TOKEN_PARSER_FINAL(s);
    tokenArray.push(token);
    s = next;
  }
  if (!s.isEmpty())
    tokenArray.push(TOKEN_PARSER_FINAL(s).left);
  return stream(tokenArray);
}
var CUSTOM_SYMBOL = ":::";
var CODE_SYMBOL = "```";
var ORDER_LIST_SYMBOL = "order_list";
var LINE_SEPARATOR_SYMBOL = "---";
var TEXT_SYMBOL = "text";
var tokenBuilder = () => {
  let _type, _text, _repeat = 1;
  const builder = {
    type: (t) => {
      _type = t;
      return builder;
    },
    text: (t) => {
      _text = t;
      return builder;
    },
    repeat: (r) => {
      _repeat = r;
      return builder;
    },
    build: () => ({ type: _type, text: _text, repeat: _repeat })
  };
  return builder;
};
var TOKENS_PARSERS = [
  tokenRepeat("#", 6),
  tokenRepeat("$", 2),
  tokenSymbol("**"),
  tokenSymbol("_"),
  tokenSymbol(CUSTOM_SYMBOL),
  tokenSymbol("["),
  tokenSymbol("]"),
  tokenSymbol("("),
  tokenSymbol(")"),
  tokenSymbol(LINE_SEPARATOR_SYMBOL),
  tokenSymbol("-"),
  tokenSymbol(CODE_SYMBOL),
  tokenSymbol("`"),
  tokenSymbol("^"),
  tokenSymbol(":"),
  tokenSymbol("!"),
  tokenSymbol("\n"),
  tokenSymbol("\t"),
  tokenSymbol(" "),
  tokenSymbol("</"),
  tokenSymbol("<"),
  tokenSymbol(">"),
  tokenSymbol('"'),
  tokenSymbol("'"),
  tokenSymbol("="),
  tokenOrderedList()
];
var TOKEN_PARSER_FINAL = orToken(...TOKENS_PARSERS, tokenText2());
var ALL_SYMBOLS = [...TOKENS_PARSERS.map(({ symbol }) => symbol), TEXT_SYMBOL];

// ../node_modul
function parse(string) {
  const memory = {};
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const document2 = parseDocument(tokenStream);
  return document2.left;
}
var parseDocument = function(stream2) {
  return or(() => {
    const { left: paragraph, right: nextStream1 } = parseParagraph(stream2);
    const { left: document2, right: nextStream2 } = parseDocument(nextStream1);
    return pair({
      type: TYPES.document,
      paragraphs: [paragraph, ...document2.paragraphs]
    }, nextStream2);
  }, () => pair({
    type: TYPES.document,
    paragraphs: []
  }, stream2));
};
var parseParagraph = function(stream2) {
  const { left: Statement, right: nextStream2 } = parseStatement(stream2);
  if (nextStream2.peek().type === "\n") {
    return pair({
      type: TYPES.paragraph,
      Statement
    }, nextStream2.next());
  }
  throw new Error("Error occurred while parsing expression," + nextStream2.toString());
};
var parseStatement = function(stream2) {
  return or(() => {
    const { left: Title, right: nextStream2 } = parseTitle(stream2);
    return pair({ type: TYPES.statement, Title }, nextStream2);
  }, () => {
    const { left: List, right: nextStream2 } = parseList(0)(stream2);
    return pair({ type: TYPES.statement, List }, nextStream2);
  }, () => {
    const { left: MediaRefDef, right: nextStream2 } = parseMediaRefDef(stream2);
    return pair({ type: TYPES.statement, MediaRefDef }, nextStream2);
  }, () => {
    const { left: FootnoteDef, right: nextStream2 } = parseFootnoteDef(stream2);
    return pair({ type: TYPES.statement, FootnoteDef }, nextStream2);
  }, () => {
    const { left: LinkRefDef, right: nextStream2 } = parseLinkRefDef(stream2);
    return pair({ type: TYPES.statement, LinkRefDef }, nextStream2);
  }, () => {
    const { left: Break, right: nextStream2 } = parseBreak(stream2);
    return pair({ type: TYPES.statement, Break }, nextStream2);
  }, () => {
    const { left: Expression, right: nextStream2 } = parseExpression(stream2);
    return pair({ type: TYPES.statement, Expression }, nextStream2);
  });
};
var parseTitle = function(stream2) {
  if (stream2.peek().type === "#") {
    const level = stream2.peek().repeat;
    const filterNextSpace = filterSpace(stream2);
    const { left: Expression, right: nextStream2 } = parseExpression(filterNextSpace);
    return pair({ type: TYPES.title, Expression, level }, nextStream2);
  }
  throw new Error("Error occurred while parsing Title," + nextStream.toString());
};
var parseExpression = function(stream2) {
  return or(() => {
    const { left: ExpressionTypes, right: nextStream2 } = parseExpressionTypes(stream2);
    const { left: Expression, right: nextNextStream } = parseExpression(nextStream2);
    return pair({
      type: TYPES.expression,
      expressions: [ExpressionTypes, ...Expression.expressions]
    }, nextNextStream);
  }, () => pair({
    type: TYPES.expression,
    expressions: []
  }, stream2));
};
var parseExpressionTypes = function(stream2) {
  return or(() => {
    const { left: Formula, right: nextStream2 } = parseFormula(stream2);
    return pair({ type: TYPES.expressionTypes, Formula }, nextStream2);
  }, () => {
    const { left: Code, right: nextStream2 } = parseCode(stream2);
    return pair({ type: TYPES.expressionTypes, Code }, nextStream2);
  }, () => {
    const { left: Link, right: nextStream2 } = parseLink(stream2);
    return pair({ type: TYPES.expressionTypes, Link }, nextStream2);
  }, () => {
    const { left: Footnote, right: nextStream2 } = parseFootnote(stream2);
    return pair({ type: TYPES.expressionTypes, Footnote }, nextStream2);
  }, () => {
    const { left: Media, right: nextStream2 } = parseMedia(stream2);
    return pair({ type: TYPES.expressionTypes, Media }, nextStream2);
  }, () => {
    const { left: Italic, right: nextStream2 } = parseItalic(stream2);
    return pair({ type: TYPES.expressionTypes, Italic }, nextStream2);
  }, () => {
    const { left: Bold, right: nextStream2 } = parseBold(stream2);
    return pair({ type: TYPES.expressionTypes, Bold }, nextStream2);
  }, () => {
    const { left: Html, right: nextStream2 } = parseHtml(stream2);
    return pair({ type: TYPES.expressionTypes, Html }, nextStream2);
  }, () => {
    const { left: Custom, right: nextStream2 } = parseCustom(stream2);
    return pair({ type: TYPES.expressionTypes, Custom }, nextStream2);
  }, () => {
    const { left: Text, right: nextStream2 } = parseText(stream2);
    return pair({ type: TYPES.expressionTypes, Text }, nextStream2);
  });
};
var parseFormula = function(stream2) {
  const token = stream2.peek();
  const repeat = token.repeat;
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token2) => token2.type === "$")(stream2.next());
    const nextToken = nextStream2.peek();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair({
        type: TYPES.formula,
        equation: AnyBut.textArray.join(""),
        isInline: nextToken?.repeat === 1
      }, nextStream2.next());
    }
  }
  throw new Error("Error occurred while parsing Formula," + stream2.toString());
};
var parseAnyBut = function(tokenPredicate) {
  return (stream2) => {
    return or(() => {
      const peek = stream2.peek();
      if (!tokenPredicate(peek)) {
        const { left: AnyBut, right: nextStream2 } = parseAnyBut(tokenPredicate)(stream2.next());
        return pair({ type: TYPES.anyBut, textArray: [peek.text, ...AnyBut.textArray] }, nextStream2);
      }
      throw new Error("Error occurred while parsing AnyBut," + stream2.toString());
    }, () => pair({ type: TYPES.anyBut, textArray: [] }, stream2));
  };
};
var parseCode = function(stream2) {
  return or(() => {
    const { left: LineCode, right: nextStream2 } = parseLineCode(stream2);
    return pair({ type: TYPES.code, LineCode }, nextStream2);
  }, () => {
    const { left: BlockCode, right: nextStream2 } = parseBlockCode(stream2);
    return pair({ type: TYPES.code, BlockCode }, nextStream2);
  });
};
var parseLineCode = function(stream2) {
  const lineCodeTokenPredicate = (t) => t.type === "`";
  const token = stream2.peek();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((t) => lineCodeTokenPredicate(t))(stream2.next());
    if (lineCodeTokenPredicate(nextStream2.peek())) {
      return pair({ type: TYPES.lineCode, code: AnyBut.textArray.join("") }, nextStream2.next());
    }
  }
  throw new Error("Error occurred while parsing LineCode," + stream2.toString());
};
var parseBlockCode = function(stream2) {
  const blockCodeTokenPredicate = (t) => t.type === CODE_SYMBOL;
  const token = stream2.peek();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream2 } = parseAnyBut((t) => t.type === "\n")(stream2.next());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream2.next());
    if (blockCodeTokenPredicate(nextNextStream.peek())) {
      return pair({
        type: TYPES.blockCode,
        code: AnyBut.textArray.join(""),
        language: languageAnyBut.textArray.join("")
      }, nextNextStream.next());
    }
  }
  throw new Error("Error occurred while parsing BlockCode," + stream2.toString());
};
var parseLink = function(stream2) {
  return or(() => {
    const { left: AnonLink, right: nextStream2 } = parseAnonLink(stream2);
    return pair({ type: TYPES.link, AnonLink }, nextStream2);
  }, () => {
    const { left: LinkRef, right: nextStream2 } = parseLinkRef(stream2);
    return pair({ type: TYPES.link, LinkRef }, nextStream2);
  });
};
var parseAnonLink = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseLinkExpression(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === "]";
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.next().peek();
    return token.type === "(";
  }).map(({ left: LinkExpression, right: nextStream2 }) => {
    const { left: AnyBut, right: nextStream22 } = parseAnyBut((token) => token.type === ")")(nextStream2.next().next());
    return { LinkExpression, AnyBut, nextStream: nextStream22 };
  }).filter(({ nextStream: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === ")";
  }).map(({ LinkExpression, AnyBut, nextStream: nextStream2 }) => {
    return pair({
      type: TYPES.anonlink,
      LinkExpression,
      link: AnyBut.textArray.join("")
    }, nextStream2.next());
  }).actual(() => {
    throw new Error("Error occurred while parsing AnonLink," + nextStream.toString());
  });
};
var parseLinkExpression = function(stream2) {
  return or(() => {
    const { left: LinkTypes, right: nextStream2 } = parseLinkTypes(stream2);
    const { left: LinkExpression, right: nextNextStream } = parseLinkExpression(nextStream2);
    return pair({
      type: TYPES.linkExpression,
      expressions: [LinkTypes, ...LinkExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.linkExpression, expressions: [] }, stream2));
};
var parseLinkTypes = function(stream2) {
  return or(() => {
    const { left: Formula, right: nextStream2 } = parseFormula(stream2);
    return pair({ type: TYPES.linkTypes, Formula }, nextStream2);
  }, () => {
    const { left: Html, right: nextStream2 } = parseHtml(stream2);
    return pair({ type: TYPES.linkTypes, Html }, nextStream2);
  }, () => {
    const { left: Code, right: nextStream2 } = parseCode(stream2);
    return pair({ type: TYPES.linkTypes, Code }, nextStream2);
  }, () => {
    const { left: Italic, right: nextStream2 } = parseItalic(stream2);
    return pair({ type: TYPES.linkTypes, Italic }, nextStream2);
  }, () => {
    const { left: Bold, right: nextStream2 } = parseBold(stream2);
    return pair({ type: TYPES.linkTypes, Bold }, nextStream2);
  }, () => {
    const { left: Custom, right: nextStream2 } = parseCustom(stream2);
    return pair({ type: TYPES.linkTypes, Custom }, nextStream2);
  }, () => {
    const { left: Media, right: nextStream2 } = parseMedia(stream2);
    return pair({ type: TYPES.linkTypes, Media }, nextStream2);
  }, () => {
    const { left: SingleBut, right: nextStream2 } = parseSingleBut((token) => ["\n", "]"].includes(token.type))(stream2);
    return pair({ type: TYPES.linkTypes, SingleBut }, nextStream2);
  });
};
var parseLinkRef = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseLinkExpression(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === "]";
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.next().peek();
    return token.type === "[";
  }).map(({ left: LinkExpression, right: nextStream2 }) => {
    const { left: AnyBut, right: nextStream22 } = parseAnyBut((token) => token.type === "]")(nextStream2.next().next());
    return { LinkExpression, AnyBut, nextStream: nextStream22 };
  }).filter(({ nextStream: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === "]";
  }).map(({ LinkExpression, AnyBut, nextStream: nextStream2 }) => {
    return pair({
      type: TYPES.linkRef,
      LinkExpression,
      linkRef: AnyBut.textArray.join("")
    }, nextStream2.next());
  }).actual(() => {
    throw new Error("Error occurred while parsing LinkRef," + nextStream.toString());
  });
};
var parseLinkRefDef = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseAnyBut((token) => token.type === "]")(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.next().peek();
    return token.type === ":";
  }).map(({ left: AnyButRef, right: nextStream2 }) => {
    const nextStream22 = filterSpace(nextStream2.next());
    const { left: AnyButDef, right: nextStream3 } = parseAnyBut((token) => token.type === "\n")(nextStream22);
    return pair({
      type: TYPES.linkRefDef,
      linkRef: AnyButRef.textArray.join(""),
      linkRefDef: AnyButDef.textArray.join("")
    }, nextStream3);
  }).actual(() => {
    throw new Error("Error occurred while parsing LinkRefDef," + nextStream.toString());
  });
};
var parseFootnote = function(stream2) {
  if (stream2.peek().type === "[") {
    const nextStream2 = stream2.next();
    if (nextStream2.peek().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "]")(nextStream2.next());
      return pair({ type: TYPES.footnote, footnote: AnyBut.textArray.join("") }, nextStream1.next());
    }
  }
  throw new Error("Error occurred while parsing Footnote," + stream2.toString());
};
var parseFootnoteDef = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "[";
  }).map((nextStream2) => {
    const token = nextStream2.next();
    return token.type === "^";
  }).map((nextStream2) => {
    return parseAnyBut((token) => token.type === "]")(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.next().peek();
    return token.type === ":";
  }).map(({ left: AnyBut, right: nextStream2 }) => {
    const nextStream22 = filterSpace(nextStream2.next());
    const { left: Expression, right: nextStream3 } = parseExpression(nextStream22);
    return pair({
      type: TYPES.footnoteDef,
      footnote: AnyBut.textArray.join(""),
      Expression
    }, nextStream3);
  }).actual(() => {
    throw new Error("Error occurred while parsing FootnoteDef," + stream2.toString());
  });
};
var parseItalic = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "_";
  }).map((nextStream2) => {
    return parseItalicType(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === "_";
  }).map(({ left: ItalicType, right: nextStream2 }) => {
    return pair({ type: TYPES.italic, ItalicType }, nextStream2.next());
  }).actual(() => {
    throw new Error("Error occurred while parsing Italic," + nextStream.toString());
  });
};
var parseItalicType = function(stream2) {
  return or(() => {
    const { left: Bold, right: nextStream2 } = parseBold(stream2);
    return pair({ type: TYPES.italicType, Bold }, nextStream2);
  }, () => {
    const { left: Link, right: nextStream2 } = parseLink(stream2);
    return pair({ type: TYPES.italicType, Link }, nextStream2);
  }, () => {
    const { left: Text, right: nextStream2 } = parseText(stream2);
    return pair({ type: TYPES.italicType, Text }, nextStream2);
  }, () => {
    throw new Error("Error occurred while parsing ItalicType," + stream2.toString());
  });
};
var parseBold = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.peek();
    return token.type === "**";
  }).map((nextStream2) => {
    return parseBoldType(nextStream2.next());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.peek();
    return token.type === "**";
  }).map(({ left: BoldType, right: nextStream2 }) => {
    return pair({ type: TYPES.bold, BoldType }, nextStream2.next());
  }).actual(() => {
    throw new Error("Error occurred while parsing Bold," + nextStream.toString());
  });
};
var parseBoldType = function(stream2) {
  return or(() => {
    const { left: Italic, right: nextStream2 } = parseItalic(stream2);
    return pair({ type: TYPES.boldType, Italic }, nextStream2);
  }, () => {
    const { left: Link, right: nextStream2 } = parseLink(stream2);
    return pair({ type: TYPES.boldType, Link }, nextStream2);
  }, () => {
    const { left: Text, right: nextStream2 } = parseText(stream2);
    return pair({ type: TYPES.boldType, Text }, nextStream2);
  }, () => {
    throw new Error("Error occurred while parsing BoldType," + stream2.toString());
  });
};
var parseMedia = function(stream2) {
  const token = stream2.peek();
  if (token.type === "!") {
    const { left: Link, right: nextStream2 } = parseLink(stream2.next());
    return pair({ type: TYPES.media, Link }, nextStream2);
  }
};
var parseMediaRefDef = function(stream2) {
  const token = stream2.peek();
  if (token.type === "!") {
    const { left: LinkRefDef, right: nextStream2 } = parseLinkRefDef(stream2.next());
    return pair({ type: TYPES.mediaRefDef, LinkRefDef }, nextStream2);
  }
};
var parseCustom = function(stream2) {
  if (stream2.peek().type === "[") {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === "]")(stream2.next());
    const nextStream1 = nextStream2.next();
    if (nextStream1.peek().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream22 } = parseAnyBut((token) => CUSTOM_SYMBOL === token.type)(nextStream1.next());
      return pair({
        type: TYPES.custom,
        key: AnyBut.textArray.join(""),
        value: AnyButCustom.textArray.join("")
      }, nextStream22.next());
    }
  }
  throw new Error("Error occurred while parsing Custom," + stream2.toString());
};
var parseText = function(stream2) {
  return or(() => {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((t) => !(t.type === TEXT_SYMBOL || t.type === " "))(stream2);
    if (AnyBut.textArray.length > 0) {
      return pair({ type: "text", text: AnyBut.textArray.join("") }, nextStream2);
    }
    throw new Error("Error occurred while parsing Text," + stream2.toString());
  }, () => {
    const token = stream2.peek();
    if (token.type !== "\n") {
      return pair({ type: TYPES.text, text: stream2.peek().text }, stream2.next());
    }
    throw new Error("Error occurred while parsing Text" + stream2.toString());
  });
};
var parseList = function(n) {
  return function(stream2) {
    return or(() => {
      const { left: UList, right: nextStream2 } = parseUList(n)(stream2);
      return pair({ type: TYPES.list, UList }, nextStream2);
    }, () => {
      const { left: OList, right: nextStream2 } = parseOList(n)(stream2);
      return pair({ type: TYPES.list, OList }, nextStream2);
    });
  };
};
var parseUList = function(n) {
  return function(stream2) {
    return or(() => {
      const { left: ListItem, right: stream1 } = parseListItem(n, "-")(stream2);
      const { left: UList, right: stream22 } = parseUList(n)(stream1);
      return pair({
        type: TYPES.ulist,
        list: [ListItem, ...UList.list]
      }, stream22);
    }, () => {
      const { left: ListItem, right: stream1 } = parseListItem(n, "-")(stream2);
      return pair({ type: TYPES.ulist, list: [ListItem] }, stream1);
    });
  };
};
var parseOList = function(n) {
  return function(stream2) {
    return or(() => {
      const { left: ListItem, right: stream1 } = parseListItem(n, ORDER_LIST_SYMBOL)(stream2);
      const { left: OList, right: stream22 } = parseOList(n)(stream1);
      return pair({
        type: TYPES.olist,
        list: [ListItem, ...OList.list]
      }, stream22);
    }, () => {
      const { left: ListItem, right: stream1 } = parseListItem(n, ORDER_LIST_SYMBOL)(stream2);
      return pair({ type: TYPES.olist, list: [ListItem] }, stream1);
    });
  };
};
var parseListItem = function(n, λ) {
  return function(stream2) {
    const stream1 = or(() => eatSymbol(2 * n, (s) => s.peek().text === " ")(stream2), () => eatSymbol(n, (s) => s.peek().text === " " || s.peek().text === "/t")(stream2));
    const token = stream1.peek();
    if (token.type === λ) {
      const filterNextSpace = filterSpace(stream1);
      const { left: Expression, right: stream22 } = parseExpression(filterNextSpace);
      const token1 = stream22.peek();
      if (token1.type === "\n") {
        return or(() => {
          const { left: List, right: stream3 } = parseList(n + 1)(stream22.next());
          return pair({
            type: TYPES.listItem,
            Expression,
            children: List
          }, stream3);
        }, () => {
          return pair({
            type: TYPES.listItem,
            Expression,
            children: []
          }, stream22.next());
        });
      }
    }
    throw new Error(`Error occurred while parsing ListItem(${n}, ${λ})`, stream2.toString());
  };
};
var parseBreak = function(stream2) {
  const token = stream2.peek();
  if (token.type === LINE_SEPARATOR_SYMBOL) {
    return pair({ type: TYPES.break }, stream2.next());
  }
};
var parseSingleBut = function(tokenPredicate) {
  return (stream2) => {
    const token = stream2.peek();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: TYPES.singleBut, text }, stream2.next());
    }
    throw new Error("Error occurred while parsing Single," + stream2.toString());
  };
};
var parseHtml = function(stream2) {
  try {
    const { left: StartTag, right: nextStream1 } = parseStartTag(stream2);
    const { left: InnerHtml, right: nextStream2 } = parseInnerHtml(nextStream1);
    const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
    return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3);
  } catch (e2) {
    throw new Error(`Error occurred while parsing HTML, ${JSON.stringify(e2)}` + stream2.toString());
  }
};
var parseStartTag = function(stream2) {
  const token = stream2.peek();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream2.next());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if (nextStream5.peek().type === ">") {
      return pair({ type: TYPES.startTag, tag: tagName.text, Attrs }, nextStream5.next());
    }
  }
  throw new Error(`Error occurred while parsing StartTag, ${JSON.stringify(e)}` + stream2.toString());
};
function parseAlphaNumName(tokenStream) {
  tokenStream.log();
  const strBuffer = [];
  let charStream = stream(tokenStream.peek().text);
  if (!isAlpha(charStream.peek()))
    throw new Error(`Error occurred while parsing AlphaNumName, ${tokenText.text}` + tokenStream.toString);
  strBuffer.push(charStream.peek());
  while (charStream.hasNext() && isAlphaNumeric(charStream.next().peek())) {
    charStream = charStream.next();
    strBuffer.push(charStream.peek());
  }
  console.log("debug ", strBuffer);
  charStream.log();
  return pair({ type: TYPES.alphaNumName, text: strBuffer.join("") }, tokenStream.next());
}
var parseAttrs = function(stream2) {
  return or(() => {
    const { left: Attr, right: nextStream2 } = parseAttr(stream2);
    const nextStreamNoSpaces = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream1 } = parseAttrs(nextStreamNoSpaces);
    return pair({
      type: TYPES.attrs,
      attributes: [Attr, ...Attrs.attributes]
    }, nextStream1);
  }, () => {
    return pair({
      type: TYPES.attrs,
      attributes: []
    }, stream2);
  });
};
var parseAttr = function(stream2) {
  return or(() => {
    return success(stream2).map((nextStream2) => {
      return parseAlphaNumName(nextStream2);
    }).filter(({ left: _, right: nextStream2 }) => {
      return nextStream2.peek().type === "=" && nextStream2.next().peek().type === '"';
    }).map(({ left: attrName, right: nextStream2 }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === '"')(nextStream2.next().next());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.next());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  }, () => {
    return success(stream2).map((nextStream2) => {
      return parseAlphaNumName(nextStream2);
    }).filter(({ left: _, right: nextStream2 }) => {
      return nextStream2.peek().type === "=" && nextStream2.next().peek().type === "'";
    }).map(({ left: attrName, right: nextStream2 }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "'")(nextStream2.next().next());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.next());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  });
};
var parseInnerHtml = function(innerHtmlStream) {
  return or(() => {
    const { left: Html, right: nextStream2 } = parseHtml(innerHtmlStream);
    return pair({ type: TYPES.innerHtml, Html }, nextStream2);
  }, () => {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === "</")(innerHtmlStream);
    const nablaTxt = AnyBut.textArray.join("");
    const Document = parse(nablaTxt);
    if (Document.paragraphs.length > 0) {
      return pair({ type: TYPES.innerHtml, Document }, nextStream2);
    }
    const { left: Expression } = parseExpression(tokenizer(stream(nablaTxt)));
    return pair({
      type: TYPES.innerHtml,
      Expression
    }, nextStream2);
  });
};
var parseEndTag = function(stream2) {
  const token = stream2.peek();
  if (token.type === "</") {
    const nextStream1 = eatSpaces(stream2.next());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    if (nextStream3.peek().type === ">") {
      return pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.next());
    }
  }
  throw new Error(`Error occurred while parsing EndTag, ${JSON.stringify(e)}` + stream2.toString());
};
var filterSpace = function(stream2) {
  const nextTokenStream = stream2.next();
  return nextTokenStream.peek().type === " " ? nextTokenStream.next() : nextTokenStream;
};
var TYPES = {
  document: "document",
  paragraph: "paragraph",
  statement: "statement",
  title: "title",
  expression: "expression",
  expressionTypes: "expressionTypes",
  formula: "formula",
  anyBut: "anyBut",
  code: "code",
  lineCode: "lineCode",
  blockCode: "blockCode",
  link: "link",
  anonlink: "anonlink",
  linkExpression: "linkExpression",
  linkTypes: "linkTypes",
  linkRef: "linkRef",
  linkRefDef: "linkRefDef",
  footnote: "footnote",
  footnoteDef: "footnoteDef",
  italic: "italic",
  italicType: "italicType",
  bold: "bold",
  boldType: "boldType",
  media: "media",
  mediaRefDef: "mediaRefDef",
  custom: "custom",
  text: "text",
  list: "list",
  ulist: "ulist",
  olist: "olist",
  listItem: "listItem",
  break: "break",
  singleBut: "singleBut",
  html: "html",
  startTag: "startTag",
  innerHtml: "innerHtml",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs"
};
export {
  parseAlphaNumName,
  parse,
  TYPES
};
