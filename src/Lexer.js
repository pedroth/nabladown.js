import { or, pair, stream } from "./Utils";
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
 * keywords :=  #$][)('\n'-*`
 * tokens: rep(`, 1..3), rep(+, 3), rep(*, 1..2), rep($,1..2), rep(#,1..6), 'text', ']', '[', '(', ')', '\n'
 * 'text' := ¬ keywords
 *
 */

/**
 * stream<char> => stream<tokens>
 * @param {*} s:Stream<Chars>
 * @returns Stream<Tokens>
 */
export function tokenizer(charStream) {
  const acc = [];
  let s = charStream;
  while (s.hasNext()) {
    const { left: token, right: next } = or(
      () => tokenRepeatLessThan("#", 6)(s),
      () => tokenRepeatLessThan("$", 2)(s),
      () => tokenRepeatLessThan("*", 2)(s),
      () => tokenRepeatLessThan("+", 3)(s),
      () => tokenRepeatLessThan("`", 3)(s),
      () => tokenSymbol("\n")(s),
      () => tokenSymbol("[")(s),
      () => tokenSymbol("]")(s),
      () => tokenSymbol("(")(s),
      () => tokenSymbol(")")(s),
      () => tokenSymbol(" ")(s),
      () => tokenSymbol(" ")(s),
      () => tokenSymbol("-")(s),
      () => tokenSymbol("!")(s),
      () => tokenText(s)
    );
    acc.push(token);
    s = next;
  }
  return stream(acc);
}

export function tokenRepeatLessThan(symbol, repeat) {
  return stream => {
    let n = repeat;
    let auxStream = stream;
    let textArray = [];
    while (auxStream.peek() === symbol && n >= 0) {
      n--;
      textArray.push(auxStream.peek());
      auxStream = auxStream.next();
    }
    const finalN = repeat - n;
    if (finalN > 0) {
      return pair(
        { type: symbol, repeat: finalN, text: textArray.join("") },
        auxStream
      );
    }
    throw new Error(
      `Error occurred while tokening repeated #${repeat}, with symbol ${symbol} ` +
        auxStream.toString()
    );
  };
}

export function tokenSymbol(symbol) {
  return stream => {
    const sym = [...symbol];
    let s = stream;
    let i = 0;
    while (i < sym.length) {
      if (s.peek() === sym[i]) {
        i++;
        s = s.next();
      } else {
        throw new Error(
          `Error occurred while tokening unique symbol ${symbol} ` +
            auxStream.toString()
        );
      }
    }
    return pair({ type: symbol, repeat: 1, text: symbol }, s);
  };
}

export function tokenText(stream) {
  const keyWords = [..."!`*#$[]()\n "];
  const token = [];
  let s = stream;
  while (s.hasNext() && !keyWords.includes(s.peek())) {
    token.push(s.peek());
    s = s.next();
  }
  return pair({ type: "text", text: token.join("") }, s);
}
