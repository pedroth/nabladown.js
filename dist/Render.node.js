(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Render"] = factory();
	else
		root["Render"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Render.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Render.js":
/*!***********************!*\
  !*** ./src/Render.js ***!
  \***********************/
/*! exports provided: render */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ \"@babel/runtime/helpers/esm/toConsumableArray\");\n/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var katex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! katex */ \"katex\");\n/* harmony import */ var katex__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(katex__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ \"./src/Utils.js\");\n/* harmony import */ var highlight_js_styles_railscasts_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! highlight.js/styles/railscasts.css */ \"highlight.js/styles/railscasts.css\");\n/* harmony import */ var highlight_js_styles_railscasts_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(highlight_js_styles_railscasts_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var highlight_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! highlight.js */ \"highlight.js\");\n/* harmony import */ var highlight_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(highlight_js__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n // TODO: Find a way to work with lazy loading and webpack\n\n //========================================================================================\n\n/*                                                                                      *\n *                                        RENDER                                        *\n *                                                                                      */\n//========================================================================================\n\n/**\n * render: Abstract syntactic tree => HTML\n * @param {*} tree\n * @returns HTML object\n *\n */\n\nfunction render(tree) {\n  var listOfExpressions = renderProgram(tree);\n  var body = document.createElement(\"div\");\n  listOfExpressions.forEach(function (e) {\n    return body.appendChild(e);\n  });\n  return body;\n}\n/**\n *\n * program => [HTML]\n *\n * @param {*} program\n */\n\nfunction renderProgram(program) {\n  if (program.expression === null && program.program === null) return [];\n  var expression = renderExpression(program.expression);\n  var listOfExpression = renderProgram(program.program);\n  return [expression].concat(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(listOfExpression));\n}\n/**\n *\n * expression => HTML\n *\n * @param {*} expression\n */\n\n\nfunction renderExpression(expression) {\n  return renderStatement(expression.Statement);\n}\n/**\n *\n * statement => HTML\n * @param {*} statement\n */\n\n\nfunction renderStatement(statement) {\n  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"returnOne\"])([{\n    predicate: function predicate(s) {\n      return !!s.Title;\n    },\n    value: function value(s) {\n      return renderTitle(s.Title);\n    }\n  }, {\n    predicate: function predicate(s) {\n      return !!s.Seq;\n    },\n    value: function value(s) {\n      return renderSeq(s.Seq);\n    }\n  }], document.createElement(\"div\"))(statement);\n}\n/**\n * title => HTML\n * @param {*} title\n */\n\n\nfunction renderTitle(title) {\n  var level = title.level,\n      Seq = title.Seq;\n  var header = document.createElement(\"h\".concat(level));\n  header.appendChild(renderSeq(Seq));\n  return header;\n}\n/**\n * seq => HTML\n * @param {*} seq\n */\n\n\nfunction renderSeq(seq) {\n  var div = document.createElement(\"div\");\n  var seqArray = renderAuxSeq(seq);\n  if (seqArray.length === 0) return div.appendChild(document.createElement(\"br\"));\n  seqArray.forEach(function (seqDiv) {\n    return div.appendChild(seqDiv);\n  });\n  div.setAttribute(\"style\", \"display: flex; align-items: center\");\n  return div;\n}\n\nfunction renderAuxSeq(seq) {\n  if (seq.isEmpty) return [];\n  var seqTypesDiv = renderSeqTypes(seq.SeqTypes);\n  var seqDivArray = renderAuxSeq(seq.Seq);\n  return [seqTypesDiv].concat(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(seqDivArray));\n}\n/**\n * seqTypes => HTML\n *\n * @param {*} seqTypes\n */\n\n\nfunction renderSeqTypes(seqTypes) {\n  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"returnOne\"])([{\n    predicate: function predicate(t) {\n      return !!t.Text;\n    },\n    value: function value(t) {\n      return renderText(t.Text);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Formula;\n    },\n    value: function value(t) {\n      return renderFormula(t.Formula);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Html;\n    },\n    value: function value(t) {\n      return renderHtml(t.Html);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Code;\n    },\n    value: function value(t) {\n      return renderCode(t.Code);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Link;\n    },\n    value: function value(t) {\n      return renderLink(t.Link);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Italic;\n    },\n    value: function value(t) {\n      return renderItalic(t.Italic);\n    }\n  }, {\n    predicate: function predicate(t) {\n      return !!t.Bold;\n    },\n    value: function value(t) {\n      return renderBold(t.Bold);\n    }\n  }], document.createElement(\"div\"))(seqTypes);\n}\n/**\n * text => HTML\n * @param {*} text\n */\n\n\nfunction renderText(text) {\n  var txt = text.text;\n  var div = document.createElement(\"pre\");\n  div.innerHTML = txt;\n  return div;\n}\n/**\n * italic => HTML\n * @param {*} italic\n */\n\n\nfunction renderItalic(italic) {\n  var SeqTypes = italic.SeqTypes;\n  var div = document.createElement(\"em\");\n  div.appendChild(renderSeqTypes(SeqTypes));\n  return div;\n}\n/**\n * bold => HTML\n * @param {*} bold\n */\n\n\nfunction renderBold(bold) {\n  var SeqTypes = bold.SeqTypes;\n  var div = document.createElement(\"strong\");\n  div.appendChild(renderSeqTypes(SeqTypes));\n  return div;\n}\n/**\n * anyBut => HTML\n * @param {*} anyBut\n */\n\n\nfunction renderAnyBut(anyBut) {\n  var textArray = anyBut.textArray;\n  var div = document.createElement(\"pre\");\n  div.innerHTML = textArray.join(\"\");\n  return div;\n}\n/**\n * formula => HTML\n * @param {*} formula\n */\n\n\nfunction renderFormula(formula) {\n  //must check if katex exist\n  var Katex = katex__WEBPACK_IMPORTED_MODULE_1___default.a || {\n    render: function render() {}\n  };\n  var equation = formula.equation;\n  var div = document.createElement(\"div\");\n  if (!formula.isInline) div.setAttribute(\"style\", \"flex-grow: 1\");\n  Katex.render(equation, div, {\n    throwOnError: false,\n    displayMode: !formula.isInline\n  });\n  return div;\n}\n/**\n * html => HTML\n * @param {*} html\n */\n\n\nfunction renderHtml(html) {\n  var innerHtml = html.html;\n  var div = document.createElement(\"div\");\n  div.innerHTML = innerHtml;\n  var scripts = Array.from(div.getElementsByTagName(\"script\"));\n  var asyncLambdas = scripts.map(function (script) {\n    return function () {\n      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"evalScriptTag\"])(script);\n    };\n  });\n  Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"asyncForEach\"])(asyncLambdas);\n  return div;\n}\n/**\n * code => HTML\n * @param {*} code\n */\n\n\nfunction renderCode(code) {\n  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"returnOne\"])([{\n    predicate: function predicate(c) {\n      return !!c.LineCode;\n    },\n    value: function value(c) {\n      return renderLineCode(c.LineCode);\n    }\n  }, {\n    predicate: function predicate(c) {\n      return !!c.BlockCode;\n    },\n    value: function value(c) {\n      return renderBlockCode(c.BlockCode);\n    }\n  }], document.createElement(\"div\"))(code);\n}\n/**\n * lineCode => HTML\n * @param {*} lineCode\n */\n\n\nfunction renderLineCode(lineCode) {\n  var code = lineCode.code;\n  return getHighlightedCodeElem(code, \"\", true);\n}\n/**\n * blockCode => HTML\n * @param {*} blockCode\n */\n\n\nfunction renderBlockCode(blockCode) {\n  var code = blockCode.code,\n      language = blockCode.language;\n  return getHighlightedCodeElem(code, language);\n}\n\nfunction getHighlightedCodeElem(code, language) {\n  var isInline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n  var lang = language === \"\" ? \"plaintext\" : language;\n  var pre = document.createElement(\"pre\");\n  var style = \"\\n  border-style: solid;\\n  border-width: thin;\\n  border-radius: 6px;\\n  box-sizing: border-box;\\n  background-color: #232323;\\n  border: hidden;\\n \";\n  style += isInline ? \"padding: 5px\" : \"\\n  flex-grow: 1;\\n  padding: 16px;\\n  overflow: auto;\\n  font-size: 97%;\\n  \";\n  pre.setAttribute(\"style\", style);\n  var codeHtml = document.createElement(\"code\");\n  codeHtml.setAttribute(\"class\", \"language-\".concat(lang)); // lazy load doesn't work with webpack, only if I hack the bundle\n  // import(`highlight.js/lib/languages/${lang}`).then(({ default: langLib }) => {\n  //   hljs.registerLanguage(lang, langLib);\n  //   codeHtml.innerHTML = hljs.highlight(lang, code).value;\n  // });\n\n  codeHtml.innerHTML = highlight_js__WEBPACK_IMPORTED_MODULE_4___default.a.highlight(lang, code).value;\n  pre.appendChild(codeHtml);\n  return pre;\n}\n/**\n * link => HTML\n * @param {*} link\n */\n\n\nfunction renderLink(link) {\n  var LinkStat = link.LinkStat,\n      hyperlink = link.link;\n  var div = document.createElement(\"a\");\n  div.setAttribute(\"href\", hyperlink);\n  hyperlink.includes(\"http\") && div.setAttribute(\"target\", \"_blank\");\n  var childStatement = renderLinkStat(LinkStat);\n  div.appendChild(childStatement);\n  return div;\n}\n/**\n * linkStat => HTML\n * @param {*} linkStat\n */\n\n\nfunction renderLinkStat(linkStat) {\n  var ans = document.createElement(\"div\");\n  var seqArray = renderAuxLinkStat(linkStat);\n  seqArray.forEach(function (seqDiv) {\n    return ans.appendChild(seqDiv);\n  });\n  return ans;\n}\n\nfunction renderAuxLinkStat(linkStat) {\n  if (linkStat.isEmpty) return [];\n  var linkTypeDiv = renderLinkTypes(linkStat.LinkType);\n  var linkStatDivArray = renderAuxLinkStat(linkStat.LinkStat);\n  return [linkTypeDiv].concat(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(linkStatDivArray));\n}\n/**\n * linkTypes => HTML\n * @param {*} linkTypes\n */\n\n\nfunction renderLinkTypes(linkTypes) {\n  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__[\"returnOne\"])([{\n    predicate: function predicate(l) {\n      return !!l.AnyBut;\n    },\n    value: function value(l) {\n      return renderAnyBut(l.AnyBut);\n    }\n  }, {\n    predicate: function predicate(l) {\n      return !!l.Formula;\n    },\n    value: function value(l) {\n      return renderFormula(l.Formula);\n    }\n  }, {\n    predicate: function predicate(l) {\n      return !!l.Code;\n    },\n    value: function value(l) {\n      return renderCode(l.Code);\n    }\n  }, {\n    predicate: function predicate(l) {\n      return !!l.Html;\n    },\n    value: function value(l) {\n      return renderHtml(l.Html);\n    }\n  }, {\n    predicate: function predicate(l) {\n      return !!l.Italic;\n    },\n    value: function value(l) {\n      return renderItalic(l.Italic);\n    }\n  }, {\n    predicate: function predicate(l) {\n      return !!l.Bold;\n    },\n    value: function value(l) {\n      return renderBold(l.Bold);\n    }\n  }], document.createElement(\"div\"))(linkTypes);\n}\n\n//# sourceURL=webpack://%5Bname%5D/./src/Render.js?");

/***/ }),

