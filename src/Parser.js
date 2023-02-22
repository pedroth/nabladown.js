//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

import { EXEC_SYMBOL, tokenizer } from "./Lexer";
import { or, pair, stream, eatSymbol } from "./Utils";

/**
 * Grammar
 *
 * Document ->  Paragraph Document / epsilon
 * Paragraph -> Statement'\n'
 * Statement -> Title / List / Expression / LinkRefDef / FootNoteDef / MediaRefDef / Break
 * Title -> '# 'Expression
 * Expression -> ExpressionTypes Expression / epsilon
 * ExpressionTypes -> Formula / Code / Link / Footnote / Media / Italic / Bold / Exec / Custom / Text
 * Formula -> '$' AnyBut('$') '$'
 * AnyBut(s) -> ¬s AnyBut(s) / epsilon
 * Code -> LineCode / BlockCode
 * LineCode -> `AnyBut('`')`
 * BlockCode-> ```AnyBut('\n')'\n'AnyBut('```')```
 * Link -> [LinkExpression](AnyBut(')')) / LinkRef
 * LinkExpression -> LinkTypes LinkExpression / epsilon
 * LinkTypes -> Formula / Exec / Code / Italic / Bold / Custom / Text
 * LinkRef -> [LinkExpression][AnyBut(']')]
 * LinkRefDef -> [AnyBut(']')]: AnyBut('\n')
 * Footnote -> [^AnyBut("]")]
 * FootnoteDef -> [^AnyBut("]")]: Expression
 * Exec -> >>>AnyBut(">>>")>>> / [AnyBut("]")]>>>AnyBut(">>>")>>>
 * Italic -> *ItalicType*
 * ItalicType -> Text / Bold / Link
 * Bold -> **BoldType**
 * BoldType -> Text / Italic / Link
 * Media -> ![MediaExpression](AnyBut(')')) / MediaRef
 * MediaExpression -> MediaTypes MediaExpression / epsilon
 * MediaTypes -> Formula / Exec / Code / Italic / Bold / Link / Custom / Text
 * MediaRef -> ![MediaExpression][AnyBut(']')]
 * MediaRefDef ->![AnyBut(']')]: AnyBut('\n')
 * Custom -> [AnyBut("]")]:::AnyBut(":::"):::
 * Text -> TextToken
 * List(n) -> UList(n) / OList(n)
 * UList(n) -> Spaces(n) UListItem(n) UList(n+1) / epsilion
 * UListItem(n) -> '- ' Expression'\n' UList(n+1) / '- ' Expresion '\n'
 * OList(n) -> Spaces(n) OListItem(n) OList(n+1) / epsilion
 * OListItem(n) -> '- ' Expression'\n' OList(n+1) / '- ' Expresion '\n'    
 * Spaces(n) -> " " Spaces(n-1) {n > 0} / epsilion {otherwise}
 * Break -> '---'
 */

const TYPES = {
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
  linkExpression: "linkExpression",
  linkTypes: "linkTypes",
  linkRef: "linkRef",
  linkRefDef: "linkRefDef",
  footnote: "footnote",
  footnoteDef: "footnoteDef",
  exec: "exec",
  italic: "italic",
  italicType: "italicType",
  bold: "bold",
  boldType: "boldType",
  media: "media",
  mediaExpression: "mediaExpression",
  mediaTypes: "mediaTypes",
  custom: "custom",
  text: "text",
  list: "list",
  ulist: "ulist",
  ulistItem: "ulistItem",
  olist: "olist",
  olistItem: "olistItem",
  spaces: "spaces",
  break: "break"
}

/**
 * parse: String => Abstract syntactic tree
 */
export function parse(string) {
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const program = parseDocument(tokenStream);
  return program.left;
}

/**
 * stream => pair(Document, stream)
 */
function parseDocument(stream) {
  return or(
    () => {
      const { left: paragraph, right: nextStream1 } = parseParagraph(stream);
      const { left: document, right: nextStream2 } = parseDocument(nextStream1);
      return pair(
        {
          type: TYPES.document,
          paragraph,
          document
        },
        nextStream2
      );
    },
    () => pair(
      {
        type: TYPES.document,
        paragraph: null,
        document: null
      },
      stream
    )
  );
}

