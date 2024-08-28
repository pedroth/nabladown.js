var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
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

// src/Monads.js
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

// src/buildDom.js
function buildDom(nodeType) {
  const domNode = {};
  let type = nodeType;
  const attrs = {};
  const events = [];
  let children = [];
  const lazyActions = [];
  let innerHtml = "";
  let innerText = "";
  let ref = null;
  domNode.setType = (newType) => {
    type = newType;
    return domNode;
  };
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
  domNode.style = (value) => {
    return domNode.attr("style", value);
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
    const dom = SVG_TAGS.includes(type) ? document.createElementNS(SVG_URL, type) : document.createElement(type);
    Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
    events.forEach((event) => dom.addEventListener(event.eventType, event.lambda));
    innerHtml ? dom.innerHTML = innerHtml : dom.innerText = innerText;
    if (children.length > 0) {
      children.forEach((child) => {
        if (child.isEmpty())
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
    domArray.push(...startTagToString({ nodeType: type, attrs, isFormatted }));
    domArray.push(...childrenToString({
      n,
      children,
      isFormatted,
      parentNode: domNode,
      innerHtml: innerHtml ? innerHtml : innerText
    }));
    domArray.push(...endTagToString({ nodeType: type, isFormatted, n }));
    const result = domArray.join("");
    return result;
  };
  domNode.isEmpty = () => !type && children.length === 0 && Object.values(attrs).length === 0 && events.length === 0 && innerHtml === "" && innerText === "";
  domNode.getChildren = () => children;
  domNode.getInner = () => innerHtml;
  domNode.getAttrs = () => attrs;
  domNode.getEvents = () => events;
  domNode.getLazyActions = () => lazyActions;
  domNode.getType = () => type;
  domNode.getRef = () => (f) => f(maybe(ref));
  domNode.log = () => {
    return `
            type: ${type},
            children: ${children.map((c) => c.getType()).join()}
            attrs: ${Object.values(attrs).join()}
            hasEvents: ${events.length > 0}
            innerHtml: ${innerHtml}
            innerText: ${innerText}
        `;
  };
  return domNode;
}
function childrenToString({
  n,
  children,
  innerHtml,
  parentNode,
  isFormatted
}) {
  const result = [];
  const indentation = Array(n + 1).fill("  ").join("");
  if (children.length > 0) {
    result.push(...children.filter((child) => !child.isEmpty()).map((child) => {
      return `${isFormatted ? indentation : ""}${child.toString({ isFormatted, n: n + 1 })}${isFormatted ? "\n" : ""}`;
    }));
  } else {
    if (isFormatted)
      result.push(indentation);
    result.push(innerHtml);
    if (isFormatted)
      result.push("\n");
  }
  return result;
}
function startTagToString({ nodeType, attrs, isFormatted }) {
  const result = [];
  if (!nodeType)
    return "";
  result.push(`<${nodeType}`);
  result.push(...Object.entries(attrs).map(([attr, value]) => ` ${attr}="${value}" `));
  result.push(`>`);
  if (isFormatted)
    result.push("\n");
  return result;
}
function endTagToString({ nodeType, isFormatted, n }) {
  if (!nodeType)
    return "";
  const indentation = Array(n).fill("  ").join("");
  const result = [];
  if (isFormatted)
    result.push(indentation);
  result.push(`</${nodeType}>`);
  return result;
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

// src/Utils.js
var {readFileSync} = (()=>({}));
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
    throw new Error(`Caught error while eating ${n} symbols`);
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

// src/Lexer.js
function tokenSymbol(symbol) {
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
        throw new Error(`Error occurred while tokening unique symbol ${symbol} `);
      }
      return pair(tokenBuilder().type(symbol).text(symbol).build(), s);
    }
  };
}
function tokenRepeat(symbol, repeat) {
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
      throw new Error(`Error occurred while tokening repeated #${repeat}, with symbol ${symbol} `);
    }
  };
}
function tokenOrderedList() {
  const orderedListParser = (stream2) => {
    const char = stream2.head();
    if (Number.isNaN(Number.parseInt(char))) {
      throw new Error(`Error occurred while tokening ordered list start with symbol ${char} `);
    }
    const nextStream = stream2.tail();
    return or(() => {
      const { left: token, right: nextNextStream } = orderedListParser(nextStream);
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + token.text).build(), nextNextStream);
    }, () => {
      const char2 = nextStream.head();
      if (char2 !== ".") {
        throw new Error(`Error occurred while tokening ordered list start with symbol ${char2} `);
      }
      return pair(tokenBuilder().type(ORDER_LIST_SYMBOL).text(char + char2).build(), nextStream.tail());
    });
  };
  return {
    symbol: ORDER_LIST_SYMBOL,
    lookahead: () => [...Array(10)].map((_, i) => "" + i),
    parse: orderedListParser
  };
}
function orToken(...tokenParsers) {
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
}
function tokenText() {
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
}
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
var MACRO_SYMBOL = "::";
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
  tokenSymbol(MACRO_SYMBOL),
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
export {
  tokenizer,
  TEXT_SYMBOL,
  ORDER_LIST_SYMBOL,
  MACRO_SYMBOL,
  LINE_SEPARATOR_SYMBOL,
  CODE_SYMBOL,
  ALL_SYMBOLS
};
