(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Parser"] = factory();
	else
		root["Parser"] = factory();
})(window, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Parser.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayLikeToArray; });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayWithoutHoles; });
/* harmony import */ var _arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return Object(_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _asyncToGenerator; });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _iterableToArray; });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _nonIterableSpread; });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _toConsumableArray; });
/* harmony import */ var _arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return Object(_arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || Object(_iterableToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || Object(_unsupportedIterableToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || Object(_nonIterableSpread__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _unsupportedIterableToArray; });
/* harmony import */ var _arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return Object(_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Object(_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : undefined
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),

/***/ "./src/Lexer.js":
/*!**********************!*\
  !*** ./src/Lexer.js ***!
  \**********************/
/*! exports provided: tokenizer, tokenRepeatLessThan, tokenSymbol, tokenText */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenizer", function() { return tokenizer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenRepeatLessThan", function() { return tokenRepeatLessThan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenSymbol", function() { return tokenSymbol; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenText", function() { return tokenText; });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Utils */ "./src/Utils.js");

 //========================================================================================

/*                                                                                      *
 *                                     LEX ANALYSIS                                     *
 *                                                                                      */
//========================================================================================
//========================================================================================

/*                                                                                      *
 * Tokens
 * #^{1..6}
 * $^{1..2}
 * \n
 * [
 * ]
 * (
 * )
 * *^{1..2}
 *                                                                                      */
//========================================================================================

/**
 * Token := {type: String, text: String}
 *
 * keywords :=  #$][)('\n'*`
 * tokens: rep(`, 1..3), rep(+, 3), rep(*, 1..2), rep($,1..2), rep(#,1..6), 'text', ']', '[', '(', ')', '\n'
 * 'text' := ¬ keywords
 *
 */

/**
 * stream<char> => stream<tokens>
 * @param {*} s:Stream<Chars>
 * @returns Stream<Tokens>
 */

function tokenizer(charStream) {
  var acc = [];
  var s = charStream;

  while (s.hasNext()) {
    var _or = Object(_Utils__WEBPACK_IMPORTED_MODULE_1__["or"])(function () {
      return tokenRepeatLessThan("#", 6)(s);
    }, function () {
      return tokenRepeatLessThan("$", 2)(s);
    }, function () {
      return tokenRepeatLessThan("*", 2)(s);
    }, function () {
      return tokenRepeatLessThan("+", 3)(s);
    }, function () {
      return tokenRepeatLessThan("`", 3)(s);
    }, function () {
      return tokenSymbol("\n")(s);
    }, function () {
      return tokenSymbol("[")(s);
    }, function () {
      return tokenSymbol("]")(s);
    }, function () {
      return tokenSymbol("(")(s);
    }, function () {
      return tokenSymbol(")")(s);
    }, function () {
      return tokenSymbol(" ")(s);
    }, function () {
      return tokenText(s);
    }),
        token = _or.left,
        next = _or.right;

    acc.push(token);
    s = next;
  }

  return Object(_Utils__WEBPACK_IMPORTED_MODULE_1__["stream"])(acc);
}
function tokenRepeatLessThan(symbol, repeat) {
  return function (stream) {
    var n = repeat;
    var auxStream = stream;
    var textArray = [];

    while (auxStream.peek() === symbol && n >= 0) {
      n--;
      textArray.push(auxStream.peek());
      auxStream = auxStream.next();
    }

    var finalN = repeat - n;

    if (finalN > 0) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_1__["pair"])({
        type: symbol,
        repeat: finalN,
        text: textArray.join("")
      }, auxStream);
    }

    throw new Error("Error occurred while tokening repeated #".concat(repeat, ", with symbol ").concat(symbol, " ") + auxStream.toString());
  };
}
function tokenSymbol(symbol) {
  return function (stream) {
    var sym = Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(symbol);

    var s = stream;
    var i = 0;

    while (i < sym.length) {
      if (s.peek() === sym[i]) {
        i++;
        s = s.next();
      } else {
        throw new Error("Error occurred while tokening unique symbol ".concat(symbol, " ") + auxStream.toString());
      }
    }

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_1__["pair"])({
      type: symbol,
      repeat: 1,
      text: symbol
    }, s);
  };
}
function tokenText(stream) {
  var keyWords = Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])("`*#$[]()\n ");

  var token = [];
  var s = stream;

  while (s.hasNext() && !keyWords.includes(s.peek())) {
    token.push(s.peek());
    s = s.next();
  }

  return Object(_Utils__WEBPACK_IMPORTED_MODULE_1__["pair"])({
    type: "text",
    text: token.join("")
  }, s);
}