/**
 * stream => pair(Paragraph, stream)
 */
function parseParagraph(stream) {
  const { left: Statement, right: nextStream } = parseStatement(stream);
  if (nextStream.peek().type === "\n") {
    return pair(
      {
        type: TYPES.paragraph,
        Statement
      },
      nextStream.next()
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
      return pair({ type: TYPES.statement, Title }, nextStream);
    },
    () => {
      const { left: List, right: nextStream } = parseList(0)(stream);
      if (List.list.length > 0) {
        return pair({ type: TYPES.statement, List }, nextStream);
      }
      throw new Error("Empty list error while parsing statement");
    },
    () => {
      const { left: Expression, right: nextStream } = parseExpression(stream);
      return pair({ type: TYPES.statement, Expression }, nextStream);
    },
    () => {
      const { left: LinkRefDef, right: nextStream } = parseLinkRefDef(stream);
      return pair({ type: TYPES.statement, LinkRefDef }, nextStream);
    },
    () => {
      const { left: FootNoteDef, right: nextStream } = parseFootnoteDef(stream);
      return pair({ type: TYPES.statement, FootNoteDef }, nextStream);
    },
    () => {
      const { left: Break, right: nextStream } = parseBreak(stream);
      return pair({ type: TYPES.statement, Break }, nextStream);
    }
  );
}

/**
 * stream => pair(Title, stream)
 */
function parseTitle(stream) {
  if (stream.peek().type === "#") {
    const level = stream.peek().repeat;
    // shortcut in parsing this rule
    const filterNextSpace =
      stream.next().peek().type === " " ? stream.next().next() : stream.next();
    const { left: Expression, right: nextStream } = parseExpression(filterNextSpace);
    return pair({ type: TYPES.title, Expression, level }, nextStream);
  }
  throw new Error(
    "Error occurred while parsing Title," + nextStream.toString()
  );
}

/**
 * stream => pair(Expression, stream)
 */
function parseExpression(stream) {
  return or(
    () => {
      const { left: ExpressionTypes, right: nextStream } = parseExpressionTypes(stream);
      const { left: Expression, right: nextNextStream } = parseExpression(nextStream);
      return pair({ type: TYPES.expression, ExpressionTypes, Expression }, nextNextStream);
    },
    () => pair({ type: TYPES.expression, isEmpty: true }, stream)
  );
}

/**
 * stream => pair(SeqTypes, stream)
 */
function parseExpressionTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: TYPES.expressionTypes, Formula }, nextStream);
    },
    () => {
      const { left: Code, right: nextStream } = parseCode(stream);
      return pair({ type: TYPES.expressionTypes, Code }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: TYPES.expressionTypes, Link }, nextStream);
    },
    () => {
      const { left: Footnote, right: nextStream } = parseFootnote(stream);
      return pair({ type: TYPES.expressionTypes, Footnote }, nextStream);
    },
    () => {
      const { left: Media, right: nextStream } = parseMedia(stream);
      return pair({ type: TYPES.expressionTypes, Media }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: TYPES.expressionTypes, Italic }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: TYPES.expressionTypes, Bold }, nextStream);
    },
    () => {
      const { left: Exec, right: nextStream } = parseExec(stream);
      return pair({ type: TYPES.expressionTypes, Exec }, nextStream);
    },
    () => {
      const { left: Custom, right: nextStream } = parseCustom(stream);
      return pair({ type: TYPES.expressionTypes, Custom }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.expressionTypes, Text }, nextStream);
    }
  );
}

/**
 * stream => pair(Formula, stream)
 */
function parseFormula(stream) {
  const token = stream.peek();
  const repeat = token.repeat;
  const error = new Error(
    "Error occurred while parsing Formula," + stream.toString()
  );
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => token.type === "$")(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: TYPES.formula,
          equation: AnyBut.textArray.join(""),
          isInline: nextToken?.repeat === 1
        },
        nextStream.next()
      );
    }
  }
  throw error;
}

/**
 * (token => boolean) => stream => pair(AnyBut, stream)
 */
