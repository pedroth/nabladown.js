/**
 * Grammar
 *
 */

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
  return { left: a, right: b };
}

/**
 * creates a stream from a string, string => stream
 * @param {*} string
 */
function stream(stringOrArray) {
  // copy array or string to array
  const array = [...stringOrArray];
  return {
    next: () => stream(array.slice(1)),
    peek: () => array[0],
    hasNext: () => array.length > 1,
    isEmpty: () => array.length === 0,
    toString: () => array.join(""),
    filter: predicate => stream(array.filter(predicate)),
    map: mapLambda => stream(array.map(mapLambda))
  };
}

function readStream(stream) {
  while (stream.hasNext()) {
    console.log(stream.peek());
    stream = stream.next();
  }
}

function or(...rules) {
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
 * \*
 * _
 * \t
 * \space
 * >
 * <
 * +^{1|3}
 * \^
 * !
 * `{3}
 *                                                                                      */
//========================================================================================

/**
 *
 * @param {*} Stream<Chars>
 * @returns Stream<Tokens>
 */
function tokenizer(stream) {
  const acc = [];
  let s = stream;
  while (s.hasNext()) {
    const { left: token, right: next } = or(
      () => tokenText(s),
      () => tokenTitle(s),
      () => tokenDollar(s),
      () => tokenNewline(s),
      () => tokenStar(s),
      () => tokenTabs(s),
      () => tokenCollapse(s),
      () => tokenQuote(s),
      () => tokenCode(s),
      () => tokenTitle(s),
      () => tokenTitle(s),
      () => tokenTitle(s)
    );
    acc.push(token);
    s = next;
  }
  return stream(acc);
}

//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

//========================================================================================
/*                                                                                      *
 *                                        RENDER                                        *
 *                                                                                      */
//========================================================================================

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

/**
 * parse: String => Abstract syntactic tree
 * @param {*} string
 * @returns Parsing Tree
 */
export function parse(string) {
  [...string].forEach(char => console.log(char.charCodeAt(0)));
}

/**
 * render: Abstract syntactic tree => HTML
 * @param {*} tree
 * @returns HTML object
 *
 */
export function render(tree) {
  return document.createElement("div");
}
