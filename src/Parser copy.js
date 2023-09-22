//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

import { tokenizer } from "./Lexer";
import { or, pair, stream, eatNSymbol } from "./Utils";

/**
 * Grammar
 *
 * Document ->  Paragraph Document / epsilon
 * Paragraph -> Statement'\n'
 * Statement -> Title / List / Expression / Break
 * Title -> '# 'Expression
 * List(n) -> UList(n) / OList(n)
 * UList(n) -> Spaces(n) UListItem(n) UList(n+1) / epsilion
 * UListItem(n) -> '- ' Expression'\n' UList(n+1) / '- ' Expresion '\n'
 * OList(n) -> Spaces(n) OListItem(n) OList(n+1) / epsilion
 * OListItem(n) -> '- ' Expression'\n' OList(n+1) / '- ' Expresion '\n'    
 * Expression -> ExpressionTypes Expression / epsilon
 * ExpressionTypes -> Formula / Code / Link / Footnote / Media / Italic / Bold / Exec / CustomBlock / Text
 * Footnote -> [^AnyBut("]", "\n")]
 * FootnoteDef -> [^AnyBut("]", "\n")]: Paragraph
 * Formula -> '$' AnyBut('$') '$'
 * Exec -> LineExec / BlockExec
 * LineExec -> '>>>' AnyBut('>>>') '>>>'
 * BlockExec -> '>>>'AnyBut('\n')'\n' AnyBut('>>>') '>>>'
 * Code -> LineCode / BlockCode
 * LineCode -> `AnyBut('\n', '`')`
 * BlockCode-> ```AnyBut('\n')'\n' AnyBut('`')```
 * Link -> [LinkExpression](AnyBut('\n', ')')) / LinkRef
 * LinkExpression -> LinkTypes LinkExpression / epsilon
 * LinkRef -> [LinkExpression][AnyBut('\n', ')')]
 * LinkRefDef -> [LinkExpression]: AnyBut('\n)
 * LinkTypes -> Formula / Exec / Code / Italic / Bold / Skip('\n', ']')
 * Media -> ![MediaExpression](AnyBut('\n', ')'))
 * MediaExpression -> MediaTypes MediaExpression / epsilon
 * MediaTypes -> Formula / Exec / Code / Italic / Bold / Link /Skip('\n', ']')
 * Italic -> *ItalicType*
 * ItalicType -> Text / Bold / Link
 * Bold -> **BoldType**
 * BoldType -> Text / Italic / Link
 * Text -> AnyBut('\n+$*[`') / Skip('\n')
 * AnyBut(s) -> ¬s AnyBut(s) / epsilon
 * Skip(s) -> ¬s
 * Break -> '---'
 * CustomBlock -> ':::'AnyBut(\n)'\n' AnyBut(":::") :::
 */

/**
 * parse: String => Abstract syntactic tree
 * @param {*} string
 * @returns Parsing Tree
 */
export function parse(string) {
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const program = parseDocument(tokenStream);
  return program.left;
}

/**
 * stream => pair(Document, stream)
 *
 * @param {*} stream
 */
function parseDocument(stream) {
  return or(
    () => {
      const { left: paragraph, right: nextStream1 } = parseParagraph(stream);
      const { left: document, right: nextStream2 } = parseDocument(nextStream1);
      return pair(
        {
          type: "document",
          paragraph,
          document
        },
        nextStream2
      );
    },
    () => pair(
      {
        type: "document",
        paragraph: null,
        document: null
      },
      stream
    )
  );
}

/**
 * stream => pair(Expression, stream)
 *
 * @param {*} stream
 */
function parseParagraph(stream) {
  const { left: Statement, right: nextStream } = parseStatement(stream);
  if (nextStream.head().type === "\n") {
    return pair(
      {
        type: "expression",
        Statement
      },
      nextStream.tail()
    );
  }
  throw new Error(
    "Error occurred while parsing expression," + nextStream.toString()
  );
}

/**
 * stream => pair(Statement, stream)
 * @param {*} stream
 */
