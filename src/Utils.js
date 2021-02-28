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
export function pair(a, b) {
  return { left: a, right: b };
}

/**
 * creates a stream from a string, string => stream
 * @param {*} string
 */
export function stream(stringOrArray) {
  // copy array or string to array
  const array = [...stringOrArray];
  return {
    next: () => stream(array.slice(1)),
    peek: () => array[0],
    hasNext: () => array.length >= 1,
    isEmpty: () => array.length === 0,
    toString: () =>
      array.map(s => (typeof s === "string" ? s : JSON.stringify(s))).join(""),
    filter: predicate => stream(array.filter(predicate)),
    log: () => {
      let s = stream(array);
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
export function or(...rules) {
  let accError = null;
  for (let i = 0; i < rules.length; i++) {
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
export function returnOne(listOfPredicates, defaultValue = createDefaultEl()) {
  return input => {
    for (let i = 0; i < listOfPredicates.length; i++) {
      if (listOfPredicates[i].predicate(input))
        return listOfPredicates[i].value(input);
    }
    return defaultValue;
  };
}

export function evalScriptTag(scriptTag) {
  const globalEval = eval;
  const srcUrl = scriptTag?.attributes["src"]?.textContent;
  if (!!srcUrl) {
    return fetch(srcUrl)
      .then(code => code.text())
      .then(code => {
        globalEval(code);
      });
  } else {
    return new Promise((re, _) => {
      globalEval(scriptTag.innerText);
      re(true);
    });
  }
}

export async function asyncForEach(asyncLambdas) {
  for (const asyncLambda of asyncLambdas) {
    await asyncLambda();
  }
}

export function isParagraph(domNode) {
  return domNode.constructor.name === "HTMLParagraphElement";
}

export function createDefaultEl() {
  return document.createElement("div");
}

export function bindAll(obj) {
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    .filter(prop => prop === "constructor")
    .forEach(method => (obj[method] = obj[method].bind(obj)));
}
