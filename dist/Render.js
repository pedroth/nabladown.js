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

// CodeRender/CodeRe
function buildDom(nodeType) {
  const domNode = {};
  const attrs = {};
  const events = [];
  const children = [];
  const lazyActions = [];
  let innerHtml = "";
  let ref = null;
  domNode.appendChild = (...nodes) => {
    nodes.forEach((node) => children.push(node));
    return domNode;
  };
  domNode.inner = (content) => {
    innerHtml = content;
    return domNode;
  };
  domNode.attr = (attribute, value) => {
    attrs[attribute] = value;
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
    const dom = SVG_TAGS.includes(nodeType) ? document.createElementNS(SVG_URL, nodeType) : document.createElement(nodeType);
    Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
    events.forEach((event) => dom.addEventListener(event.eventType, event.lambda));
    dom.innerHTML = innerHtml;
    if (children.length > 0) {
      children.forEach((child) => {
        if (!child.build)
          return;
        dom.appendChild(child.build());
      });
    }
    lazyActions.forEach((lazyAction) => lazyAction(dom));
    ref = dom;
    return dom;
  };
  domNode.toString = () => {
    const domArray = [];
    domArray.push(`<${nodeType} `);
    domArray.push(...Object.entries(attrs).map(([attr, value]) => `${attr}="${value}"`));
    domArray.push(`>`);
    if (children.length > 0) {
      domArray.push(...children.map((child) => child.toString()));
    } else {
      domArray.push(innerHtml);
    }
    domArray.push(`</${nodeType}>`);
    return domArray.join("");
  };
  domNode.isEmpty = () => children.length === 0 && innerHtml === "";
  domNode.getChildren = () => children;
  domNode.getAttrs = () => attrs;
  domNode.getEvents = () => events;
  domNode.getLazyActions = () => lazyActions;
  domNode.getType = () => nodeType;
  domNode.getRef = () => (f) => f(ref);
  return domNode;
}
var SVG_URL = "http://www.w3.org/2000/svg";
var SVG_TAGS = [
  "svg",
  "g",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect"
];