/***/ }),

/***/ "./src/Parser.js":
/*!***********************!*\
  !*** ./src/Parser.js ***!
  \***********************/
/*! exports provided: parse */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return parse; });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _Lexer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Lexer */ "./src/Lexer.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/Utils.js");

//========================================================================================

/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================


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
 * BlockCode-> ```AnyBut(\n)\n AnyBut('`')```
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

function parse(string) {
  var charStream = Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["stream"])(string);
  var tokenStream = Object(_Lexer__WEBPACK_IMPORTED_MODULE_1__["tokenizer"])(charStream);
  var program = parseProgram(tokenStream);
  console.log("Parse tree", program.left);
  return program.left;
}
/**
 * stream => pair(Program, stream)
 *
 * @param {*} stream
 */

function parseProgram(stream) {
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    var _parseExpression = parseExpression(stream),
        expression = _parseExpression.left,
        nextStream = _parseExpression.right;

    var _parseProgram = parseProgram(nextStream),
        program = _parseProgram.left,
        nextNextStream = _parseProgram.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "program",
      expression: expression,
      program: program
    }, nextNextStream);
  }, function () {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "program",
      expression: null,
      program: null
    }, stream);
  });
}
/**
 * stream => pair(Expression, stream)
 *
 * @param {*} stream
 */


function parseExpression(stream) {
  var _parseStatement = parseStatement(stream),
      Statement = _parseStatement.left,
      nextStream = _parseStatement.right;

  if (nextStream.peek().type === "\n") {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "expression",
      Statement: Statement
    }, nextStream.next());
  }

  throw new Error("Error occurred while parsing expression," + nextStream.toString());
}
/**
 * stream => pair(Statement, stream)
 * @param {*} stream
 */


function parseStatement(stream) {
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    var _parseTitle = parseTitle(stream),
        Title = _parseTitle.left,
        nextStream = _parseTitle.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "statement",
      Title: Title
    }, nextStream);
  }, function () {
    var _parseSeq = parseSeq(stream),
        Seq = _parseSeq.left,
        nextStream = _parseSeq.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "statement",
      Seq: Seq
    }, nextStream);
  });
}
/**
 *
 * stream => pair(Title, stream)
 * @param {*} stream
 */


function parseTitle(stream) {
  if (stream.peek().type === "#") {
    var level = stream.peek().repeat; // shortcut in parsing this rule

    var filterNextSpace = stream.next().peek().type === " " ? stream.next().next() : stream.next();

    var _parseSeq2 = parseSeq(filterNextSpace),
        Seq = _parseSeq2.left,
        _nextStream = _parseSeq2.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "title",
      Seq: Seq,
      level: level
    }, _nextStream);
  }

  throw new Error("Error occurred while parsing Title," + nextStream.toString());
}
/**
 *
 * stream => pair(Seq, stream)
 * @param {*} stream
 */


function parseSeq(stream) {
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    var _parseSeqTypes = parseSeqTypes(stream),
        SeqTypes = _parseSeqTypes.left,
        nextStream = _parseSeqTypes.right;

    var _parseSeq3 = parseSeq(nextStream),
        Seq = _parseSeq3.left,
        nextNextStream = _parseSeq3.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seq",
      SeqTypes: SeqTypes,
      Seq: Seq
    }, nextNextStream);
  }, function () {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seq",
      isEmpty: true
    }, stream);
  });
}
/**
 *
 * stream => pair(SeqTypes, stream)
 * @param {*} stream
 */


