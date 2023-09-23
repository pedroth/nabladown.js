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

// ../node_modules/h
function buildDom(nodeType) {
  const domNode = {};
  const attrs = [];
  const events = [];
  const children = [];
  const lazyActions = [];
  let innerHtml = "";
  domNode.appendChild = (node) => {
    children.push(node);
    return domNode;
  };
  domNode.inner = (content) => {
    innerHtml = content;
    return domNode;
  };
  domNode.attr = (attribute, value) => {
    attrs.push({ attribute, value });
    return domNode;
  };
  domNode.event = (eventType, lambda) => {
    events.push({ eventType, lambda });
    return domNode;
  };
  domNode.lazy = (lazyAction) => {
    lazyActions.push(lazyAction);
    return domNode;
  };
  domNode.build = () => {
    const dom = document.createElement(nodeType);
    attrs.forEach((attr) => dom.setAttribute(attr.attribute, attr.value));
    events.forEach((event) => dom.addEventListener(event.eventType, event.lambda));
    if (children.length > 0) {
      children.forEach((child) => dom.appendChild(child.build()));
    } else {
      dom.innerHTML = innerHtml;
    }
    lazyActions.forEach((lazyAction) => lazyAction(dom));
    return dom;
  };
  domNode.toString = () => {
    const domArray = [];
    domArray.push(`<${nodeType} `);
    domArray.push(...attrs.map((attr) => `${attr.attribute}="${attr.value}"`));
    domArray.push(`>`);
    if (children.length > 0) {
      domArray.push(...children.map((child) => child.toString()));
    } else {
      domArray.push(innerHtml);
    }
    domArray.push(`</${nodeType}>`);
    return domArray.join("");
  };
  domNode.getChildren = () => children;
  domNode.isEmpty = () => children.length === 0 && innerHtml === "";
  return domNode;
}

