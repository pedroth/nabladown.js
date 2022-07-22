import { or, pair, stream } from "./Utils";
//========================================================================================
/*                                                                                      *
 *                                     LEX ANALYSIS                                     *
 *                                                                                      */
//========================================================================================

const KEYWORDS = [
  "#",
  "-",
  "+",
  "*",
  "_",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "$",
  "!",
  "\n",
  "\t"
].sort();

/**
 * stream<char> => stream<tokens>
 * @param {*} s:Stream<Chars>
 * @returns Stream<Tokens>
 */
export function tokenizer(charStream) {
  const acc = [];
  let s = charStream;
  while (s.hasNext()) {
    const char = s.peek();

    const { left: token, right: next } = or(
      () => tokenSymbol("#")(s),
      () => tokenSymbol("$")(s),
      () => tokenSymbol("*")(s),
      () => tokenSymbol("+")(s),
      () => tokenSymbol("-")(s),
      () => tokenSymbol("_")(s),
      () => tokenSymbol("`")(s),
      () => tokenSymbol(":")(s),
      () => tokenSymbol("\n")(s),
      () => tokenSymbol("\t")(s),
      () => tokenSymbol("[")(s),
      () => tokenSymbol("]")(s),
      () => tokenSymbol("(")(s),
      () => tokenSymbol(")")(s),
      () => tokenSymbol("{")(s),
      () => tokenSymbol("}")(s),
      () => tokenSymbol(" ")(s),
      () => tokenSymbol("!")(s),
      () => tokenText(s)
    );
    acc.push(token);
    s = next;
  }
  return stream(acc);
}

export function tokenText(stream) {
  const keyWords = [...KEYWORDS];
  const token = [];
  let s = stream;
  while (s.hasNext() && !keyWords.includes(s.peek())) {
    token.push(s.peek());
    s = s.next();
  }
  return pair({ type: "text", text: token.join("") }, s);
}