// CodeRender/C
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
  return eatSymbolsWhile(tokenStream, (s) => s.type === " ");
}
function eatSymbolsWhile(tokenStream, predicate) {
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
function evalScriptTag(scriptTag) {
  const globalEval = eval;
  const srcUrl = scriptTag?.attributes["src"]?.textContent;
  if (srcUrl) {
    return fetch(srcUrl).then((code) => code.text()).then((code) => {
      globalEval(code);
    });
  } else {
    return new Promise((re) => {
      globalEval(scriptTag.innerText);
      re(true);
    });
  }
}
async function asyncForEach(asyncLambdas) {
  for (const asyncLambda of asyncLambdas) {
    await asyncLambda();
  }
}
function createDefaultEl() {
  const defaultDiv = buildDom("div");
  defaultDiv.inner("This could be a bug!!");
  return defaultDiv;
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

// CodeRender/C
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
    const nextStream = stream2.tail();
    return or(() => {
      const { left: token, right: nextNextStream } = orderedListParser(nextStream);
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream);
    }, () => {
      const char2 = nextStream.head();
      if (char2 !== ".") {
        throw new Error(`Error occurred while tokening ordered list start with symbol ${char2} ` + stream2.toString());
      }
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + char2).build(), nextStream.tail());
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

// CodeRender/Co
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
function left(x) {
  return {
    mapLeft: (f) => left(f(x)),
    mapRight: () => left(x),
    actual: () => x
  };
}
function right(x) {
  return {
    mapLeft: () => right(x),
    mapRight: (f) => right(f(x)),
    actual: () => x
  };
}
function either(a, b) {
  if (a)
    return left(a);
  return right(b);
}
function some(x) {
  return { map: (f) => maybe(f(x)), orElse: () => x };
}
function none() {
  return { map: () => none(), orElse: (f) => f() };
}
function maybe(x) {
  if (x) {
    return some(x);
  }
  return none(x);
}

// CodeRender/Co
function parse(string) {
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
  return or(() => {
    const { left: List, right: nextStream } = parseList(0)(stream2);
    return pair({ type: TYPES.paragraph, List }, nextStream);
  }, () => {
    const { left: Statement, right: nextStream } = parseStatement(stream2);
    if (nextStream.head().type === "\n") {
      return pair({ type: TYPES.paragraph, Statement }, nextStream.tail());
    }
    throw new Error("Error occurred while parsing expression," + nextStream.toString());
  });
};
var parseStatement = function(stream2) {
  return or(() => {
    const { left: Title, right: nextStream } = parseTitle(stream2);
    return pair({ type: TYPES.statement, Title }, nextStream);
  }, () => {
    const { left: FootnoteDef, right: nextStream } = parseFootnoteDef(stream2);
    return pair({ type: TYPES.statement, FootnoteDef }, nextStream);
  }, () => {
    const { left: LinkRefDef, right: nextStream } = parseLinkRefDef(stream2);
    return pair({ type: TYPES.statement, LinkRefDef }, nextStream);
  }, () => {
    const { left: Break, right: nextStream } = parseBreak(stream2);
    return pair({ type: TYPES.statement, Break }, nextStream);
  }, () => {
    const { left: Expression, right: nextStream } = parseExpression(stream2);
    return pair({ type: TYPES.statement, Expression }, nextStream);
  });
};
var parseTitle = function(stream2) {
  if (stream2.head().type === "#") {
    const level = stream2.head().repeat;
    const filterNextSpace = filterSpace(stream2.tail());
    const { left: Expression, right: nextStream } = parseExpression(filterNextSpace);
    return pair({ type: TYPES.title, Expression, level }, nextStream);
  }
  throw new Error("Error occurred while parsing Title," + stream2.toString());
};
function parseExpression(stream2) {
  return or(() => {
    const { left: ExpressionTypes, right: nextStream } = parseExpressionTypes(stream2);
    const { left: Expression, right: nextNextStream } = parseExpression(nextStream);
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
    const { left: Formula, right: nextStream } = parseFormula(stream2);
    return pair({ type: TYPES.expressionTypes, Formula }, nextStream);
  }, () => {
    const { left: Code, right: nextStream } = parseCode(stream2);
    return pair({ type: TYPES.expressionTypes, Code }, nextStream);
  }, () => {
    const { left: Footnote, right: nextStream } = parseFootnote(stream2);
    return pair({ type: TYPES.expressionTypes, Footnote }, nextStream);
  }, () => {
    const { left: Link, right: nextStream } = parseLink(stream2);
    return pair({ type: TYPES.expressionTypes, Link }, nextStream);
  }, () => {
    const { left: Media, right: nextStream } = parseMedia(stream2);
    return pair({ type: TYPES.expressionTypes, Media }, nextStream);
  }, () => {
    const { left: Italic, right: nextStream } = parseItalic(stream2);
    return pair({ type: TYPES.expressionTypes, Italic }, nextStream);
  }, () => {
    const { left: Bold, right: nextStream } = parseBold(stream2);
    return pair({ type: TYPES.expressionTypes, Bold }, nextStream);
  }, () => {
    const { left: Custom, right: nextStream } = parseCustom(stream2);
    return pair({ type: TYPES.expressionTypes, Custom }, nextStream);
  }, () => {
    const { left: Html, right: nextStream } = parseHtml(stream2);
    return pair({ type: TYPES.expressionTypes, Html }, nextStream);
  }, () => {
    const { left: Text, right: nextStream } = parseText(stream2);
    return pair({ type: TYPES.expressionTypes, Text }, nextStream);
  });
};
var parseFormula = function(stream2) {
  const token = stream2.head();
  const repeat = token.repeat;
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut((token2) => token2.type === "$")(stream2.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair({
        type: TYPES.formula,
        equation: AnyBut.textArray.join(""),
        isInline: nextToken?.repeat === 1
      }, nextStream.tail());
    }
  }
  throw new Error("Error occurred while parsing Formula," + stream2.toString());
};
var parseAnyBut = function(tokenPredicate) {
  return (stream2) => {
    return or(() => {
      const peek = stream2.head();
      if (!tokenPredicate(peek)) {
        const { left: AnyBut, right: nextStream } = parseAnyBut(tokenPredicate)(stream2.tail());
        return pair({ type: TYPES.anyBut, textArray: [peek.text, ...AnyBut.textArray] }, nextStream);
      }
      throw new Error("Error occurred while parsing AnyBut," + stream2.toString());
    }, () => pair({ type: TYPES.anyBut, textArray: [] }, stream2));
  };
};
var parseCode = function(stream2) {
  return or(() => {
    const { left: LineCode, right: nextStream } = parseLineCode(stream2);
    return pair({ type: TYPES.code, LineCode }, nextStream);
  }, () => {
    const { left: BlockCode, right: nextStream } = parseBlockCode(stream2);
    return pair({ type: TYPES.code, BlockCode }, nextStream);
  });
};
var parseLineCode = function(stream2) {
  const lineCodeTokenPredicate = (t) => t.type === "`";
  const token = stream2.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut((t) => lineCodeTokenPredicate(t))(stream2.tail());
    if (lineCodeTokenPredicate(nextStream.head())) {
      return pair({ type: TYPES.lineCode, code: AnyBut.textArray.join("") }, nextStream.tail());
    }
  }
  throw new Error("Error occurred while parsing LineCode," + stream2.toString());
};
var parseBlockCode = function(stream2) {
  const blockCodeTokenPredicate = (t) => t.type === CODE_SYMBOL;
  const token = stream2.head();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream } = parseAnyBut((t) => t.type === "\n")(stream2.tail());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream.tail());
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
    const { left: AnonLink, right: nextStream } = parseAnonLink(stream2);
    return pair({ type: TYPES.link, AnonLink }, nextStream);
  }, () => {
    const { left: LinkRef, right: nextStream } = parseLinkRef(stream2);
    return pair({ type: TYPES.link, LinkRef }, nextStream);
  });
};
var parseAnonLink = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "[";
  }).map((nextStream) => {
    return parseLinkExpression(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.head();
    return token.type === "]";
  }).filter(({ right: nextStream }) => {
    const token = nextStream.tail().head();
    return token.type === "(";
  }).map(({ left: LinkExpression, right: nextStream }) => {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === ")")(nextStream.tail().tail());
    return { LinkExpression, AnyBut, nextStream: nextStream2 };
  }).filter(({ nextStream }) => {
    const token = nextStream.head();
    return token.type === ")";
  }).map(({ LinkExpression, AnyBut, nextStream }) => {
    return pair({
      type: TYPES.anonlink,
      LinkExpression,
      link: AnyBut.textArray.join("")
    }, nextStream.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing AnonLink," + stream2.toString());
  });
};
var parseLinkExpression = function(stream2) {
  return or(() => {
    const { left: LinkTypes, right: nextStream } = parseLinkTypes(stream2);
    const { left: LinkExpression, right: nextNextStream } = parseLinkExpression(nextStream);
    return pair({
      type: TYPES.linkExpression,
      expressions: [LinkTypes, ...LinkExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.linkExpression, expressions: [] }, stream2));
};
var parseLinkTypes = function(stream2) {
  return or(() => {
    const { left: Formula, right: nextStream } = parseFormula(stream2);
    return pair({ type: TYPES.linkTypes, Formula }, nextStream);
  }, () => {
    const { left: Html, right: nextStream } = parseHtml(stream2);
    return pair({ type: TYPES.linkTypes, Html }, nextStream);
  }, () => {
    const { left: Code, right: nextStream } = parseCode(stream2);
    return pair({ type: TYPES.linkTypes, Code }, nextStream);
  }, () => {
    const { left: Italic, right: nextStream } = parseItalic(stream2);
    return pair({ type: TYPES.linkTypes, Italic }, nextStream);
  }, () => {
    const { left: Bold, right: nextStream } = parseBold(stream2);
    return pair({ type: TYPES.linkTypes, Bold }, nextStream);
  }, () => {
    const { left: Custom, right: nextStream } = parseCustom(stream2);
    return pair({ type: TYPES.linkTypes, Custom }, nextStream);
  }, () => {
    const { left: Media, right: nextStream } = parseMedia(stream2);
    return pair({ type: TYPES.linkTypes, Media }, nextStream);
  }, () => {
    const { left: SingleBut, right: nextStream } = parseSingleBut((token) => ["\n", "]"].includes(token.type))(stream2);
    return pair({ type: TYPES.linkTypes, SingleBut }, nextStream);
  });
};
var parseLinkRef = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "[";
  }).map((nextStream) => {
    return parseLinkExpression(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.head();
    return token.type === "]";
  }).filter(({ right: nextStream }) => {
    const token = nextStream.tail().head();
    return token.type === "[";
  }).map(({ left: LinkExpression, right: nextStream }) => {
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === "]")(nextStream.tail().tail());
    return { LinkExpression, AnyBut, nextStream: nextStream2 };
  }).filter(({ nextStream }) => {
    const token = nextStream.head();
    return token.type === "]";
  }).map(({ LinkExpression, AnyBut, nextStream }) => {
    return pair({
      type: TYPES.linkRef,
      LinkExpression,
      id: AnyBut.textArray.join("")
    }, nextStream.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing LinkRef," + stream2.toString());
  });
};
var parseLinkRefDef = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "[";
  }).map((nextStream) => {
    return parseAnyBut((token) => token.type === "]")(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.tail().head();
    return token.type === ":";
  }).map(({ left: AnyButRef, right: nextStream }) => {
    const nextStream2 = filterSpace(nextStream.tail().tail());
    const { left: AnyButDef, right: nextStream3 } = parseAnyBut((token) => token.type === "\n")(nextStream2);
    return pair({
      type: TYPES.linkRefDef,
      id: AnyButRef.textArray.join(""),
      url: AnyButDef.textArray.join("")
    }, nextStream3);
  }).actual(() => {
    throw new Error("Error occurred while parsing LinkRefDef," + stream2.toString());
  });
};
var parseFootnote = function(stream2) {
  if (stream2.head().type === "[") {
    const nextStream = stream2.tail();
    if (nextStream.head().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "]")(nextStream.tail());
      return pair({ type: TYPES.footnote, id: AnyBut.textArray.join("") }, nextStream1.tail());
    }
  }
  throw new Error("Error occurred while parsing Footnote," + stream2.toString());
};
var parseFootnoteDef = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "[";
  }).filter((nextStream) => {
    const token = nextStream.tail().head();
    return token.type === "^";
  }).map((nextStream) => {
    return parseAnyBut((token) => token.type === "]")(nextStream.tail().tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.tail().head();
    return token.type === ":";
  }).map(({ left: AnyBut, right: nextStream }) => {
    const nextStream2 = filterSpace(nextStream.tail());
    const { left: Expression, right: nextStream3 } = parseExpression(nextStream2);
    return pair({
      type: TYPES.footnoteDef,
      id: AnyBut.textArray.join(""),
      Expression
    }, nextStream3);
  }).actual(() => {
    throw new Error("Error occurred while parsing FootnoteDef," + stream2.toString());
  });
};
var parseItalic = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "_";
  }).map((nextStream) => {
    return parseItalicExpression(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.head();
    return token.type === "_";
  }).map(({ left: ItalicExpression, right: nextStream }) => {
    return pair({ type: TYPES.italic, ItalicExpression }, nextStream.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing Italic," + stream2.toString());
  });
};
var parseItalicExpression = function(stream2) {
  return or(() => {
    const { left: ItalicType, right: nextStream } = parseItalicType(stream2);
    const { left: ItalicExpression, right: nextNextStream } = parseItalicExpression(nextStream);
    return pair({
      type: TYPES.italicExpression,
      expressions: [ItalicType, ...ItalicExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.italicExpression, expressions: [] }, stream2));
};
var parseItalicType = function(stream2) {
  return or(() => {
    const { left: Bold, right: nextStream } = parseBold(stream2);
    return pair({ type: TYPES.italicType, Bold }, nextStream);
  }, () => {
    const { left: Link, right: nextStream } = parseLink(stream2);
    return pair({ type: TYPES.italicType, Link }, nextStream);
  }, () => {
    const { left: SingleBut, right: nextStream } = parseSingleBut((token) => ["\n", "_"].includes(token.type))(stream2);
    return pair({ type: TYPES.italicType, SingleBut }, nextStream);
  });
};
var parseBold = function(stream2) {
  return success(stream2).filter((nextStream) => {
    const token = nextStream.head();
    return token.type === "**";
  }).map((nextStream) => {
    return parseBoldExpression(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.head();
    return token.type === "**";
  }).map(({ left: BoldExpression, right: nextStream }) => {
    return pair({ type: TYPES.bold, BoldExpression }, nextStream.tail());
  }).actual(() => {
    throw new Error("Error occurred while parsing Bold," + stream2.toString());
  });
};
var parseBoldExpression = function(stream2) {
  return or(() => {
    const { left: BoldType, right: nextStream } = parseBoldType(stream2);
    const { left: BoldExpression, right: nextNextStream } = parseBoldExpression(nextStream);
    return pair({
      type: TYPES.BoldExpression,
      expressions: [BoldType, ...BoldExpression.expressions]
    }, nextNextStream);
  }, () => pair({ type: TYPES.boldExpression, expressions: [] }, stream2));
};
var parseBoldType = function(stream2) {
  return or(() => {
    const { left: Italic, right: nextStream } = parseItalic(stream2);
    return pair({ type: TYPES.boldType, Italic }, nextStream);
  }, () => {
    const { left: Link, right: nextStream } = parseLink(stream2);
    return pair({ type: TYPES.boldType, Link }, nextStream);
  }, () => {
    const { left: SingleBut, right: nextStream } = parseSingleBut((token) => ["\n", "**"].includes(token.type))(stream2);
    return pair({ type: TYPES.boldType, SingleBut }, nextStream);
  });
};
var parseMedia = function(stream2) {
  const token = stream2.head();
  if (token.type === "!") {
    const { left: Link, right: nextStream } = parseLink(stream2.tail());
    return pair({ type: TYPES.media, Link }, nextStream);
  }
};
var parseCustom = function(stream2) {
  if (stream2.head().type === "[") {
    const { left: AnyBut, right: nextStream } = parseAnyBut((token) => token.type === "]")(stream2.tail());
    const nextStream1 = nextStream.tail();
    if (nextStream1.head().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream2 } = parseAnyBut((token) => CUSTOM_SYMBOL === token.type)(nextStream1.tail());
      return pair({
        type: TYPES.custom,
        key: AnyBut.textArray.join(""),
        value: AnyButCustom.textArray.join("")
      }, nextStream2.tail());
    }
  }
  throw new Error("Error occurred while parsing Custom," + stream2.toString());
};
var parseText = function(stream2) {
  return or(() => {
    const { left: AnyBut, right: nextStream } = parseAnyBut((t) => !(t.type === TEXT_SYMBOL || t.type === " "))(stream2);
    if (AnyBut.textArray.length > 0) {
      return pair({ type: TYPES.text, text: AnyBut.textArray.join("") }, nextStream);
    }
    throw new Error("Error occurred while parsing Text," + stream2.toString());
  }, () => {
    const token = stream2.head();
    if (token.type !== "\n" && token.type !== "</") {
      return pair({ type: TYPES.text, text: stream2.head().text }, stream2.tail());
    }
    throw new Error("Error occurred while parsing Text" + stream2.toString());
  });
};
var parseList = function(n) {
  return function(stream2) {
    return or(() => {
      const { left: UList, right: nextStream } = parseUList(n)(stream2);
      return pair({ type: TYPES.list, UList }, nextStream);
    }, () => {
      const { left: OList, right: nextStream } = parseOList(n)(stream2);
      return pair({ type: TYPES.list, OList }, nextStream);
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
var parseListItemExpression = function({ stream: stream2, n, "λ": λ }) {
  return success(stream2).map((nextNextStream) => {
    return identation(n, nextNextStream);
  }).filter((nextStream) => {
    return λ === nextStream.head().type;
  }).map((nextStream) => {
    const filterNextSpace = filterSpace(nextStream.tail());
    return parseExpression(filterNextSpace);
  }).filter(({ right: nextStream }) => {
    return nextStream.head().type === "\n";
  }).map(({ left: Expression, right: nextStream }) => {
    return pair(Expression, nextStream.tail());
  }).actual(() => {
    throw new Error(`Error occurred while parsing ListItemExpression(${n}, ${λ})`, stream2.toString());
  });
};
var parseListItem = function(n, λ) {
  return function(stream2) {
    return or(() => {
      const { left: Expression, right: stream22 } = parseListItemExpression({ stream: stream2, n, "λ": λ });
      const { left: List, right: stream3 } = parseList(n + 1)(stream22);
      return pair({
        type: TYPES.listItem,
        Expression,
        children: List
      }, stream3);
    }, () => {
      const { left: Expression, right: stream22 } = parseListItemExpression({ stream: stream2, n, "λ": λ });
      return pair({
        type: TYPES.listItem,
        Expression
      }, stream22);
    });
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
    const { left: InnerHtml, right: nextStream2 } = returnOne([
      {
        predicate: () => StartTag.tag === "style" || StartTag.tag === "script",
        value: (ss) => parseSimpleInnerHtml(ss)
      }
    ], (ss) => parseInnerHtml(ss))(nextStream1);
    const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
    return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3);
  }, () => {
    const { left: EmptyTag, right: nextStream } = parseEmptyTag(stream2);
    return pair({ type: TYPES.html, EmptyTag }, nextStream);
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
  throw new Error(`Error occurred while parsing StartTag,` + stream2.toString());
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
  throw new Error(`Error occurred while parsing EmptyTag,` + stream2.toString());
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
    const { left: Attr, right: nextStream } = parseAttr(stream2);
    const nextStreamNoSpaces = eatSpaces(nextStream);
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
    return success(stream2).map((nextStream) => {
      return parseAlphaNumName(nextStream);
    }).filter(({ right: nextStream }) => {
      return nextStream.head().type === "=" && nextStream.tail().head().type === '"';
    }).map(({ left: attrName, right: nextStream }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === '"')(nextStream.tail().tail());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.tail());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  }, () => {
    return success(stream2).map((nextStream) => {
      return parseAlphaNumName(nextStream);
    }).filter(({ right: nextStream }) => {
      return nextStream.head().type === "=" && nextStream.tail().head().type === "'";
    }).map(({ left: attrName, right: nextStream }) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "'")(nextStream.tail().tail());
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: AnyBut.textArray.join("")
      }, nextStream1.tail());
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  }, () => {
    return success(stream2).map((nextStream) => {
      return parseAlphaNumName(nextStream);
    }).map(({ left: attrName, right: nextStream }) => {
      return pair({
        type: TYPES.attr,
        attributeName: attrName.text,
        attributeValue: '"true"'
      }, nextStream);
    }).actual(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  });
};
var parseInnerHtml = function(stream2) {
  return or(() => {
    const { left: InnerHtmlTypes, right: nextStream } = parseInnerHtmlTypes(stream2);
    if (InnerHtmlTypes?.Expression.expressions.length === 0)
      throw new Error("parsed an empty expression as innerHtmlType");
    const { left: InnerHtml, right: nextStream1 } = parseInnerHtml(nextStream);
    return pair({
      type: TYPES.innerHtml,
      innerHtmls: [InnerHtmlTypes, ...InnerHtml.innerHtmls]
    }, nextStream1);
  }, () => {
    return pair({
      type: TYPES.innerHtml,
      innerHtmls: []
    }, stream2);
  });
};
var parseSimpleInnerHtml = function(stream2) {
  const { left: AnyBut, right: nextStream } = parseAnyBut((token) => token.type === "</")(stream2);
  const text = AnyBut.textArray.join("");
  return pair({
    type: TYPES.innerHtml,
    innerHtmls: [{
      type: TYPES.innerHtmlTypes,
      text
    }]
  }, nextStream);
};
var parseInnerHtmlTypes = function(stream2) {
  const filteredStream = eatSymbolsWhile(stream2, (token) => token.type === " " || token.type === "\t" || token.type === "\n");
  return or(() => {
    const { left: Html, right: nextStream } = parseHtml(filteredStream);
    return pair({
      type: TYPES.innerHtmlTypes,
      Html
    }, nextStream);
  }, () => {
    const { left: Expression, right: nextStream } = parseExpression(filteredStream);
    return pair({
      type: TYPES.innerHtmlTypes,
      Expression
    }, nextStream);
  });
};
var parseEndTag = function(stream2) {
  const filteredStream = eatSymbolsWhile(stream2, (token2) => token2.type === " " || token2.type === "\t" || token2.type === "\n");
  const token = filteredStream.head();
  if (token.type === "</") {
    const nextStream1 = eatSpaces(filteredStream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    if (nextStream3.head().type === ">") {
      return pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.tail());
    }
  }
  throw new Error(`Error occurred while parsing EndTag` + stream2.toString());
};
var filterSpace = function(stream2) {
  return stream2.head().type !== " " ? stream2 : stream2.tail();
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
  innerHtmlTypes: "innerHtmlTypes",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs"
};
var identation = (n, stream2) => {
  return eatNSymbol(n, (s) => s.head().type === " ")(stream2);
};

// CodeRender/Co
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
var createIdFromExpression = function(expression) {
  return expression.build().innerText.trim().toLowerCase().split(" ").join("-");
};
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
      value: (l) => {
        const { LinkExpression, id } = l.LinkRef;
        return {
          refId: id,
          LinkExpression
        };
      }
    }
  ])(link);
};
var createContext = function() {
  return {
    links: {
      id2dom: {}
    },
    finalActions: [],
    footnotes: {
      id2dom: {},
      id2label: {},
      idCounter: 0,
      dombuilder: null
    }
  };
};