function parseStatement(stream) {
  return or(
    () => {
      const { left: Title, right: nextStream } = parseTitle(stream);
      return pair({ type: "statement", Title }, nextStream);
    },
    () => {
      const { left: List, right: nextStream } = parseList(0)(stream);
      if (List.list.length > 0) {
        return pair({ type: "statement", List }, nextStream);
      }
      throw new Error("Empty list error while parsing statement");
    },
    () => {
      const { left: Seq, right: nextStream } = parseSeq(stream);
      return pair({ type: "statement", Seq }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(Title, stream)
 * @param {*} stream
 */
function parseTitle(stream) {
  if (stream.head().type === "#") {
    const level = stream.head().repeat;
    // shortcut in parsing this rule
    const filterNextSpace =
      stream.tail().head().type === " " ? stream.tail().tail() : stream.tail();
    const { left: Seq, right: nextStream } = parseSeq(filterNextSpace);
    return pair({ type: "title", Seq, level }, nextStream);
  }
  throw new Error(
    "Error occurred while parsing Title," + nextStream.toString()
  );
}

/**
 *
 * n => stream => pair(List, stream)
 * @param {*} stream
 */
function parseList(n) {
  return function (stream) {
    return or(
      () => {
        // order matters
        const stream1 = or(
          () => eatNSymbol(2 * n, s => s.head().text === " ")(stream),
          () => eatNSymbol(n, s => s.head().text === " ")(stream)
        );
        const { left: ListItem, right: stream2 } = parseListItem(n)(stream1);
        const { left: List, right: stream3 } = parseList(n)(stream2);
        return pair(
          {
            type: "list",
            list: [ListItem, ...List.list]
          },
          stream3
        );
      },
      () => {
        return pair({ type: "list", list: [] }, stream);
      }
    );
  };
}

/**
 * n => stream => pair(ListItem, stream)
 * @param {*} stream
 */
function parseListItem(n) {
  return function (stream) {
    const token = stream.head().text;
    if (token === "-" || token === "*") {
      const { left: Seq, right: stream1 } = parseSeq(stream.tail());
      const token1 = stream1.head().text;
      if (token1 === "\n") {
        const { left: List, right: stream2 } = parseList(n + 1)(stream1.tail());
        return pair(
          { type: "listItem", Seq, children: [...List.list] },
          stream2
        );
      }
    }
    throw new Error("Error occurred while parsing ListItem", stream.toString());
  };
}

/**
 *
 * stream => pair(Seq, stream)
 * @param {*} stream
 */
function parseSeq(stream) {
  return or(
    () => {
      const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream);
      const { left: Seq, right: nextNextStream } = parseSeq(nextStream);
      return pair({ type: "seq", SeqTypes, Seq }, nextNextStream);
    },
    () => pair({ type: "seq", isEmpty: true }, stream)
  );
}

/**
 *
 * stream => pair(SeqTypes, stream)
 * @param {*} stream
 */
function parseSeqTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: "seqTypes", Formula }, nextStream);
    },
    () => {
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: "seqTypes", Html }, nextStream);
    },
    () => {
      const { left: Code, right: nextStream } = parseCode(stream);
      return pair({ type: "seqTypes", Code }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: "seqTypes", Link }, nextStream);
    },
    () => {
      const { left: Media, right: nextStream } = parseMedia(stream);
      return pair({ type: "seqTypes", Media }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: "seqTypes", Italic }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: "seqTypes", Bold }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: "seqTypes", Text }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(Text, stream)
 * @param {*} stream
 */
function parseText(stream) {
  return or(
    () => {
      const { left: AnyBut, right: nextStream } = parseAnyBut(t =>
        ["$", "+", "`", "[", "*", "\n"].includes(t.type)
      )(stream);
      if (AnyBut.textArray.length > 0) {
        return pair(
          { type: "text", text: AnyBut.textArray.join("") },
          nextStream
        );
      }
      throw new Error("Error occurred while parsing Text," + stream.toString());
    },
    () => {
      const { left: Single, right: nextStream } = parseSingle(
        t => t.type === "\n"
      )(stream);
      return pair({ type: "text", text: Single.text }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(Italic, stream)
 * @param {*} stream
 */
function parseItalic(stream) {
  const token = stream.head();
  if (token.type === "*" && token.repeat === 1) {
    const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "*" && nextToken.repeat === 1) {
      return pair({ type: "italic", SeqTypes }, nextStream.tail());
    }
  }
  throw new Error(
    "Error occurred while parsing Italic," + nextStream.toString()
  );
}

/**
 *
 * stream => pair(Bold, stream)
 * @param {*} stream
 */
function parseBold(stream) {
  const token = stream.head();
  if (token.type === "*" && token.repeat === 2) {
    const { left: SeqTypes, right: nextStream } = parseSeqTypes(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "*" && nextToken.repeat === 2) {
      return pair({ type: "bold", SeqTypes }, nextStream.tail());
    }
  }
  throw new Error(
    "Error occurred while parsing Italic," + nextStream.toString()
  );
}

/**
 *
 * stream => pair(Formula, stream)
 * @param {*} stream
 */
function parseFormula(stream) {
  const token = stream.head();
  const repeat = token.repeat;
  const error = new Error(
    "Error occurred while parsing Formula," + stream.toString()
  );
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token =>
      ["$"].includes(token.type)
    )(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: "formula",
          equation: AnyBut.textArray.join(""),
          isInline: nextToken?.repeat === 1
        },
        nextStream.tail()
      );
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
  const token = stream.head();
  const repeat = token.repeat;
  const error = new Error(
    "Error occurred while parsing Html," + stream.toString()
  );
  if (token.type === "+" && repeat === 3) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(
      token => ["+"].includes(token.type) && 3 === token?.repeat
    )(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "+" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: "html",
          html: AnyBut.textArray.join("")
        },
        nextStream.tail()
      );
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
  return or(
    () => {
      const { left: LineCode, right: nextStream } = parseLineCode(stream);
      return pair({ type: "code", LineCode }, nextStream);
    },
    () => {
      const { left: BlockCode, right: nextStream } = parseBlockCode(stream);
      return pair({ type: "code", BlockCode }, nextStream);
    }
  );
}