function parseAnyBut(tokenPredicate) {
  return stream => {
    return or(
      () => {
        const peek = stream.peek();
        if (!tokenPredicate(peek)) {
          const { left: AnyBut, right: nextStream } = parseAnyBut(tokenPredicate)(stream.next());
          return pair(
            { type: TYPES.anyBut, textArray: [peek.text, ...AnyBut.textArray] },
            nextStream
          );
        }
        throw new Error(
          "Error occurred while parsing AnyBut," + stream.toString()
        );
      },
      () => pair({ type: TYPES.anyBut, textArray: [] }, stream)
    );
  };
}

/**
 * stream => pair(Code, stream)
 */
function parseCode(stream) {
  return or(
    () => {
      const { left: LineCode, right: nextStream } = parseLineCode(stream);
      return pair({ type: TYPES.code, LineCode }, nextStream);
    },
    () => {
      const { left: BlockCode, right: nextStream } = parseBlockCode(stream);
      return pair({ type: TYPES.code, BlockCode }, nextStream);
    }
  );
}

/**
 * stream => pair(LineCode, stream)
 */
function parseLineCode(stream) {
  const lineCodeTokenPredicate = t => t.type === "`" && t.repeat === 1;
  const token = stream.peek();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(t => lineCodeTokenPredicate(t))(stream.next());
    if (lineCodeTokenPredicate(nextStream.peek())) {
      return pair(
        { type: TYPES.lineCode, code: AnyBut.textArray.join("") },
        nextStream.next()
      );
    }
  }
  throw new Error("Error occurred while parsing LineCode," + stream.toString());
}

/**
 * stream => pair(BlockCode, stream)
 */
function parseBlockCode(stream) {
  const blockCodeTokenPredicate = t => t.type === "`" && t.repeat === 3;
  const token = stream.peek();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream } = parseAnyBut(t => t.type === "\n")(stream.next());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream.next());
    if (blockCodeTokenPredicate(nextNextStream.peek())) {
      return pair(
        {
          type: TYPES.blockCode,
          code: AnyBut.textArray.join(""),
          language: languageAnyBut.textArray.join("")
        },
        nextNextStream.next()
      );
    }
  }
  throw new Error(
    "Error occurred while parsing BlockCode," + stream.toString()
  );
}

/**
 * stream => pair(Link, stream)
 */
function parseLink(stream) {
  return or(
    () => {
      // ugly
      if (stream.peek().type === "[") {
        const nextStream = stream.next();
        const { left: LinkExpression, right: nextStream1 } = parseLinkExpression(nextStream);
        if (nextStream1.peek().type === "]") {
          const nextStream2 = nextStream1.next();
          if (nextStream2.peek().type === "(") {
            const { left: AnyBut, right: nextStream3 } = parseAnyBut(token => token.type === ")")(nextStream2.next());
            if (nextStream3.peek().type === ")") {
              return pair(
                { type: TYPES.link, LinkExpression, link: AnyBut.textArray.join("") },
                nextStream3.next()
              );
            }
          }
        }
      }
      throw new Error("Error occurred while parsing Link," + stream.toString());
    },
    () => {
      const { left: LinkRef, right: nextStream } = parseLinkRef(stream);
      return pair({ type: TYPES.linkRef, LinkRef }, nextStream);
    }
  )
}

/**
 * stream => pair(LinkStat, stream)
 */
function parseLinkExpression(stream) {
  return or(
    () => {
      const { left: LinkTypes, right: nextStream } = parseLinkTypes(stream);
      const { left: LinkExpression, right: nextNextStream } = parseLinkExpression(nextStream);
      return pair({ type: TYPES.linkExpression, LinkTypes, LinkExpression }, nextNextStream);
    },
    () => pair({ type: TYPES.linkExpression, isEmpty: true }, stream)
  );
}

/**
 * stream => pair(LinkType, stream)
 */
function parseLinkTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: TYPES.linkTypes, Formula }, nextStream);
    },
    () => {
      const { left: Exec, right: nextStream } = parseExec(stream);
      return pair({ type: TYPES.linkTypes, Exec }, nextStream);
    },
    () => {
      const { left: Code, right: nextStream } = parseCode(stream);
      return pair({ type: TYPES.linkTypes, Code }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: TYPES.linkTypes, Italic }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: TYPES.linkTypes, Bold }, nextStream);
    },
    () => {
      const { left: Custom, right: nextStream } = parseCustom(stream);
      return pair({ type: TYPES.linkTypes, Custom }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.linkTypes, Text }, nextStream);
    }
  );
}