function parseSeqTypes(stream) {
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    var _parseFormula = parseFormula(stream),
        Formula = _parseFormula.left,
        nextStream = _parseFormula.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Formula: Formula
    }, nextStream);
  }, function () {
    var _parseHtml = parseHtml(stream),
        Html = _parseHtml.left,
        nextStream = _parseHtml.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Html: Html
    }, nextStream);
  }, function () {
    var _parseCode = parseCode(stream),
        Code = _parseCode.left,
        nextStream = _parseCode.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Code: Code
    }, nextStream);
  }, function () {
    var _parseLink = parseLink(stream),
        Link = _parseLink.left,
        nextStream = _parseLink.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Link: Link
    }, nextStream);
  }, function () {
    var _parseItalic = parseItalic(stream),
        Italic = _parseItalic.left,
        nextStream = _parseItalic.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Italic: Italic
    }, nextStream);
  }, function () {
    var _parseBold = parseBold(stream),
        Bold = _parseBold.left,
        nextStream = _parseBold.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Bold: Bold
    }, nextStream);
  }, function () {
    var _parseText = parseText(stream),
        Text = _parseText.left,
        nextStream = _parseText.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "seqTypes",
      Text: Text
    }, nextStream);
  });
}
/**
 *
 * stream => pair(Text, stream)
 * @param {*} stream
 */


function parseText(stream) {
  var token = stream.peek();

  if (!["\n"].some(function (s) {
    return token.type === s;
  })) {
    var text = token.text || "";
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "text",
      text: text
    }, stream.next());
  }

  throw new Error("Error occurred while parsing Text," + stream.toString());
}
/**
 *
 * stream => pair(Italic, stream)
 * @param {*} stream
 */


function parseItalic(stream) {
  var token = stream.peek();

  if (token.type === "*" && token.repeat === 1) {
    var _parseSeqTypes2 = parseSeqTypes(stream.next()),
        SeqTypes = _parseSeqTypes2.left,
        _nextStream2 = _parseSeqTypes2.right;

    var nextToken = _nextStream2.peek();

    if (nextToken.type === "*" && nextToken.repeat === 1) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "italic",
        SeqTypes: SeqTypes
      }, _nextStream2.next());
    }
  }

  throw new Error("Error occurred while parsing Italic," + nextStream.toString());
}
/**
 *
 * stream => pair(Bold, stream)
 * @param {*} stream
 */


function parseBold(stream) {
  var token = stream.peek();

  if (token.type === "*" && token.repeat === 2) {
    var _parseSeqTypes3 = parseSeqTypes(stream.next()),
        SeqTypes = _parseSeqTypes3.left,
        _nextStream3 = _parseSeqTypes3.right;

    var nextToken = _nextStream3.peek();

    if (nextToken.type === "*" && nextToken.repeat === 2) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "bold",
        SeqTypes: SeqTypes
      }, _nextStream3.next());
    }
  }

  throw new Error("Error occurred while parsing Italic," + nextStream.toString());
}
/**
 *
 * stream => pair(Formula, stream)
 * @param {*} stream
 */


function parseFormula(stream) {
  var token = stream.peek();
  var repeat = token.repeat;
  var error = new Error("Error occurred while parsing Formula," + stream.toString());

  if (token.type === "$") {
    var _parseAnyBut = parseAnyBut(function (token) {
      return ["$"].includes(token.type);
    })(stream.next()),
        AnyBut = _parseAnyBut.left,
        _nextStream4 = _parseAnyBut.right;

    var nextToken = _nextStream4.peek();

    if (nextToken.type === "$" && (nextToken === null || nextToken === void 0 ? void 0 : nextToken.repeat) === repeat) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "formula",
        equation: AnyBut.textArray.join(""),
        isInline: (nextToken === null || nextToken === void 0 ? void 0 : nextToken.repeat) === 1
      }, _nextStream4.next());
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
  var token = stream.peek();
  var repeat = token.repeat;
  var error = new Error("Error occurred while parsing Html," + stream.toString());

  if (token.type === "+" && repeat === 3) {
    var _parseAnyBut2 = parseAnyBut(function (token) {
      return ["+"].includes(token.type) && 3 === (token === null || token === void 0 ? void 0 : token.repeat);
    })(stream.next()),
        AnyBut = _parseAnyBut2.left,
        _nextStream5 = _parseAnyBut2.right;

    var nextToken = _nextStream5.peek();

    if (nextToken.type === "+" && (nextToken === null || nextToken === void 0 ? void 0 : nextToken.repeat) === repeat) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "html",
        html: AnyBut.textArray.join("")
      }, _nextStream5.next());
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
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    var _parseLineCode = parseLineCode(stream),
        LineCode = _parseLineCode.left,
        nextStream = _parseLineCode.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "code",
      LineCode: LineCode
    }, nextStream);
  }, function () {
    var _parseBlockCode = parseBlockCode(stream),
        BlockCode = _parseBlockCode.left,
        nextStream = _parseBlockCode.right;

    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "code",
      BlockCode: BlockCode
    }, nextStream);
  });
}
/**
 *
 * stream => pair(LineCode, stream)
 * @param {*} stream
 */


