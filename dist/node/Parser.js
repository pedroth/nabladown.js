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

// CodeRender/Co
function success(x) {
  return {
    isSuccess: () => true,
    filter: (p) => {
      if (p(x))
        return success(x);
      return fail();
    },
    map: (f) => {
      try {
        return success(f(x));
      } catch (e) {
        return fail(x);
      }
    },
    failBind: () => success(x),
    orCatch: () => x
  };
}
function fail(x) {
  const monad = {};
  monad.isSuccess = () => false;
  monad.filter = () => monad;
  monad.map = () => monad;
  monad.failBind = (f) => f(x);
  monad.orCatch = (lazyError) => lazyError(x);
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
  return {
    map: (f) => maybe(f(x)),
    orElse: () => x
  };
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

// CodeRender/Code
function buildDom(nodeType) {
  const domNode = {};
  const attrs = {};
  const events = [];
  let children = [];
  const lazyActions = [];
  let innerHtml = "";
  let innerText = "";
  let ref = null;
  domNode.appendChild = (...nodes) => {
    nodes.forEach((node) => children.push(node));
    return domNode;
  };
  domNode.appendChildFirst = (...nodes) => {
    children = nodes.concat(children);
    return domNode;
  };
  domNode.inner = (content) => {
    innerHtml = content;
    return domNode;
  };
  domNode.innerText = (content) => {
    innerText = content;
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
    if (typeof window === "undefined")
      return domNode.toString();
    const dom = SVG_TAGS.includes(nodeType) ? document.createElementNS(SVG_URL, nodeType) : document.createElement(nodeType);
    Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
    events.forEach((event) => dom.addEventListener(event.eventType, event.lambda));
    innerHtml ? dom.innerHTML = innerHtml : dom.innerText = innerText;
    if (children.length > 0) {
      children.forEach((child) => {
        if (!child.build || child.isEmpty())
          return;
        dom.appendChild(child.build());
      });
    }
    lazyActions.forEach((lazyAction) => lazyAction(dom));
    ref = dom;
    return dom;
  };
  domNode.toString = (options = {}) => {
    const { isFormatted = false, n = 0 } = options;
    const domArray = [];
    domArray.push(...startTagToString({ nodeType, attrs, isFormatted }));
    domArray.push(...childrenToString({
      children,
      innerHtml: innerHtml ? innerHtml : innerText,
      isFormatted,
      n
    }));
    domArray.push(...endTagToString({ nodeType, isFormatted, n }));
    const result = domArray.join("");
    return result;
  };
  domNode.isEmpty = () => children.length === 0 && innerHtml === "";
  domNode.getChildren = () => children;
  domNode.getInner = () => innerHtml;
  domNode.getAttrs = () => attrs;
  domNode.getEvents = () => events;
  domNode.getLazyActions = () => lazyActions;
  domNode.getType = () => nodeType;
  domNode.getRef = () => (f) => f(maybe(ref));
  domNode.isEmpty = () => !nodeType;
  return domNode;
}
var childrenToString = function({
  children,
  innerHtml,
  isFormatted,
  n
}) {
  const result = [];
  const indentation = Array(n + 1).fill("  ").join("");
  if (children.length > 0) {
    result.push(...children.map((child) => `${isFormatted ? indentation : ""}${child.toString({ isFormatted, n: n + 1 })}${isFormatted ? "\n" : ""}`));
  } else {
    if (isFormatted)
      result.push(indentation);
    result.push(innerHtml);
    if (isFormatted)
      result.push("\n");
  }
  return result;
};
var startTagToString = function({ nodeType, attrs, isFormatted }) {
  const result = [];
  if (!nodeType)
    return "";
  result.push(`<${nodeType}`);
  result.push(...Object.entries(attrs).map(([attr, value]) => ` ${attr}="${value}" `));
  result.push(`>`);
  if (isFormatted)
    result.push("\n");
  return result;
};
var endTagToString = function({ nodeType, isFormatted, n }) {
  if (!nodeType)
    return "";
  const indentation = Array(n).fill("  ").join("");
  const result = [];
  if (isFormatted)
    result.push(indentation);
  result.push(`</${nodeType}>`);
  return result;
};
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
import {readFileSync} from "fs";
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
function eatSpacesTabsAndNewLines(tokenStream) {
  return eatSymbolsWhile(tokenStream, (s) => s.type === " " || s.type === "\t" || s.type === "\n");
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
async function runLazyAsyncsInOrder(asyncLambdas) {
  for (const asyncLambda of asyncLambdas) {
    await asyncLambda();
  }
}
function createDefaultEl() {
  const defaultDiv = buildDom("div");
  defaultDiv.inner("This could be a bug!!");
  return defaultDiv;
}
function measureTime(lambda) {
  const t = performance.now();
  lambda();
  return 0.001 * (performance.now() - t);
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
function innerHTMLToInnerText(innerHTML) {
  let innerText = innerHTML.replace(/<[^>]*>/g, "");
  const entities = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&apos;": "'"
  };
  for (const entity in entities) {
    innerText = innerText.replace(new RegExp(entity, "g"), entities[entity]);
  }
  return innerText.replaceAll("\n", "");
}
function fetchResource(resourceName) {
  return fetch(resourceName).then((data) => {
    if (!data.ok)
      throw new Error(`Resource ${resourceName}, not found`);
    return data;
  });
}
function readResource(resourceName) {
  return success(resourceName).map((url) => {
    return readFileSync(url, { encoding: "utf8" });
  });
}
function tryFetch(...urls) {
  if (urls.length === 0)
    return Promise.reject("Fetching null resource");
  const [url, ...rest] = urls;
  return fetchResource(url).catch(() => tryFetch(...rest));
}
function tryRead(...urls) {
  if (urls.length === 0)
    return fail("Reading null resource");
  const [url, ...rest] = urls;
  return readResource(url).failBind(() => tryRead(...rest));
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
  tokenSymbol("<!--"),
  tokenSymbol("-->"),
  tokenSymbol("*"),
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
  tokenSymbol("/"),
  tokenSymbol("<"),
  tokenSymbol(">"),
  tokenSymbol('"'),
  tokenSymbol("'"),
  tokenSymbol("="),
  tokenSymbol("http"),
  tokenOrderedList()
];
var TOKEN_PARSER_FINAL = orToken(...TOKENS_PARSERS, tokenText());
var ALL_SYMBOLS = [...TOKENS_PARSERS.map(({ symbol }) => symbol), TEXT_SYMBOL];

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
    let nextStream = stream2;
    const textArray = [];
    while (!nextStream.isEmpty() && !tokenPredicate(nextStream.head())) {
      textArray.push(nextStream.head().text);
      nextStream = nextStream.tail();
    }
    return pair({ type: TYPES.anyBut, textArray }, nextStream);
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
        language: languageAnyBut.textArray.join("").trim()
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
var createStringParser = function(string) {
  let tokenStream = tokenizer(stream(string));
  return (stream2) => {
    let s = stream2;
    while (!tokenStream.isEmpty()) {
      if (s.head().text !== tokenStream.head().text)
        throw new Error(`Error occurred while parsing string ${string},` + stream2.toString());
      s = s.tail();
      tokenStream = tokenStream.tail();
    }
    return pair(string, s);
  };
};
var parseAnonLink = function(stream2) {
  return or(() => {
    const cleanStream = eatSpaces(stream2);
    const { left: httpStr, right: nextStream } = or(() => createStringParser("https://")(cleanStream), () => createStringParser("http://")(cleanStream));
    const { left: AnyBut, right: nextStream2 } = parseAnyBut((s) => s.type === " " || s.type === "\n" || s.type === "\t")(nextStream);
    const url = httpStr + AnyBut.textArray.join("");
    return pair({
      type: TYPES.anonlink,
      LinkExpression: {
        type: TYPES.linkExpression,
        expressions: [{ type: TYPES.linkTypes, SingleBut: { type: TYPES.singleBut, text: url } }]
      },
      link: url
    }, nextStream2);
  }, () => {
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
      const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => token.type === ")")(nextStream.take(2));
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
    }).orCatch(() => {
      throw new Error("Error occurred while parsing AnonLink," + stream2.toString());
    });
  });
};
var parseLinkExpression = function(stream2) {
  return or(() => {
    const { left: LinkTypes, right: nextStream } = parseLinkTypes(stream2);
    const { left: LinkExpression, right: nextNextStream } = parseLinkExpression(nextStream);
    return pair({
      type: TYPES.linkExpression,
      expressions: simplifyExpressions([LinkTypes, ...LinkExpression.expressions])
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
  }).orCatch(() => {
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
  }).orCatch(() => {
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
  }).orCatch(() => {
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
  }).orCatch(() => {
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
    return token.type === "*";
  }).map((nextStream) => {
    return parseBoldExpression(nextStream.tail());
  }).filter(({ right: nextStream }) => {
    const token = nextStream.head();
    return token.type === "*";
  }).map(({ left: BoldExpression, right: nextStream }) => {
    return pair({ type: TYPES.bold, BoldExpression }, nextStream.tail());
  }).orCatch(() => {
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
    const { left: SingleBut, right: nextStream } = parseSingleBut((token) => ["\n", "*"].includes(token.type))(stream2);
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
    return indentation(n, nextNextStream);
  }).filter((nextStream) => {
    return λ === nextStream.head().type;
  }).map((nextStream) => {
    const filterNextSpace = filterSpace(nextStream.tail());
    return parseExpression(filterNextSpace);
  }).filter(({ right: nextStream }) => {
    return nextStream.head().type === "\n";
  }).map(({ left: Expression, right: nextStream }) => {
    return pair(Expression, nextStream.tail());
  }).orCatch(() => {
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
  }, () => {
    const { left: CommentTag, right: nextStream } = parseCommentTag(stream2);
    return pair({ type: TYPES.html, CommentTag }, nextStream);
  });
};
var parseStartTag = function(stream2) {
  const token = stream2.head();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream2.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
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
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
    if (nextStream5.head().type === "/>") {
      return pair({ type: TYPES.emptyTag, tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error(`Error occurred while parsing EmptyTag,` + stream2.toString());
};
var parseCommentTag = function(stream2) {
  return success(stream2).filter((nextStream) => {
    return nextStream.head().type === "<!--";
  }).map((nextStream) => {
    const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "-->")(nextStream.tail());
    if (AnyBut.textArray.length > 0)
      return pair({ type: TYPES.commentTag }, nextStream1.tail());
    throw new Error(`Dummy error. Real error to be thrown in _orCatch_ function`);
  }).orCatch(() => {
    throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
  });
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
    const nextStreamNoSpaces = eatSpacesTabsAndNewLines(nextStream);
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
    }).orCatch(() => {
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
    }).orCatch(() => {
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
    }).orCatch(() => {
      throw new Error(`Error occurred while parsing Attr, ${stream2.toString()}`);
    });
  });
};
var parseInnerHtml = function(stream2) {
  return or(() => {
    const { left: InnerHtmlTypes, right: nextStream } = parseInnerHtmlTypes(stream2);
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
    const { left: Paragraph, right: nextStream } = parseParagraph(filteredStream);
    return pair({
      type: TYPES.innerHtmlTypes,
      Paragraph
    }, nextStream);
  }, () => {
    const { left: Expression, right: nextStream } = parseExpression(filteredStream);
    if (Expression.expressions.length === 0)
      throw new Error("Empty expression while parsing innerHtmlType" + nextStream.toString());
    return pair({
      type: TYPES.innerHtmlTypes,
      Expression
    }, nextStream);
  });
};
var parseEndTag = function(stream2) {
  const filteredStream = eatSpacesTabsAndNewLines(stream2);
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
var simplifyExpressions = function(expressions) {
  let state = 0;
  let groupText = [];
  const newExpressions = [];
  const groupSingleBut = (singleList) => ({
    type: TYPES.linkTypes,
    SingleBut: {
      type: TYPES.singleBut,
      text: singleList.map(({ SingleBut }) => SingleBut.text).join("")
    }
  });
  expressions.forEach((expression) => {
    if (state === 0 && expression.SingleBut) {
      groupText.push(expression);
      return;
    }
    if (state === 0 && !expression.SingleBut) {
      newExpressions.push(groupSingleBut(groupText));
      groupText = [];
      state = 1;
      return;
    }
    if (state === 1 && !expression.SingleBut) {
      newExpressions.push(expression);
      return;
    }
    if (state === 1 && expression.SingleBut) {
      groupText.push(expression);
      state = 0;
      return;
    }
  });
  if (groupText.length)
    newExpressions.push(groupSingleBut(groupText));
  return newExpressions;
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
  commentTag: "commentTag",
  innerHtml: "innerHtml",
  innerHtmlTypes: "innerHtmlTypes",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs"
};
var indentation = (n, stream2) => {
  return eatNSymbol(n, (s) => s.head().type === " " || s.head().type === "\t")(stream2);
};
export {
  parseExpression,
  parseAlphaNumName,
  parse,
  TYPES
};