/*
* stream => pair(LinkRef, stream)
*/
function parseLinkRef(stream) {
  // ugly pls review
  if (stream.peek().type === "[") {
    const nextStream = stream.next();
    const { left: LinkExpression, right: nextStream1 } = parseLinkExpression(nextStream)
    if (nextStream1.peek().type === "]") {
      const nextStream2 = nextStream1.next();
      if (nextStream2.peek().type === "[") {
        const { left: AnyBut, right: nextStream3 } = parseAnyBut(token => token.type === "]")(nextStream2.next());
        if (nextStream3.peek().type === "]") {
          return pair(
            { type: TYPES.linkRef, LinkExpression, linkRef: AnyBut.textArray.join("") },
            nextStream3.next()
          );
        }
      }
    }
  }
  throw new Error("Error occurred while parsing LinkRef," + stream.toString());
}

/*
* stream => pair(LinkRefDef, stream)
*/
function parseLinkRefDef(stream) {
  // ugly pls review
  if (stream.peek().type === "[") {
    const nextStream = stream.next();
    const { left: AnyButRef, right: nextStream1 } = parseAnyBut(token => token.type === "]")(nextStream)
    if (nextStream1.peek().type === "]") {
      const nextStream2 = nextStream1.next();
      if (nextStream2.peek().type === ":") {
        const nextStream3 = nextStream2.next().peek().type === " " ? nextStream2.next().next() : nextStream2.next();;
        const { left: AnyButDef, right: nextStream4 } = parseAnyBut(token => token.type === "\n")(nextStream3);
        return pair(
          { type: TYPES.linkRefDef, LinkRef: AnyButRef.textArray.join(""), linkRefDef: AnyButDef.textArray.join("") },
          nextStream4.next()
        );
      }
    }
  }
  throw new Error("Error occurred while parsing LinkRefDef," + stream.toString());
}

/**
 * stream => pair(Footnote, stream)
 */
function parseFootnote(stream) {
  if (stream.peek().type === "[") {
    const nextStream = stream.next();
    if (nextStream.peek().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut(token => token.type === "]")(nextStream.next());
      return pair(
        { type: TYPES.footnote, footnote: AnyBut.textArray.join("") },
        nextStream1.next().next() // remove "]" token
      );
    }
  }
  throw new Error("Error occurred while parsing Footnote," + stream.toString());
}

/**
 * stream => pair(FootnoteRef, stream)
 */
function parseFootnoteDef(stream) {
  // ugly pls review
  if (stream.peek().type === "[") {
    const nextStream = stream.next();
    const { left: AnyBut, right: nextStream1 } = parseAnyBut(token => token.type === "]")(nextStream)
    if (nextStream1.peek().type === "]") {
      const nextStream2 = nextStream1.next();
      if (nextStream2.peek().type === ":") {
        const nextStream3 = nextStream2.next().peek().type === " " ? nextStream2.next().next() : nextStream2.next();
        const { left: Expression, right: nextStream4 } = parseExpression(nextStream3);
        return pair(
          { type: TYPES.footnoteDef, footnote: AnyBut.textArray.join(""), Expression },
          nextStream4.next()
        );
      }
    }
  }
  throw new Error("Error occurred while parsing FootnoteDef," + stream.toString());
}

/**
 *
 * stream => pair(Exec, stream)
 */
function parseExec(stream) {
  return or(
    () => {
      if (stream.peek().type === EXEC_SYMBOL) {
        const { left: AnyButExec, right: nextStream } = parseAnyBut(token => EXEC_SYMBOL === token.type)(stream.next());
        const nextStream1 = nextStream.next(); // remove EXEC_SYMBOL
        return pair(
          {
            type: TYPES.exec,
            language: "html",
            code: AnyButExec.textArray.join("")
          },
          nextStream1.next()
        );

      }
    },
    () => {
      if (stream.peek().type === "[") {
        const { left: AnyBut, right: nextStream } = parseAnyBut(token => "]" === token.type)(stream.next());
        const nextStream1 = nextStream.next();
        if (nextStream1.type === EXEC_SYMBOL) {
          const { left: AnyButExec, right: nextStream2 } = parseAnyBut(token => EXEC_SYMBOL === token.type)(nextStream1.next());
          return pair(
            {
              type: TYPES.exec,
              language: AnyBut.textArray.join(""),
              code: AnyButExec.textArray.join("")
            },
            nextStream2.next()
          );
        }
      }
      throw new Error(
        "Error occurred while parsing Exec," + stream.toString()
      );
    }
  )
}