function parseLineCode(stream) {
  var lineCodeTokenPredicate = function lineCodeTokenPredicate(t) {
    return t.type === "`" && t.repeat === 1;
  };

  var token = stream.peek();

  if (lineCodeTokenPredicate(token)) {
    var _parseAnyBut3 = parseAnyBut(function (t) {
      return lineCodeTokenPredicate(t) || t.type === "\n";
    })(stream.next()),
        AnyBut = _parseAnyBut3.left,
        _nextStream6 = _parseAnyBut3.right;

    if (lineCodeTokenPredicate(_nextStream6.peek())) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "lineCode",
        code: AnyBut.textArray.join("")
      }, _nextStream6.next());
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
  var lineCodeTokenPredicate = function lineCodeTokenPredicate(t) {
    return t.type === "`" && t.repeat === 3;
  };

  var token = stream.peek();

  if (lineCodeTokenPredicate(token)) {
    var _parseAnyBut4 = parseAnyBut(function (t) {
      return t.type === "\n";
    })(stream.next()),
        languageAnyBut = _parseAnyBut4.left,
        _nextStream7 = _parseAnyBut4.right;

    var _parseAnyBut5 = parseAnyBut(lineCodeTokenPredicate)(_nextStream7.next()),
        AnyBut = _parseAnyBut5.left,
        nextNextStream = _parseAnyBut5.right;

    if (lineCodeTokenPredicate(nextNextStream.peek())) {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "blockCode",
        code: AnyBut.textArray.join(""),
        language: languageAnyBut.textArray.join("")
      }, nextNextStream.next());
    }
  }

  throw new Error("Error occurred while parsing BlockCode," + stream.toString());
}
/**
 *
 * (token => boolean) => pair(AnyBut, stream)
 * @param {*} tokenPredicate: token => boolean
 */


function parseAnyBut(tokenPredicate) {
  return function (stream) {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
      var peek = stream.peek();

      if (!tokenPredicate(peek)) {
        var _parseAnyBut6 = parseAnyBut(tokenPredicate)(stream.next()),
            AnyBut = _parseAnyBut6.left,
            _nextStream8 = _parseAnyBut6.right;

        return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
          type: "anyBut",
          textArray: [peek.text].concat(Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(AnyBut.textArray))
        }, _nextStream8);
      }

      throw new Error("Error occurred while parsing AnyBut," + stream.toString());
    }, function () {
      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "anyBut",
        textArray: []
      }, stream);
    });
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
    var _nextStream9 = stream.next();

    var _parseLinkStat = parseLinkStat(_nextStream9),
        LinkStat = _parseLinkStat.left,
        nextNextStream = _parseLinkStat.right;

    if (nextNextStream.peek().type === "]") {
      var next3Stream = nextNextStream.next();

      if (next3Stream.peek().type === "(") {
        var _parseAnyBut7 = parseAnyBut(function (token) {
          return ["\n", ")"].includes(token.type);
        })(next3Stream.next()),
            AnyBut = _parseAnyBut7.left,
            next4Stream = _parseAnyBut7.right;

        if (next4Stream.peek().type === ")") {
          return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
            type: "link",
            LinkStat: LinkStat,
            link: AnyBut.textArray.join("")
          }, next4Stream.next());
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
  return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["or"])(function () {
      var _parseFormula2 = parseFormula(stream),
          Formula = _parseFormula2.left,
          nextStream = _parseFormula2.right;

      var _parseLinkStat2 = parseLinkStat(nextStream),
          LinkStat = _parseLinkStat2.left,
          nextNextStream = _parseLinkStat2.right;

      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "linkStat",
        Formula: Formula,
        LinkStat: LinkStat
      }, nextNextStream);
    }, function () {
      var _parseAnyBut8 = parseAnyBut(function (token) {
        return ["\n", "]"].includes(token.type);
      })(stream),
          AnyBut = _parseAnyBut8.left,
          nextStream = _parseAnyBut8.right;

      if (AnyBut.textArray.length === 0) throw new Error("Error occurred while parsing LinkStat," + stream.toString());

      var _parseLinkStat3 = parseLinkStat(nextStream),
          LinkStat = _parseLinkStat3.left,
          nextNextStream = _parseLinkStat3.right;

      return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
        type: "linkStat",
        AnyBut: AnyBut,
        LinkStat: LinkStat
      }, nextNextStream);
    });
  }, function () {
    return Object(_Utils__WEBPACK_IMPORTED_MODULE_2__["pair"])({
      type: "linkStat",
      isEmpty: true
    }, stream);
  });
}