/***/ "./src/Utils.js":
/*!**********************!*\
  !*** ./src/Utils.js ***!
  \**********************/
/*! exports provided: pair, stream, or, returnOne, evalScriptTag, functionEncode, asyncForEach */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"pair\", function() { return pair; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"stream\", function() { return stream; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"or\", function() { return or; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"returnOne\", function() { return returnOne; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"evalScriptTag\", function() { return evalScriptTag; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"functionEncode\", function() { return functionEncode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"asyncForEach\", function() { return asyncForEach; });\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ \"@babel/runtime/regenerator\");\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/asyncToGenerator */ \"@babel/runtime/helpers/esm/asyncToGenerator\");\n/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ \"@babel/runtime/helpers/esm/toConsumableArray\");\n/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\nfunction _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === \"undefined\" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it[\"return\"] != null) it[\"return\"](); } finally { if (didErr) throw err; } } }; }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\n//========================================================================================\n\n/*                                                                                      *\n *                                         UTILS                                        *\n *                                                                                      */\n//========================================================================================\n\n/**\n * creates a pair pair: (a,b) => pair\n * @param {*} a left\n * @param {*} b right\n */\nfunction pair(a, b) {\n  return {\n    left: a,\n    right: b\n  };\n}\n/**\n * creates a stream from a string, string => stream\n * @param {*} string\n */\n\nfunction stream(stringOrArray) {\n  // copy array or string to array\n  var array = _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2___default()(stringOrArray);\n\n  return {\n    next: function next() {\n      return stream(array.slice(1));\n    },\n    peek: function peek() {\n      return array[0];\n    },\n    hasNext: function hasNext() {\n      return array.length >= 1;\n    },\n    isEmpty: function isEmpty() {\n      return array.length === 0;\n    },\n    toString: function toString() {\n      return array.map(function (s) {\n        return typeof s === \"string\" ? s : JSON.stringify(s);\n      }).join(\"\");\n    },\n    filter: function filter(predicate) {\n      return stream(array.filter(predicate));\n    },\n    log: function log() {\n      var s = stream(array);\n\n      while (s.hasNext()) {\n        console.log(s.peek());\n        s = s.next();\n      }\n    }\n  };\n}\n/**\n *  Select one rule\n * @param  {...any} rules\n */\n\nfunction or() {\n  var accError = null;\n\n  for (var _len = arguments.length, rules = new Array(_len), _key = 0; _key < _len; _key++) {\n    rules[_key] = arguments[_key];\n  }\n\n  for (var i = 0; i < rules.length; i++) {\n    try {\n      return rules[i]();\n    } catch (error) {\n      accError = error;\n    }\n  }\n\n  throw accError;\n}\n/**\n * Returns a value based on the predicate\n * @param {*} listOfPredicates\n * @param {*} defaultValue\n */\n\nfunction returnOne(listOfPredicates, defaultValue) {\n  return function (input) {\n    for (var i = 0; i < listOfPredicates.length; i++) {\n      if (listOfPredicates[i].predicate(input)) return listOfPredicates[i].value(input);\n    }\n\n    return defaultValue;\n  };\n}\nfunction evalScriptTag(scriptTag) {\n  var _scriptTag$attributes;\n\n  var globalEval = eval;\n  var srcUrl = scriptTag === null || scriptTag === void 0 ? void 0 : (_scriptTag$attributes = scriptTag.attributes[\"src\"]) === null || _scriptTag$attributes === void 0 ? void 0 : _scriptTag$attributes.textContent;\n\n  if (!!srcUrl) {\n    return fetch(srcUrl).then(function (code) {\n      return code.text();\n    }).then(function (code) {\n      globalEval(code);\n    });\n  } else {\n    return new Promise(function (re, _) {\n      globalEval(scriptTag.innerText);\n      re(true);\n    });\n  }\n}\nfunction functionEncode(functionString) {\n  return functionString.replaceAll('\"', \"'\");\n}\nfunction asyncForEach(_x) {\n  return _asyncForEach.apply(this, arguments);\n}\n\nfunction _asyncForEach() {\n  _asyncForEach = _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(asyncLambdas) {\n    var _iterator, _step, asyncLambda;\n\n    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            _iterator = _createForOfIteratorHelper(asyncLambdas);\n            _context.prev = 1;\n\n            _iterator.s();\n\n          case 3:\n            if ((_step = _iterator.n()).done) {\n              _context.next = 9;\n              break;\n            }\n\n            asyncLambda = _step.value;\n            _context.next = 7;\n            return asyncLambda();\n\n          case 7:\n            _context.next = 3;\n            break;\n\n          case 9:\n            _context.next = 14;\n            break;\n\n          case 11:\n            _context.prev = 11;\n            _context.t0 = _context[\"catch\"](1);\n\n            _iterator.e(_context.t0);\n\n          case 14:\n            _context.prev = 14;\n\n            _iterator.f();\n\n            return _context.finish(14);\n\n          case 17:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee, null, [[1, 11, 14, 17]]);\n  }));\n  return _asyncForEach.apply(this, arguments);\n}\n\n//# sourceURL=webpack://%5Bname%5D/./src/Utils.js?");