class Render {
  render(tree) {
    return this.abstractRender(tree).build();
  }
  abstractRender(tree, context) {
    context = context || createContext();
    const document2 = this.renderDocument(tree, context);
    context.finalActions.forEach((finalAction) => finalAction(document2));
    document2.lazy((dom) => {
      const scripts = Array.from(dom.getElementsByTagName("script"));
      const asyncLambdas = scripts.map((script) => () => evalScriptTag(script));
      asyncForEach(asyncLambdas);
    });
    return document2;
  }
  renderDocument(document2, context) {
    const { paragraphs } = document2;
    const documentContainer = buildDom("main");
    paragraphs.map((p) => documentContainer.appendChild(this.renderParagraph(p, context)));
    return documentContainer;
  }
  renderParagraph(paragraph, context) {
    return returnOne([
      {
        predicate: (p) => !!p.List,
        value: (p) => this.renderList(p.List, context)
      },
      {
        predicate: (p) => !!p.Statement,
        value: (p) => {
          const { Statement } = p;
          const dom = buildDom("p");
          dom.appendChild(this.renderStatement(Statement, context));
          return dom;
        }
      }
    ])(paragraph);
  }
  renderStatement(statement, context) {
    return returnOne([
      { predicate: (s) => !!s.Title, value: (s) => this.renderTitle(s.Title, context) },
      { predicate: (s) => !!s.MediaRefDef, value: (s) => this.renderMediaRefDef(s.MediaRefDef, context) },
      { predicate: (s) => !!s.FootnoteDef, value: (s) => this.renderFootnoteDef(s.FootnoteDef, context) },
      { predicate: (s) => !!s.LinkRefDef, value: (s) => this.renderLinkRefDef(s.LinkRefDef, context) },
      { predicate: (s) => !!s.Break, value: (s) => this.renderBreak(s.Break, context) },
      { predicate: (s) => !!s.Expression, value: (s) => this.renderExpression(s.Expression, context) }
    ])(statement);
  }
  renderTitle(title, context) {
    const { level, Expression } = title;
    const header = buildDom(`h${level}`);
    const expressionDomB = this.renderExpression(Expression, context);
    const titleId = createIdFromExpression(expressionDomB);
    header.appendChild(expressionDomB).attr("id", `${titleId}`);
    return header;
  }
  renderExpression(expression, context) {
    const { expressions } = expression;
    const container = buildDom("span");
    expressions.forEach((expr) => container.appendChild(this.renderExpressionType(expr, context)));
    return container;
  }
  renderExpressionType(expressionType, context) {
    return returnOne([
      { predicate: (t) => !!t.Formula, value: (t) => this.renderFormula(t.Formula) },
      { predicate: (t) => !!t.Code, value: (t) => this.renderCode(t.Code) },
      { predicate: (t) => !!t.Link, value: (t) => this.renderLink(t.Link, context) },
      { predicate: (t) => !!t.Footnote, value: (t) => this.renderFootnote(t.Footnote, context) },
      { predicate: (t) => !!t.Media, value: (t) => this.renderMedia(t.Media, context) },
      { predicate: (t) => !!t.Italic, value: (t) => this.renderItalic(t.Italic, context) },
      { predicate: (t) => !!t.Bold, value: (t) => this.renderBold(t.Bold, context) },
      { predicate: (t) => !!t.Html, value: (t) => this.renderHtml(t.Html, context) },
      { predicate: (t) => !!t.Custom, value: (t) => this.renderCustom(t.Custom, context) },
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
  renderLink(link, context) {
    return returnOne([
      {
        predicate: (l) => !!l.AnonLink,
        value: (l) => this.renderAnonLink(l.AnonLink, context)
      },
      {
        predicate: (l) => !!l.LinkRef,
        value: (l) => this.renderLinkRef(l.LinkRef, context)
      }
    ])(link);
  }
  renderAnonLink(anonLink, context) {
    const { LinkExpression, link: hyperlink } = anonLink;
    const container = buildDom("a");
    container.attr("href", hyperlink);
    hyperlink.includes("http") && container.attr("target", "_blank");
    const childStatement = this.renderLinkExpression(LinkExpression, context);
    container.appendChild(childStatement);
    return container;
  }
  renderLinkExpression(linkExpression, context) {
    return this.renderExpression(linkExpression, context);
  }
  renderLinkRef(linkRef, context) {
    const { LinkExpression, id } = linkRef;
    const { links } = context;
    const childStatement = this.renderLinkExpression(LinkExpression, context);
    const container = buildDom("a");
    container.appendChild(childStatement);
    if (!links.id2dom[id]) {
      links.id2dom[id] = [];
    }
    links.id2dom[id].push(container);
    return container;
  }
  renderLinkRefDef(linkRefDef, context) {
    const { id, url } = linkRefDef;
    const { links } = context;
    const linkDomBuilders = links.id2dom[id];
    if (linkDomBuilders) {
      linkDomBuilders.filter((linkDomBuilder) => linkDomBuilder.getType() === "a").forEach((linkDomBuilder) => {
        linkDomBuilder.attr("href", url);
        url.includes("http") && linkDomBuilder.attr("target", "_blank");
      });
      linkDomBuilders.filter((linkDomBuilder) => linkDomBuilder.getType() !== "a").forEach((linkDomBuilder) => {
        const mediaDomB = this.getMediaElementFromSrc(url);
        maybe(linkDomBuilder.getAttrs()["alt"]).map((val) => mediaDomB.attr("alt", val));
        linkDomBuilder.appendChild(mediaDomB);
      });
    }
    return buildDom("div");
  }
  renderFootnote(footnote, context) {
    const { id } = footnote;
    const { footnotes } = context;
    if (!footnotes.id2dom[id]) {
      footnotes.id2dom[id] = [];
    }
    if (!footnotes.id2label[id]) {
      footnotes.id2label[id] = ++footnotes.idCounter;
    }
    const fnDomId = footnotes.id2dom[id].length;
    const fnLabel = footnotes.id2label[id];
    const container = buildDom("sup");
    const link = buildDom("a").attr("id", `fn${id}-${fnDomId}`).inner(`[${fnLabel}]`);
    container.appendChild(link);
    footnotes.id2dom[id].push(link);
    return container;
  }
  renderFootnoteDef(footnoteDef, context) {
    const { id, Expression } = footnoteDef;
    const { footnotes } = context;
    if (!footnotes.domBuilder) {
      const footnotesDiv = buildDom("div").appendChild(buildDom("hr")).appendChild(buildDom("ol"));
      context.finalActions.push((doc) => doc.appendChild(footnotesDiv));
      footnotes.domBuilder = footnotesDiv;
    }
    context.finalActions.push(() => {
      footnotes.domBuilder.getChildren()[1].appendChild(buildDom("li").appendChild(this.renderExpression(Expression, context)).appendChild(...footnotes.id2dom[id].map((_, i) => buildDom("a").attr("id", `fnDef${id}`).attr("href", `#fn${id}-${i}`).inner("\u21A9"))));
      footnotes.id2dom[id].forEach((dom) => dom.attr("href", `#fnDef${id}`));
    });
    return buildDom("div");
  }
  renderItalic(italic, context) {
    const { ItalicExpression } = italic;
    const container = buildDom("em");
    container.appendChild(this.renderItalicExpression(ItalicExpression, context));
    return container;
  }
  renderItalicExpression(italicExpression, context) {
    return this.renderExpression(italicExpression, context);
  }
  renderBold(bold, context) {
    const { BoldExpression } = bold;
    const container = buildDom("strong");
    container.appendChild(this.renderBoldExpression(BoldExpression, context));
    return container;
  }
  renderBoldExpression(boldExpression, context) {
    return this.renderExpression(boldExpression, context);
  }
  renderMedia(media, context) {
    const { Link } = media;
    const { links } = context;
    const { LinkExpression, link, refId } = getLinkData(Link);
    const container = buildDom("div");
    container.attr("style", "text-align:center;");
    let mediaElem;
    either(link, refId).mapLeft((link2) => {
      mediaElem = this.getMediaElementFromSrc(link2);
    }).mapRight((refId2) => {
      mediaElem = buildDom("div");
      if (!links.id2dom[refId2]) {
        links.id2dom[refId2] = [];
      }
      links.id2dom[refId2].push(mediaElem);
    });
    const caption = this.renderExpression(LinkExpression, context);
    mediaElem.attr("alt", createIdFromExpression(caption));
    container.appendChild(mediaElem);
    container.appendChild(buildDom("figcaption").appendChild(caption));
    return container;
  }
  getMediaElementFromSrc(src) {
    const defaultAction = this.getImagePredicateValue().value;
    return returnOne([
      this.getVideoPredicateValue(),
      this.getAudioPredicateValue(),
      this.getImagePredicateValue(),
      ...this.getEmbeddedPredicateValue()
    ], defaultAction)(src);
  }
  getVideoPredicateValue() {
    return {
      predicate: (src) => [".mp4", ".ogg", ".avi"].some((e) => src.includes(e)),
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
      predicate: (src) => [".mp3", ".ogg", ".wav"].some((e) => src.includes(e)),
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
      ].some((e) => src.includes(e)),
      value: (src) => {
        const img = buildDom("img");
        img.attr("src", src);
        return img;
      }
    };
  }
  getEmbeddedPredicateValue() {
    return [{
      predicate: (src) => [".youtube.com", "youtu.be"].some((e) => src.includes(e)),
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
        frame.attr("width", "560");
        frame.attr("allow", "fullscreen; clipboard-write; encrypted-media; picture-in-picture");
        return frame;
      }
    }];
  }
  renderCustom(custom, context) {
    const { key, value } = custom;
    const div = buildDom("div");
    div.attr("class", key);
    const domBuilderDoc = this.abstractRender(parse(value), context);
    div.appendChild(domBuilderDoc);
    return div;
  }
  renderText(text) {
    const { text: txt } = text;
    const container = buildDom("span");
    container.inner(txt);
    return container;
  }
  renderList(list, context) {
    return returnOne([
      { predicate: (l) => !!l.UList, value: (l) => this.renderUList(l.UList, context) },
      { predicate: (l) => !!l.OList, value: (l) => this.renderOList(l.OList, context) }
    ])(list);
  }
  renderUList(ulist, context) {
    const container = buildDom("ul");
    const { list } = ulist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem, context));
    });
    return container;
  }
  renderOList(olist, context) {
    const container = buildDom("ol");
    const { list } = olist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem, context));
    });
    return container;
  }
  renderListItem(listItem, context) {
    const { Expression, children } = listItem;
    const expression = this.renderExpression(Expression, context);
    const li = buildDom("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(this.renderList(children, context));
    }
    return li;
  }
  renderBreak() {
    const div = buildDom("hr");
    return div;
  }
  renderSingleBut(singleBut) {
    const { text } = singleBut;
    const container = buildDom("span");
    container.inner(text);
    return container;
  }
  renderHtml(html, context) {
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
          if (tag !== "style" && tag !== "script") {
            const innerHtmldomBuilder = this.renderInnerHtml(InnerHtml, context);
            innerHtmldomBuilder.getChildren().forEach((child) => {
              container.appendChild(child);
            });
            return container;
          }
          const { innerHtmls } = InnerHtml;
          const [first] = innerHtmls;
          container.inner(first.text);
          return container;
        }
      },
      {
        predicate: (h) => !!h.EmptyTag,
        value: (h) => this.renderEmptyTag(h.EmptyTag)
      }
    ])(html);
  }
  renderInnerHtml(innerHtml, context) {
    const { innerHtmls } = innerHtml;
    const container = buildDom("div");
    innerHtmls.forEach((innerHtmlTypes) => container.appendChild(this.renderInnerHtmlTypes(innerHtmlTypes, context)));
    return container;
  }
  renderInnerHtmlTypes(innerHtmlTypes, context) {
    return returnOne([
      {
        predicate: (i) => !!i.Html,
        value: (i) => {
          const { Html } = i;
          return this.renderHtml(Html, context);
        }
      },
      {
        predicate: (i) => !!i.Expression,
        value: (i) => {
          const { Expression } = i;
          return this.renderExpression(Expression, context);
        }
      },
      {
        predicate: (i) => !!i.Document,
        value: (i) => {
          const { Document } = i;
          return this.renderDocument(Document, context);
        }
      }
    ])(innerHtmlTypes);
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