/***/ }),

/***/ "./src/Utils.js":
/*!**********************!*\
  !*** ./src/Utils.js ***!
  \**********************/
/*! exports provided: pair, stream, or, returnOne, evalScriptTag, functionEncode, asyncForEach */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pair", function() { return pair; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stream", function() { return stream; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "or", function() { return or; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "returnOne", function() { return returnOne; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evalScriptTag", function() { return evalScriptTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "functionEncode", function() { return functionEncode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asyncForEach", function() { return asyncForEach; });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");




function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

//========================================================================================

/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

/**
 * creates a pair pair: (a,b) => pair
 * @param {*} a left
 * @param {*} b right
 */
function pair(a, b) {
  return {
    left: a,
    right: b
  };
}
/**
 * creates a stream from a string, string => stream
 * @param {*} string
 */

function stream(stringOrArray) {
  // copy array or string to array
  var array = Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(stringOrArray);

  return {
    next: function next() {
      return stream(array.slice(1));
    },
    peek: function peek() {
      return array[0];
    },
    hasNext: function hasNext() {
      return array.length >= 1;
    },
    isEmpty: function isEmpty() {
      return array.length === 0;
    },
    toString: function toString() {
      return array.map(function (s) {
        return typeof s === "string" ? s : JSON.stringify(s);
      }).join("");
    },
    filter: function filter(predicate) {
      return stream(array.filter(predicate));
    },
    log: function log() {
      var s = stream(array);

      while (s.hasNext()) {
        console.log(s.peek());
        s = s.next();
      }
    }
  };
}
/**
 *  Select one rule
 * @param  {...any} rules
 */

function or() {
  var accError = null;

  for (var _len = arguments.length, rules = new Array(_len), _key = 0; _key < _len; _key++) {
    rules[_key] = arguments[_key];
  }

  for (var i = 0; i < rules.length; i++) {
    try {
      return rules[i]();
    } catch (error) {
      accError = error;
    }
  }

  throw accError;
}
/**
 * Returns a value based on the predicate
 * @param {*} listOfPredicates
 * @param {*} defaultValue
 */

function returnOne(listOfPredicates, defaultValue) {
  return function (input) {
    for (var i = 0; i < listOfPredicates.length; i++) {
      if (listOfPredicates[i].predicate(input)) return listOfPredicates[i].value(input);
    }

    return defaultValue;
  };
}
function evalScriptTag(scriptTag) {
  var _scriptTag$attributes;

  var globalEval = eval;
  var srcUrl = scriptTag === null || scriptTag === void 0 ? void 0 : (_scriptTag$attributes = scriptTag.attributes["src"]) === null || _scriptTag$attributes === void 0 ? void 0 : _scriptTag$attributes.textContent;

  if (!!srcUrl) {
    return fetch(srcUrl).then(function (code) {
      return code.text();
    }).then(function (code) {
      globalEval(code);
    });
  } else {
    return new Promise(function (re, _) {
      globalEval(scriptTag.innerText);
      re(true);
    });
  }
}
function functionEncode(functionString) {
  return functionString.replaceAll('"', "'");
}
function asyncForEach(_x) {
  return _asyncForEach.apply(this, arguments);
}

function _asyncForEach() {
  _asyncForEach = Object(_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(asyncLambdas) {
    var _iterator, _step, asyncLambda;

    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iterator = _createForOfIteratorHelper(asyncLambdas);
            _context.prev = 1;

            _iterator.s();

          case 3:
            if ((_step = _iterator.n()).done) {
              _context.next = 9;
              break;
            }

            asyncLambda = _step.value;
            _context.next = 7;
            return asyncLambda();

          case 7:
            _context.next = 3;
            break;

          case 9:
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](1);

            _iterator.e(_context.t0);

          case 14:
            _context.prev = 14;

            _iterator.f();

            return _context.finish(14);

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 11, 14, 17]]);
  }));
  return _asyncForEach.apply(this, arguments);
}

/***/ })

/******/ });
});
//# sourceMappingURL=Parser.js.map