// ../node_modu
function pair(a, b) {
  return { left: a, right: b };
}
function stream(stringOrArray) {
  const array = [...stringOrArray];
  return {
    head: () => array[0],
    tail: () => stream(array.slice(1)),
    take: (n) => stream(array.slice(n)),
    isEmpty: () => array.length === 0,
    toString: () => array.map((s) => typeof s === "string" ? s : JSON.stringify(s)).join(""),
    filter: (predicate) => stream(array.filter(predicate)),
    log: () => {
      let s = stream(array);
      while (!s.isEmpty()) {
        console.log(s.head());
        s = s.tail();
      }
    }
  };
}
function eatNSymbol(n, symbolPredicate) {
  return function(stream2) {
    if (n === 0)
      return stream2;
    if (symbolPredicate(stream2)) {
      return eatNSymbol(n - 1, symbolPredicate)(stream2.tail());
    }
    throw new Error(`Caught error while eating ${n} symbols`, stream2.toString());
  };
}
function eatSpaces(tokenStream) {
  return eatSymbols(tokenStream, (s) => s.type === " ");
}
function eatSymbols(tokenStream, predicate) {
  let s = tokenStream;
  while (!tokenStream.isEmpty()) {
    if (!predicate(s.head()))
      break;
    s = s.tail();
  }
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
  const defaultDiv = buildDom("div");
  defaultDiv.inner("This could be a bug!!");
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
function isNumeric(str) {
  const charCode = str.charCodeAt(0);
  return charCode >= 48 && charCode <= 57;
}
function isAlphaNumeric(str) {
  return isAlpha(str) || isNumeric(str);
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
        if (s.head() === sym[i]) {
          i++;
          s = s.tail();
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
      while (auxStream.head() === symbol && n > 0) {
        n--;
        textArray.push(auxStream.head());
        auxStream = auxStream.tail();
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
    const char = stream2.head();
    if (Number.isNaN(Number.parseInt(char))) {
      throw new Error(`Error occurred while tokening ordered list start with symbol ${char} ` + stream2.toString());
    }
    const nextStream2 = stream2.tail();
    return or(() => {
      const { left: token, right: nextNextStream } = orderedListParser(nextStream2);
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream);
    }, () => {
      const char2 = nextStream2.head();
      if (char2 !== ".") {
        throw new Error(`Error occurred while tokening ordered list start with symbol ${char2} ` + stream2.toString());
      }
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + char2).build(), nextStream2.tail());
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
    const char = stream2.head();
    const parsers = orMap.get(char) || [];
    return or(...parsers.map((parser) => () => parser(stream2)), ...defaultParsers.map((parser) => () => parser(stream2)));
  };
};
var tokenText = function() {
  const tokenParserLookaheads = TOKENS_PARSERS.map(({ lookahead }) => lookahead()).map((lookaheads) => Array.isArray(lookaheads) ? lookaheads : [lookaheads]).flatMap((x) => x);
  return {
    symbol: TEXT_SYMBOL,
    lookahead: () => {
    },
    parse: (stream2) => {
      let s = stream2;
      const token = [];
      let isFirstChar = true;
      while (!s.isEmpty()) {
        const char = s.head();
        if (!isFirstChar && tokenParserLookaheads.includes(char))
          break;
        token.push(char);
        s = s.tail();
        isFirstChar = false;
      }
      return pair(tokenBuilder().type(TEXT_SYMBOL).text(token.join("")).build(), s);
    }
  };
};
function tokenizer(charStream) {
  const tokenArray = [];
  let s = charStream;
  while (!s.isEmpty()) {
    const { left: token, right: next } = TOKEN_PARSER_FINAL(s);
    tokenArray.push(token);
    s = next;
  }
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
  tokenSymbol("/>"),
  tokenSymbol("<"),
  tokenSymbol(">"),
  tokenSymbol('"'),
  tokenSymbol("'"),
  tokenSymbol("="),
  tokenOrderedList()
];
var TOKEN_PARSER_FINAL = orToken(...TOKENS_PARSERS, tokenText());
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
  if (nextStream2.head().type === "\n") {
    return pair({
      type: TYPES.paragraph,
      Statement
    }, nextStream2.tail());
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
  if (stream2.head().type === "#") {
    const level = stream2.head().repeat;
    const filterNextSpace = filterSpace(stream2);
    const { left: Expression, right: nextStream2 } = parseExpression(filterNextSpace);
    return pair({ type: TYPES.title, Expression, level }, nextStream2);
  }
  throw new Error("Error occurred while parsing Title," + nextStream.toString());
};
function parseExpression(stream2) {
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
}
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
  const token = stream2.head();
  const repeat = token.repeat;
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token2) => token2.type === "$")(stream2.tail());
    const nextToken = nextStream2.head();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair({
        type: TYPES.formula,
        equation: AnyBut.textArray.join(""),
        isInline: nextToken?.repeat === 1
      }, nextStream2.tail());
    }
  }
  throw new Error("Error occurred while parsing Formula," + stream2.toString());
};
var parseAnyBut = function(tokenPredicate) {
  return (stream2) => {
    return or(() => {
      const peek = stream2.head();
      if (!tokenPredicate(peek)) {
        const { left: AnyBut, right: nextStream2 } = parseAnyBut(tokenPredicate)(stream2.tail());
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
  const token = stream2.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((t) => lineCodeTokenPredicate(t))(stream2.tail());
    if (lineCodeTokenPredicate(nextStream2.head())) {
      return pair({ type: TYPES.lineCode, code: AnyBut.textArray.join("") }, nextStream2.tail());
    }
  }
  throw new Error("Error occurred while parsing LineCode," + stream2.toString());
};
var parseBlockCode = function(stream2) {
  const blockCodeTokenPredicate = (t) => t.type === CODE_SYMBOL;
  const token = stream2.head();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream2 } = parseAnyBut((t) => t.type === "\n")(stream2.tail());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream2.tail());
    if (blockCodeTokenPredicate(nextNextStream.head())) {
      return pair({
        type: TYPES.blockCode,
        code: AnyBut.textArray.join(""),
        language: languageAnyBut.textArray.join("")
      }, nextNextStream.tail());
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
    const token = nextStream2.head();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseLinkExpression(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === "]";
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.tail().head();
    return token.type === "(";
  }).map(({ left: LinkExpression, right: nextStream2 }) => {
    const { left: AnyBut, right: nextStream22 } = parseAnyBut((token) => token.type === ")")(nextStream2.tail().tail());
    return { LinkExpression, AnyBut, nextStream: nextStream22 };
  }).filter(({ nextStream: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === ")";
  }).map(({ LinkExpression, AnyBut, nextStream: nextStream2 }) => {
    return pair({
      type: TYPES.anonlink,
      LinkExpression,
      link: AnyBut.textArray.join("")
    }, nextStream2.tail());
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
    const token = nextStream2.head();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseLinkExpression(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === "]";
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.tail().head();
    return token.type === "[";
  }).map(({ left: LinkExpression, right: nextStream2 }) => {
    const { left: AnyBut, right: nextStream22 } = parseAnyBut((token) => token.type === "]")(nextStream2.tail().tail());
    return { LinkExpression, AnyBut, nextStream: nextStream22 };
  }).filter(({ nextStream: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === "]";
  }).map(({ LinkExpression, AnyBut, nextStream: nextStream2 }) => {
    return pair({
      type: TYPES.linkRef,
      LinkExpression,
      linkRef: AnyBut.textArray.join("")
    }, nextStream2.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing LinkRef," + nextStream.toString());
  });
};
var parseLinkRefDef = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.head();
    return token.type === "[";
  }).map((nextStream2) => {
    return parseAnyBut((token) => token.type === "]")(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.tail().head();
    return token.type === ":";
  }).map(({ left: AnyButRef, right: nextStream2 }) => {
    const nextStream22 = filterSpace(nextStream2.tail());
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
  if (stream2.head().type === "[") {
    const nextStream2 = stream2.tail();
    if (nextStream2.head().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "]")(nextStream2.tail());
      return pair({ type: TYPES.footnote, footnote: AnyBut.textArray.join("") }, nextStream1.tail());
    }
  }
  throw new Error("Error occurred while parsing Footnote," + stream2.toString());
};
var parseFootnoteDef = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.head();
    return token.type === "[";
  }).map((nextStream2) => {
    const token = nextStream2.tail();
    return token.type === "^";
  }).map((nextStream2) => {
    return parseAnyBut((token) => token.type === "]")(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.tail().head();
    return token.type === ":";
  }).map(({ left: AnyBut, right: nextStream2 }) => {
    const nextStream22 = filterSpace(nextStream2.tail());
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
    const token = nextStream2.head();
    return token.type === "_";
  }).map((nextStream2) => {
    return parseItalicExpression(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === "_";
  }).map(({ left: ItalicExpression, right: nextStream2 }) => {
    return pair({ type: TYPES.italic, ItalicExpression }, nextStream2.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing Italic," + nextStream.toString());
  });
};
var parseItalicExpression = function(stream2) {
  return or(() => {
    const { left: ItalicType, right: nextStream2 } = parseItalicType(stream2);
    const { left: ItalicExpression, right: nextNextStream } = parseItalicExpression(nextStream2);
    return pair({
      type: TYPES.italicExpression,
      expressions: [ItalicType, ...ItalicExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.italicExpression, expressions: [] }, stream2));
};
var parseItalicType = function(stream2) {
  return or(() => {
    const { left: Bold, right: nextStream2 } = parseBold(stream2);
    return pair({ type: TYPES.italicType, Bold }, nextStream2);
  }, () => {
    const { left: Link, right: nextStream2 } = parseLink(stream2);
    return pair({ type: TYPES.italicType, Link }, nextStream2);
  }, () => {
    const { left: SingleBut, right: nextStream2 } = parseSingleBut((token) => ["\n", "_"].includes(token.type))(stream2);
    return pair({ type: TYPES.italicType, SingleBut }, nextStream2);
  });
};
var parseBold = function(stream2) {
  return success(stream2).filter((nextStream2) => {
    const token = nextStream2.head();
    return token.type === "**";
  }).map((nextStream2) => {
    return parseBoldExpression(nextStream2.tail());
  }).filter(({ _, right: nextStream2 }) => {
    const token = nextStream2.head();
    return token.type === "**";
  }).map(({ left: BoldExpression, right: nextStream2 }) => {
    return pair({ type: TYPES.bold, BoldExpression }, nextStream2.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing Bold," + nextStream.toString());
  });
};
var parseBoldExpression = function(stream2) {
  return or(() => {
    const { left: BoldType, right: nextStream2 } = parseBoldType(stream2);
    const { left: BoldExpression, right: nextNextStream } = parseBoldExpression(nextStream2);
    return pair({
      type: TYPES.BoldExpression,
      expressions: [BoldType, ...BoldExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.boldExpression, expressions: [] }, stream2));
};
var parseBoldType = function(stream2) {
  return or(() => {
    const { left: Italic, right: nextStream2 } = parseItalic(stream2);
    return pair({ type: TYPES.boldType, Italic }, nextStream2);
  }, () => {
    const { left: Link, right: nextStream2 } = parseLink(stream2);
    return pair({ type: TYPES.boldType, Link }, nextStream2);
  }, () => {
    const { left: SingleBut, right: nextStream2 } = parseSingleBut((token) => ["\n", "**"].includes(token.type))(stream2);
    return pair({ type: TYPES.boldType, SingleBut }, nextStream2);
  });
};
var parseMedia = function(stream2) {
  const token = stream2.head();
  if (token.type === "!") {
    const { left: Link, right: nextStream2 } = parseLink(stream2.tail());
    return pair({ type: TYPES.media, Link }, nextStream2);
  }
};
var parseMediaRefDef = function(stream2) {
  const token = stream2.head();
  if (token.type === "!") {
    const { left: LinkRefDef, right: nextStream2 } = parseLinkRefDef(stream2.tail());
    return pair({ type: TYPES.mediaRefDef, LinkRefDef }, nextStream2);
  }
};
var parseCustom = function(stream2) {
  if (stream2.head().type === "[") {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === "]")(stream2.tail());
    const nextStream1 = nextStream2.tail();
    if (nextStream1.head().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream22 } = parseAnyBut((token) => CUSTOM_SYMBOL === token.type)(nextStream1.tail());
      return pair({
        type: TYPES.custom,
        key: AnyBut.textArray.join(""),
        value: AnyButCustom.textArray.join("")
      }, nextStream22.tail());
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
    const token = stream2.head();
    if (token.type !== "\n") {
      return pair({ type: TYPES.text, text: stream2.head().text }, stream2.tail());
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
    const stream1 = or(() => eatNSymbol(2 * n, (s) => s.head().text === " ")(stream2), () => eatNSymbol(n, (s) => s.head().text === " " || s.head().text === "/t")(stream2));
    const token = stream1.head();
    if (token.type === λ) {
      const filterNextSpace = filterSpace(stream1);
      const { left: Expression, right: stream22 } = parseExpression(filterNextSpace);
      const token1 = stream22.head();
      if (token1.type === "\n") {
        return or(() => {
          const { left: List, right: stream3 } = parseList(n + 1)(stream22.tail());
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
          }, stream22.tail());
        });
      }
    }
    throw new Error(`Error occurred while parsing ListItem(${n}, ${λ})`, stream2.toString());
  };
};
var parseBreak = function(stream2) {
  const token = stream2.head();
  if (token.type === LINE_SEPARATOR_SYMBOL) {
    return pair({ type: TYPES.break }, stream2.tail());
  }
};
var parseSingleBut = function(tokenPredicate) {
  return (stream2) => {
    const token = stream2.head();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: TYPES.singleBut, text }, stream2.tail());
    }
    throw new Error("Error occurred while parsing Single," + stream2.toString());
  };
};
var parseHtml = function(stream2) {
  return or(() => {
    const { left: StartTag, right: nextStream1 } = parseStartTag(stream2);
    const { left: InnerHtml, right: nextStream2 } = parseInnerHtml(nextStream1);
    const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
    return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3);
  }, () => {
    const { left: EmptyTag, right: nextStream2 } = parseEmptyTag(stream2);
    return pair({ type: TYPES.html, EmptyTag }, nextStream2);
  });
};
var parseStartTag = function(stream2) {
  const token = stream2.head();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream2.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if (nextStream5.head().type === ">") {
      return pair({ type: TYPES.startTag, tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error(`Error occurred while parsing StartTag, ${JSON.stringify(e)}` + stream2.toString());
};
var parseEmptyTag = function(stream2) {
  const token = stream2.head();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream2.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if (nextStream5.head().type === "/>") {
      return pair({ type: TYPES.emptyTag, tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error(`Error occurred while parsing EmptyTag, ${JSON.stringify(e)}` + stream2.toString());
};
function parseAlphaNumName(tokenStream) {
  const strBuffer = [];
  let s = tokenStream;
  if (isNumeric(s.head().text))
    throw new Error(`Error occurred while parsing AlphaNumName, ${s.head().text}`);
  while (!s.isEmpty()) {
    const string = parseCharAlphaNumName(stream(s.head().text));
    if (string === "")
      break;
    strBuffer.push(string);
    s = s.tail();
  }
  if (strBuffer.length === 0)
    throw new Error(`Error occurred while parsing AlphaNumName, ${tokenStream.toString()}`);
  return pair({ type: TYPES.alphaNumName, text: strBuffer.join("") }, s);
}
var parseCharAlphaNumName = function(charStream) {
  const strBuffer = [];
  while (!charStream.isEmpty() && isAlphaNumeric(charStream.head())) {
    strBuffer.push(charStream.head());
    charStream = charStream.tail();
  }
  return strBuffer.join("");
};
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
      return nextStream2.head().type === "=" && nextStream2.tail().head().type === '"';
    }).map(({ left: attrName, right: nextStream2 }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === '"')(nextStream2.tail().tail());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.tail());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  }, () => {
    return success(stream2).map((nextStream2) => {
      return parseAlphaNumName(nextStream2);
    }).filter(({ left: _, right: nextStream2 }) => {
      return nextStream2.head().type === "=" && nextStream2.tail().head().type === "'";
    }).map(({ left: attrName, right: nextStream2 }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "'")(nextStream2.tail().tail());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.tail());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  });
};
var parseInnerHtml = function(innerHtmlStream) {
  return or(() => {
    const filteredStream = eatSymbols(innerHtmlStream, (token) => token.type === " " || token.type === "\t" || token.type === "\n");
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === "</" || token.type === "<")(filteredStream);
    const nablaTxt = AnyBut.textArray.join("").trim();
    if (nablaTxt === "")
      throw new Error(`Error occurred while parsing InnerHtml, ${innerHtmlStream.toString()}`);
    const { left: InnerHtml, right: nextStream1 } = parseInnerHtml(nextStream2);
    return pair({
      type: TYPES.innerHtml,
      text: nablaTxt,
      innerHtmls: [InnerHtml, ...InnerHtml.innerHtmls]
    }, nextStream1);
  }, () => {
    const filteredStream = eatSymbols(innerHtmlStream, (token) => token.type === " " || token.type === "\t" || token.type === "\n");
    const { left: Html, right: nextStream2 } = parseHtml(filteredStream);
    const { left: InnerHtml, right: nextStream1 } = parseInnerHtml(nextStream2);
    return pair({
      type: TYPES.innerHtml,
      Html,
      innerHtmls: [InnerHtml, ...InnerHtml.innerHtmls]
    }, nextStream1);
  }, () => {
    return pair({
      type: TYPES.innerHtml,
      text: "",
      innerHtmls: []
    }, innerHtmlStream);
  });
};
var parseEndTag = function(stream2) {
  const token = stream2.head();
  if (token.type === "</") {
    const nextStream1 = eatSpaces(stream2.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    if (nextStream3.head().type === ">") {
      return pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.tail());
    }
  }
  throw new Error(`Error occurred while parsing EndTag, ${JSON.stringify(e)}` + stream2.toString());
};
var filterSpace = function(stream2) {
  const nextTokenStream = stream2.tail();
  return nextTokenStream.head().type === " " ? nextTokenStream.tail() : nextTokenStream;
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
  italicExpression: "italicExpression",
  italicType: "italicType",
  bold: "bold",
  boldExpression: "boldExpression",
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
  emptyTag: "emptyTag",
  innerHtml: "innerHtml",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs"
};

// ../node_modul
function render(tree) {
  return new Render().render(tree);
}
function abstractRender(tree) {
  return new Render().abstractRender(tree);
}
function composeRender(...classes) {
  const prodClass = class extends Render {
  };
  classes.forEach((cl) => {
    Object.getOwnPropertyNames(cl.prototype).filter((x) => x !== "constructor").forEach((k) => {
      prodClass.prototype[k] = cl.prototype[k];
    });
  });
  return prodClass;
}
var getLinkData = function(link) {
  return returnOne([
    {
      predicate: (l) => !!l.AnonLink,
      value: (l) => ({
        link: l.AnonLink.link,
        LinkExpression: l.AnonLink.LinkExpression
      })
    },
    {
      predicate: (l) => !!l.LinkRef,
      value: (l) => ({
        link: "https://pedroth.github.io/",
        LinkExpression: { expressons: [] }
      })
    }
  ])(link);
};
class Render {
  render(tree) {
    return this.renderDocument(tree).build();
  }
  abstractRender(tree) {
    return this.renderDocument(tree);
  }
  renderDocument(document2) {
    const { paragraphs } = document2;
    const documentContainer = buildDom("main");
    paragraphs.map((p) => documentContainer.appendChild(this.renderParagraph(p)));
    return documentContainer;
  }
  renderParagraph(paragraph) {
    const { Statement } = paragraph;
    const dom = buildDom("p");
    dom.appendChild(this.renderStatement(Statement));
    return dom;
  }
  renderStatement(statement) {
    return returnOne([
      { predicate: (s) => !!s.Title, value: (s) => this.renderTitle(s.Title) },
      { predicate: (s) => !!s.List, value: (s) => this.renderList(s.List) },
      { predicate: (s) => !!s.MediaRefDef, value: (s) => this.renderMediaRefDef(s.MediaRefDef) },
      { predicate: (s) => !!s.FootnoteDef, value: (s) => this.renderFootnoteDef(s.FootnoteDef) },
      { predicate: (s) => !!s.LinkRefDef, value: (s) => this.renderLinkRefDef(s.LinkRefDef) },
      { predicate: (s) => !!s.Break, value: (s) => this.renderBreak(s.Break) },
      { predicate: (s) => !!s.Expression, value: (s) => this.renderExpression(s.Expression) }
    ])(statement);
  }
  renderTitle(title) {
    const { level, Expression } = title;
    const header = buildDom(`h${level}`);
    const expressionHTML = this.renderExpression(Expression);
    header.appendChild(expressionHTML);
    return header;
  }
  renderExpression(expression) {
    const { expressions } = expression;
    const container = buildDom("span");
    expressions.forEach((expr) => container.appendChild(this.renderExpressionType(expr)));
    return container;
  }
  renderExpressionType(expressionType) {
    return returnOne([
      { predicate: (t) => !!t.Formula, value: (t) => this.renderFormula(t.Formula) },
      { predicate: (t) => !!t.Code, value: (t) => this.renderCode(t.Code) },
      { predicate: (t) => !!t.Link, value: (t) => this.renderLink(t.Link) },
      { predicate: (t) => !!t.Footnote, value: (t) => this.renderFootnote(t.Footnote) },
      { predicate: (t) => !!t.Media, value: (t) => this.renderMedia(t.Media) },
      { predicate: (t) => !!t.Italic, value: (t) => this.renderItalic(t.Italic) },
      { predicate: (t) => !!t.Bold, value: (t) => this.renderBold(t.Bold) },
      { predicate: (t) => !!t.Html, value: (t) => this.renderHtml(t.Html) },
      { predicate: (t) => !!t.Custom, value: (t) => this.renderCustom(t.Custom) },
      { predicate: (t) => !!t.SingleBut, value: (t) => this.renderSingleBut(t.SingleBut) },
      { predicate: (t) => !!t.Text, value: (t) => this.renderText(t.Text) }
    ])(expressionType);
  }
  renderFormula(formula) {
    const { equation } = formula;
    const container = buildDom("span");
    container.inner(equation);
    return container;
  }
  renderAnyBut(anyBut) {
    const { textArray } = anyBut;
    const container = buildDom("p");
    container.inner(textArray.join(""));
    return container;
  }
  renderCode(code) {
    return returnOne([
      {
        predicate: (c) => !!c.LineCode,
        value: (c) => this.renderLineCode(c.LineCode)
      },
      {
        predicate: (c) => !!c.BlockCode,
        value: (c) => this.renderBlockCode(c.BlockCode)
      }
    ])(code);
  }
  renderLineCode(lineCode) {
    const { code } = lineCode;
    const container = buildDom("code");
    container.inner(code);
    return container;
  }
  renderBlockCode(blockCode) {
    const { code, language } = blockCode;
    const lang = language === "" ? "plaintext" : language;
    const container = buildDom("pre");
    const codeTag = buildDom("code");
    codeTag.attr("class", `language-${lang}`);
    codeTag.inner(code);
    container.appendChild(codeTag);
    return container;
  }
  renderLink(link) {
    return returnOne([
      {
        predicate: (l) => !!l.AnonLink,
        value: (l) => this.renderAnonLink(l.AnonLink)
      },
      {
        predicate: (l) => !!l.LinkRef,
        value: (l) => this.renderLinkRef(l.LinkRef)
      }
    ])(link);
  }
  renderAnonLink(anonLink) {
    const { LinkExpression, link: hyperlink } = anonLink;
    const container = buildDom("a");
    container.attr("href", hyperlink);
    hyperlink.includes("http") && container.attr("target", "_blank");
    const childStatement = this.renderLinkExpression(LinkExpression);
    container.appendChild(childStatement);
    return container;
  }
  renderLinkExpression(linkExpression) {
    return this.renderExpression(linkExpression);
  }
  renderLinkRef(linkRef) {
    const div = buildDom("div");
    div.inner("linkRef:" + JSON.stringify(linkRef));
    return div;
  }
  renderLinkRefDef(linkRefDef) {
    const div = buildDom("div");
    div.inner("LinkRefDef" + JSON.stringify(linkRefDef));
    return div;
  }
  renderFootnote() {
    const div = buildDom("div");
    div.inner("Footnote");
    return div;
  }
  renderFootnoteDef(renderFootnoteDef) {
    const div = buildDom("div");
    div.inner("FootnoteDef" + JSON.stringify(renderFootnoteDef));
    return div;
  }
  renderItalic(italic) {
    const { ItalicExpression } = italic;
    const container = buildDom("em");
    container.appendChild(this.renderItalicExpression(ItalicExpression));
    return container;
  }
  renderItalicExpression(italicExpression) {
    return this.renderExpression(italicExpression);
  }
  renderBold(bold) {
    const { BoldExpression } = bold;
    const container = buildDom("strong");
    container.appendChild(this.renderBoldExpression(BoldExpression));
    return container;
  }
  renderBoldExpression(boldExpression) {
    return this.renderExpression(boldExpression);
  }
  renderMedia(media) {
    const { Link } = media;
    const { LinkExpression, link } = getLinkData(Link);
    const container = buildDom("div");
    container.attr("style", "text-align:center;");
    const mediaElem = this.getMediaElementFromSrc(link);
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(mediaElem);
    container.appendChild(childStatement);
    return container;
  }
  getMediaElementFromSrc(src) {
    const defaultAction = this.getImagePredicateValue().value;
    return returnOne([
      this.getVideoPredicateValue(),
      this.getAudioPredicateValue(),
      this.getImagePredicateValue(),
      this.getEmbeddedPredicateValue()
    ], defaultAction)(src);
  }
  getVideoPredicateValue() {
    return {
      predicate: (src) => [".mp4", ".ogg", ".avi"].some((e2) => src.includes(e2)),
      value: (src) => {
        const video = buildDom("video");
        video.attr("src", src);
        video.attr("controls", "");
        return video;
      }
    };
  }
  getAudioPredicateValue() {
    return {
      predicate: (src) => [".mp3", ".ogg", ".wav"].some((e2) => src.includes(e2)),
      value: (src) => {
        const audio = buildDom("audio");
        audio.attr("src", src);
        audio.attr("controls", "");
        return audio;
      }
    };
  }
  getImagePredicateValue() {
    return {
      predicate: (src) => [
        ".apng",
        ".avif",
        ".gif",
        ".jpg",
        ".jpeg",
        ".jfif",
        ".pjpeg",
        ".pjp",
        ".png",
        ".svg",
        ".webp"
      ].some((e2) => src.includes(e2)),
      value: (src) => {
        const img = buildDom("img");
        img.attr("src", src);
        return img;
      }
    };
  }
  getEmbeddedPredicateValue() {
    return {
      predicate: (src) => [".youtube.com", "youtu.be"].some((e2) => src.includes(e2)),
      value: (src) => {
        const frame = buildDom("iframe");
        const videoId = or(() => {
          return src.split("v=")[1].split("&")[0];
        }, () => {
          return src.split(".be/")[1];
        });
        frame.attr("src", "https://www.youtube-nocookie.com/embed/" + videoId);
        frame.attr("frameborder", 0);
        frame.attr("height", "315");
        frame.attr("allow", "fullscreen; clipboard-write; encrypted-media; picture-in-picture");
        return frame;
      }
    };
  }
  renderMediaRefDef(mediaRefDef) {
    const div = buildDom("div");
    div.inner("MediaRefDef" + JSON.stringify(mediaRefDef));
    return div;
  }
  renderCustom(custom) {
    const div = buildDom("div");
    div.inner("Custom" + JSON.stringify(custom));
    return div;
  }
  renderText(text) {
    const { text: txt } = text;
    const container = buildDom("span");
    container.inner(txt);
    return container;
  }
  renderList(list) {
    return returnOne([
      { predicate: (l) => !!l.UList, value: (l) => this.renderUList(l.UList) },
      { predicate: (l) => !!l.OList, value: (l) => this.renderOList(l.OList) }
    ])(list);
  }
  renderUList(ulist) {
    const container = buildDom("ul");
    const { list } = ulist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }
  renderOList(olist) {
    const container = buildDom("ol");
    const { list } = olist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }
  renderListItem({ Expression, children }) {
    const expression = this.renderExpression(Expression);
    const li = buildDom("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(this.renderList(children));
    }
    return li;
  }
  renderBreak(breakEl) {
    const div = buildDom("div");
    div.inner("Break" + JSON.stringify(breakEl));
    return div;
  }
  renderSingleBut(singleBut) {
    const { text } = singleBut;
    const container = buildDom("span");
    container.inner(text);
    return container;
  }
  renderHtml(html) {
    return returnOne([
      {
        predicate: (h) => !!h.StartTag,
        value: (h) => {
          const { StartTag, InnerHtml, EndTag } = h;
          if (StartTag.tag.text !== EndTag.tag.text) {
            const container2 = buildDom("tag");
            container2.inner(`startTag and endTag are not the same, ${StartTag.tag.text} !== ${EndTag.tag}`);
            return container2;
          }
          const { tag, Attrs } = StartTag;
          const container = buildDom(tag);
          const attributes = Attrs.attributes;
          attributes.forEach(({ attributeName, attributeValue }) => container.attr(attributeName, attributeValue));
          return returnOne([
            {
              predicate: (innerHtml) => tag === "style" && innerHtml.text !== undefined,
              value: (innerHtml) => {
                container.inner(innerHtml.text);
                return container;
              }
            },
            {
              predicate: (innerHtml) => tag === "script" && innerHtml.text !== undefined,
              value: (innerHtml) => {
                container.inner(innerHtml.text);
                return container;
              }
            }
          ], () => {
            const innerHtmldomBuilder = this.renderInnerHtml(InnerHtml);
            innerHtmldomBuilder.getChildren().filter((child) => !child.isEmpty()).forEach((child) => {
              container.appendChild(child);
            });
            return container;
          })(InnerHtml);
        }
      },
      {
        predicate: (h) => !!h.EmptyTag,
        value: (h) => this.renderEmptyTag(h.EmptyTag)
      }
    ])(html);
  }
  renderInnerHtml(innerHtml) {
    return returnOne([
      {
        predicate: (i) => !!i.Html,
        value: (i) => {
          const { Html, innerHtmls } = i;
          const container = buildDom("div");
          const domElem = this.renderHtml(Html);
          container.appendChild(domElem);
          innerHtmls.map((innerHtml2) => this.renderInnerHtml(innerHtml2)).flatMap((innerHtml2) => innerHtml2.getChildren()).filter((innerHtml2) => !innerHtml2.isEmpty()).forEach((innerHtml2) => {
            container.appendChild(innerHtml2);
          });
          return container;
        }
      },
      {
        predicate: (i) => !!i.text,
        value: (i) => {
          const { text, innerHtmls } = i;
          const container = buildDom("div");
          const domElem = this.renderNablaText(text);
          container.appendChild(domElem);
          innerHtmls.map((innerHtml2) => this.renderInnerHtml(innerHtml2)).flatMap((innerHtml2) => innerHtml2.getChildren()).filter((innerHtml2) => !innerHtml2.isEmpty()).forEach((innerHtml2) => {
            container.appendChild(innerHtml2);
          });
          return container;
        }
      },
      {
        predicate: (i) => i.text === "",
        value: (i) => buildDom("span")
      }
    ])(innerHtml);
  }
  renderEmptyTag(emptyTag) {
    const { tag, Attrs } = emptyTag;
    const container = buildDom(tag);
    const attributes = Attrs.attributes;
    attributes.forEach(({ attributeName, attributeValue }) => container.attr(attributeName, attributeValue));
    return container;
  }
  renderNablaText(text) {
    const { left: Expression } = parseExpression(tokenizer(stream(text)));
    if (Expression.expressions.length > 0) {
      return this.renderExpression(Expression);
    }
    const Document = parse(text);
    if (Document.paragraphs.length > 0) {
      return this.renderDocument(Document);
    }
    return buildDom("span").inner(text);
  }
}
export {
  render,
  composeRender,
  abstractRender,
  Render
};