/**
 *
 * stream => pair(LineCode, stream)
 * @param {*} stream
 */
function parseLineCode(stream) {
  const lineCodeTokenPredicate = t => t.type === "`" && t.repeat === 1;
  const token = stream.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(
      t => lineCodeTokenPredicate(t) || t.type === "\n"
    )(stream.tail());
    if (lineCodeTokenPredicate(nextStream.head())) {
      return pair(
        { type: "lineCode", code: AnyBut.textArray.join("") },
        nextStream.tail()
      );
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
  const lineCodeTokenPredicate = t => t.type === "`" && t.repeat === 3;
  const token = stream.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream } = parseAnyBut(
      t => t.type === "\n"
    )(stream.tail());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(
      lineCodeTokenPredicate
    )(nextStream.tail());
    if (lineCodeTokenPredicate(nextNextStream.head())) {
      return pair(
        {
          type: "blockCode",
          code: AnyBut.textArray.join(""),
          language: languageAnyBut.textArray.join("")
        },
        nextNextStream.tail()
      );
    }
  }
  throw new Error(
    "Error occurred while parsing BlockCode," + stream.toString()
  );
}

/**
 *
 * (token => boolean) => stream => pair(AnyBut, stream)
 * @param {*} tokenPredicate: token => boolean
 */
function parseAnyBut(tokenPredicate) {
  return stream => {
    return or(
      () => {
        const peek = stream.head();
        if (!tokenPredicate(peek)) {
          const { left: AnyBut, right: nextStream } = parseAnyBut(
            tokenPredicate
          )(stream.tail());
          return pair(
            { type: "anyBut", textArray: [peek.text, ...AnyBut.textArray] },
            nextStream
          );
        }
        throw new Error(
          "Error occurred while parsing AnyBut," + stream.toString()
        );
      },
      () => pair({ type: "anyBut", textArray: [] }, stream)
    );
  };
}

/**
 *
 * stream => pair(Link, stream)
 * @param {*} stream
 */
function parseLink(stream) {
  // ugly
  if (stream.head().type === "[") {
    const nextStream = stream.tail();
    const { left: LinkStat, right: nextNextStream } = parseLinkStat(nextStream);
    if (nextNextStream.head().type === "]") {
      const next3Stream = nextNextStream.tail();
      if (next3Stream.head().type === "(") {
        const { left: AnyBut, right: next4Stream } = parseAnyBut(token =>
          ["\n", ")"].includes(token.type)
        )(next3Stream.tail());
        if (next4Stream.head().type === ")") {
          return pair(
            { type: "link", LinkStat, link: AnyBut.textArray.join("") },
            next4Stream.tail()
          );
        }
      }
    }
  }
  throw new Error("Error occurred while parsing Link," + stream.toString());
}

/**
 *
 * stream => pair(Media, stream)
 * @param {*} stream
 */
function parseMedia(stream) {
  // ugly
  if (stream.head().type === "!") {
    const nextStream = stream.tail();
    if (nextStream.head().type === "[") {
      const { left: LinkStat, right: nextNextStream } = parseLinkStat(
        nextStream.tail()
      );
      if (nextNextStream.head().type === "]") {
        const next3Stream = nextNextStream.tail();
        if (next3Stream.head().type === "(") {
          const { left: AnyBut, right: next4Stream } = parseAnyBut(token =>
            ["\n", ")"].includes(token.type)
          )(next3Stream.tail());
          if (next4Stream.head().type === ")") {
            return pair(
              { type: "media", LinkStat, link: AnyBut.textArray.join("") },
              next4Stream.tail()
            );
          }
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
  return or(
    () => {
      const { left: LinkType, right: nextStream } = parseLinkType(stream);
      const { left: LinkStat, right: nextNextStream } = parseLinkStat(
        nextStream
      );
      return pair({ type: "linkStat", LinkType, LinkStat }, nextNextStream);
    },
    () => pair({ type: "linkStat", isEmpty: true }, stream)
  );
}

/**
 * stream => pair(LinkType, stream)
 * @param {*} stream
 */
function parseLinkType(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: "linkType", Formula }, nextStream);
    },
    () => {
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: "linkType", Html }, nextStream);
    },
    () => {
      const { left: Code, right: nextStream } = parseCode(stream);
      return pair({ type: "linkType", Code }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: "linkType", Italic }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: "linkType", Bold }, nextStream);
    },
    () => {
      const { left: Single, right: nextStream } = parseSingle(token =>
        ["\n", "]"].includes(token.type)
      )(stream);
      return pair({ type: "linkType", Single }, nextStream);
    }
  );
}

/**
 *
 * (token => boolean) => stream => pair(Single, stream)
 * @param {*} tokenPredicate: token => boolean
 */
function parseSingle(tokenPredicate) {
  return stream => {
    const token = stream.head();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: "single", text: text }, stream.tail());
    }
    throw new Error("Error occurred while parsing Single," + stream.toString());
  };
}
