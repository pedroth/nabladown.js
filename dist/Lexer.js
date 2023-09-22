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
function eatSymbol(n, symbolPredicate) {
  return function(stream2) {
    if (n === 0)
      return stream2;
    if (symbolPredicate(stream2)) {
      return eatSymbol(n - 1, symbolPredicate)(stream2.tail());
    }
    throw new Error(`Caught error while eating ${n} symbols`, stream2.toString());
  };
}
function eatSpaces(tokenStream) {
  let s = tokenStream;
  if (s.head().type !== " ")
    return s;
  while (s.head().type === " ")
    s = s.tail();
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
export {
  tokenizer,
  TEXT_SYMBOL,
  ORDER_LIST_SYMBOL,
  LINE_SEPARATOR_SYMBOL,
  CUSTOM_SYMBOL,
  CODE_SYMBOL,
  ALL_SYMBOLS
};