/***/ }),

/***/ "@babel/runtime/helpers/esm/asyncToGenerator":
/*!**************************************************************!*\
  !*** external "@babel/runtime/helpers/esm/asyncToGenerator" ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@babel/runtime/helpers/esm/asyncToGenerator\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22@babel/runtime/helpers/esm/asyncToGenerator%22?");

/***/ }),

/***/ "@babel/runtime/helpers/esm/toConsumableArray":
/*!***************************************************************!*\
  !*** external "@babel/runtime/helpers/esm/toConsumableArray" ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@babel/runtime/helpers/esm/toConsumableArray\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22@babel/runtime/helpers/esm/toConsumableArray%22?");

/***/ }),

/***/ "@babel/runtime/regenerator":
/*!*********************************************!*\
  !*** external "@babel/runtime/regenerator" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@babel/runtime/regenerator\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22@babel/runtime/regenerator%22?");

/***/ }),

/***/ "highlight.js":
/*!*******************************!*\
  !*** external "highlight.js" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"highlight.js\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22highlight.js%22?");

/***/ }),

/***/ "highlight.js/styles/railscasts.css":
/*!*****************************************************!*\
  !*** external "highlight.js/styles/railscasts.css" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"highlight.js/styles/railscasts.css\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22highlight.js/styles/railscasts.css%22?");

/***/ }),

/***/ "katex":
/*!************************!*\
  !*** external "katex" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"katex\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22katex%22?");

/***/ })

/******/ });
});