/**
 * stream => pair(Italic, stream)
 */
function parseItalic(stream) {
  const token = stream.peek();
  if (token.type === "*" && token.repeat === 1) {
    const { left: ItalicType, right: nextStream } = parseItalicType(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "*" && nextToken.repeat === 1) {
      return pair({ type: TYPES.italic, ItalicType }, nextStream.next());
    }
  }
  throw new Error(
    "Error occurred while parsing Italic," + nextStream.toString()
  );
}

/**
 * stream => pair(ItalicType, stream)
 */
function parseItalicType(stream) {
  return or(
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.italicType, Text }, nextStream);
    },
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: TYPES.italicType, Bold }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: TYPES.italicType, Link }, nextStream);
    },
    () => {
      throw new Error("Error occurred while parsing ItalicType," + stream.toString());
    }
  );
}

/**
 * stream => pair(Bold, stream)
 */
function parseBold(stream) {
  const token = stream.peek();
  if (token.type === "*" && token.repeat === 2) {
    const { left: BoldType, right: nextStream } = parseBoldType(stream.next());
    const nextToken = nextStream.peek();
    if (nextToken.type === "*" && nextToken.repeat === 2) {
      return pair({ type: TYPES.bold, BoldType }, nextStream.next());
    }
  }
  throw new Error(
    "Error occurred while parsing Bold," + nextStream.toString()
  );
}

/**
 * stream => pair(BoldType, stream)
 */
function parseBoldType(stream) {
  return or(
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.boldType, Text }, nextStream);
    },
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: TYPES.boldType, Italic }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: TYPES.boldType, Link }, nextStream);
    },
    () => {
      throw new Error("Error occurred while parsing BoldType," + stream.toString());
    }
  );
}

/**
 * stream => pair(Media, stream)
 */
function parseMedia(stream) {
  // ugly
  if (stream.peek().type === "!") {
    const nextStream = stream.next();
    if (nextStream.peek().type === "[") {
      const { left: LinkStat, right: nextNextStream } = parseLinkExpression(
        nextStream.next()
      );
      if (nextNextStream.peek().type === "]") {
        const next3Stream = nextNextStream.next();
        if (next3Stream.peek().type === "(") {
          const { left: AnyBut, right: next4Stream } = parseAnyBut(token =>
            ["\n", ")"].includes(token.type)
          )(next3Stream.next());
          if (next4Stream.peek().type === ")") {
            return pair(
              { type: "media", LinkStat, link: AnyBut.textArray.join("") },
              next4Stream.next()
            );
          }
        }
      }
    }
  }
  throw new Error("Error occurred while parsing Link," + stream.toString());
}

/**
 * stream => pair(parseMediaExpression, stream)
 */

/**
 * n => stream => pair(List, stream)
 */
function parseList(n) {
  return function (stream) {
    return or(
      () => {
        // order matters
        const stream1 = or(
          () => eatSymbol(2 * n, s => s.peek().text === " ")(stream),
          () => eatSymbol(n, s => s.peek().text === " ")(stream)
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
    const token = stream.peek().text;
    if (token === "-" || token === "*") {
      const { left: Seq, right: stream1 } = parseSeq(stream.next());
      const token1 = stream1.peek().text;
      if (token1 === "\n") {
        const { left: List, right: stream2 } = parseList(n + 1)(stream1.next());
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
 * (token => boolean) => stream => pair(Single, stream)
 * @param {*} tokenPredicate: token => boolean
 */
function parseSingle(tokenPredicate) {
  return stream => {
    const token = stream.peek();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: "single", text: text }, stream.next());
    }
    throw new Error("Error occurred while parsing Single," + stream.toString());
  };
}
