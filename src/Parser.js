//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

import {
  CODE_SYMBOL,
  CUSTOM_SYMBOL,
  LINE_SEPARATOR_SYMBOL,
  ORDER_LIST_SYMBOL,
  TEXT_SYMBOL,
  tokenizer
} from "./Lexer.js";
import {
  or,
  pair,
  stream,
  eatSymbol,
  success,
  isAlpha,
  isAlphaNumeric,
  eatSpaces
} from "./Utils.js";

/**
 * Grammar
 *
 * Document ->  Paragraph Document / ε
 * 
 * Paragraph -> Statement'\n'
 * 
 * Statement -> Title /
 *              List / 
 *              MediaRefDef / 
 *              FootNoteDef / 
 *              LinkRefDef / 
 *              Break / 
 *              Expression
 * 
 * Title -> '# 'Expression
 * 
 * Expression -> ExpressionTypes Expression / ε
 * 
 * ExpressionTypes -> Formula /
 *                    Code / 
 *                    Link / 
 *                    Footnote /
 *                    Media /
 *                    Italic /
 *                    Bold / 
 *                    Html / 
 *                    Custom /
 *                    Text
 * 
 * Formula -> '$' AnyBut('$') '$'
 * 
 * AnyBut(s) -> ¬s AnyBut(s) / ε
 * 
 * Code -> LineCode / BlockCode
 * 
 * LineCode -> `AnyBut('`')`
 * 
 * BlockCode-> ```AnyBut('\n')'\n'AnyBut('```')```
 * 
 * Link -> AnonLink / LinkRef
 * 
 * AnonLink -> [LinkExpression](AnyBut(')'))
 * 
 * LinkExpression -> LinkTypes LinkExpression / ε
 * 
 * LinkTypes -> Formula /
 *              Html / 
 *              Code / 
 *              Italic / 
 *              Bold / 
 *              Custom / 
 *              Media / 
 *              SingleBut("\n", "]")
 * 
 * LinkRef -> [LinkExpression][AnyBut(']')]
 *
 * LinkRefDef -> [AnyBut(']')]: AnyBut('\n')
 * 
 * Footnote -> [^AnyBut("]")]
 * 
 * FootnoteDef -> [^AnyBut("]")]: Expression
 * 
 * Italic -> _ItalicType_
 * 
 * ItalicType -> Text / Bold / Link
 * 
 * Bold -> **BoldType**
 * 
 * BoldType -> Text / Italic / Link
 * 
 * Media -> !Link
 * 
 * MediaRefDef ->!LinkRefDef
 * 
 * Custom -> [AnyBut("]")]:::AnyBut(":::"):::
 * 
 * Text -> AnyBut(¬TextToken) / SingleBut("\n")
 * 
 * List(n) -> UList(n) / OList(n)
 * 
 * UList(n) -> ListItem(n, '-') UList(n) / ListItem(n, '-')
 * 
 * OList(n) -> ListItem(n, '1.') OList(n) / ListItem(n, '1.')
 * 
 * ListItem(n,λ) -> Spaces(2*n) 'λ ' Expression'\n' List(n+1) / 'λ ' Expresion '\n'
 * 
 * Spaces(n) -> " " Spaces(n-1) {n > 0} / epsilion {otherwise}
 * 
 * Break -> '---'
 * 
 * SingleBut(s) -> ¬s
 * 
 * Html -> StartTag InnerHtml EndTag 
 * 
 * InnerHtml -> Html / AnyBut("<")
 * 
 * StartTag -> < (" ")* AlphaNumName (" ")* Attrs (" ")*>  
 * 
 * Attrs -> Attr Attrs / ε
 * 
 * Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 * 
 * EndTag -> </(" ")*AlphaNumName(" ")*>
 * 
 * AlphaNumName -> [a-zA-z][a-zA-Z0-9]*
 * 
*/

export const TYPES = {
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
  anonlink: "anonlink",
  linkExpression: "linkExpression",
  linkTypes: "linkTypes",
  linkRef: "linkRef",
  linkRefDef: "linkRefDef",
  footnote: "footnote",
  footnoteDef: "footnoteDef",
  italic: "italic",
  italicType: "italicType",
  bold: "bold",
  boldType: "boldType",
  media: "media",
  mediaRefDef: "mediaRefDef",
  custom: "custom",
  text: "text",
  list: "list",
  ulist: "ulist",
  olist: "olist",
  listItem: "listItem",
  break: "break",
  singleBut: "singleBut",
  html: "html",
  startTag: "startTag",
  innerHtml: "innerHtml",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs",
}

/**
 * parse: String => Abstract syntactic tree
 */
export function parse(string) {
  const memory = {}
  const charStream = stream(string);
  const tokenStream = tokenizer(charStream);
  const document = parseDocument(tokenStream,);
  return document.left;
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
          paragraphs: [paragraph, ...document.paragraphs]
        },
        nextStream2
      );
    },
    () => pair(
      {
        type: TYPES.document,
        paragraphs: [],
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
 */
function parseStatement(stream) {
  return or(
    () => {
      const { left: Title, right: nextStream } = parseTitle(stream);
      return pair({ type: TYPES.statement, Title }, nextStream);
    },
    () => {
      const { left: List, right: nextStream } = parseList(0)(stream);
      return pair({ type: TYPES.statement, List }, nextStream);
    },
    () => {
      const { left: MediaRefDef, right: nextStream } = parseMediaRefDef(stream);
      return pair({ type: TYPES.statement, MediaRefDef }, nextStream);
    },
    () => {
      const { left: FootnoteDef, right: nextStream } = parseFootnoteDef(stream);
      return pair({ type: TYPES.statement, FootnoteDef }, nextStream);
    },
    () => {
      const { left: LinkRefDef, right: nextStream } = parseLinkRefDef(stream);
      return pair({ type: TYPES.statement, LinkRefDef }, nextStream);
    },
    () => {
      const { left: Break, right: nextStream } = parseBreak(stream);
      return pair({ type: TYPES.statement, Break }, nextStream);
    },
    () => {
      const { left: Expression, right: nextStream } = parseExpression(stream);
      return pair({ type: TYPES.statement, Expression }, nextStream);
    },
  );
}

/**
 * stream => pair(Title, stream)
 */
function parseTitle(stream) {
  if (stream.peek().type === "#") {
    const level = stream.peek().repeat;
    // shortcut in parsing this rule
    const filterNextSpace = filterSpace(stream);
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
      return pair(
        {
          type: TYPES.expression,
          expressions: [ExpressionTypes, ...Expression.expressions],
        },
        nextNextStream
      );
    },
    () => pair(
      {
        type: TYPES.expression,
        expressions: []
      },
      stream
    )
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
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: TYPES.expressionTypes, Html }, nextStream);
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
  throw new Error(
    "Error occurred while parsing Formula," + stream.toString()
  );
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
  const lineCodeTokenPredicate = t => t.type === "`";
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
  const blockCodeTokenPredicate = t => t.type === CODE_SYMBOL;
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
      const { left: AnonLink, right: nextStream } = parseAnonLink(stream);
      return pair({ type: TYPES.link, AnonLink }, nextStream);
    },
    () => {
      const { left: LinkRef, right: nextStream } = parseLinkRef(stream);
      return pair({ type: TYPES.link, LinkRef }, nextStream);
    }
  )
}

/**
 * stream => pair(AnonLink, stream)
 */
function parseAnonLink(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "[" === token.type;
    }).map(nextStream => {
      return parseLinkExpression(nextStream.next());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.peek();
      return "]" === token.type;
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.next().peek();
      return "(" === token.type;
    }).map(({ left: LinkExpression, right: nextStream }) => {
      const { left: AnyBut, right: nextStream2 } = parseAnyBut(token => token.type === ")")(
        nextStream
          .next() // take ]
          .next() // take (
      );
      return { LinkExpression, AnyBut, nextStream: nextStream2 }
    }).filter(({ nextStream }) => {
      const token = nextStream.peek();
      return ")" === token.type;
    }).map(({ LinkExpression, AnyBut, nextStream }) => {
      return pair(
        {
          type: TYPES.anonlink,
          LinkExpression,
          link: AnyBut.textArray.join("")
        },
        nextStream.next()
      );
    })
    .actual(() => {
      throw new Error(
        "Error occurred while parsing AnonLink," + nextStream.toString()
      );
    })
}

/**
 * stream => pair(LinkExpression, stream)
 */
function parseLinkExpression(stream) {
  return or(
    () => {
      const { left: LinkTypes, right: nextStream } = parseLinkTypes(stream);
      const { left: LinkExpression, right: nextNextStream } = parseLinkExpression(nextStream);
      return pair({
        type: TYPES.linkExpression,
        expressions: [LinkTypes, ...LinkExpression.expressions]
      },
        nextNextStream
      );
    },
    () => pair({ type: TYPES.linkExpression, expressions: [] }, stream)
  );
}

/**
 * stream => pair(LinkTypes, stream)
 */
function parseLinkTypes(stream) {
  return or(
    () => {
      const { left: Formula, right: nextStream } = parseFormula(stream);
      return pair({ type: TYPES.linkTypes, Formula }, nextStream);
    },
    () => {
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: TYPES.linkTypes, Html }, nextStream);
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
      const { left: Media, right: nextStream } = parseMedia(stream);
      return pair({ type: TYPES.linkTypes, Media }, nextStream);
    },
    () => {
      const { left: SingleBut, right: nextStream } = parseSingleBut(token =>
        ["\n", "]"].includes(token.type))(stream);
      return pair({ type: TYPES.linkTypes, SingleBut }, nextStream);
    },
  );
}

/*
* stream => pair(LinkRef, stream)
*/
function parseLinkRef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "[" === token.type;
    }).map(nextStream => {
      return parseLinkExpression(nextStream.next());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.peek();
      return "]" === token.type;
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.next().peek();
      return "[" === token.type;
    }).map(({ left: LinkExpression, right: nextStream }) => {
      const { left: AnyBut, right: nextStream2 } = parseAnyBut(token => token.type === "]")(
        nextStream
          .next() // take ]
          .next() // take [
      );
      return { LinkExpression, AnyBut, nextStream: nextStream2 }
    }).filter(({ nextStream }) => {
      const token = nextStream.peek();
      return "]" === token.type;
    }).map(({ LinkExpression, AnyBut, nextStream }) => {
      return pair(
        {
          type: TYPES.linkRef,
          LinkExpression,
          linkRef: AnyBut.textArray.join("")
        },
        nextStream.next()
      );
    })
    .actual(() => {
      throw new Error(
        "Error occurred while parsing LinkRef," + nextStream.toString()
      );
    })
}

/*
* stream => pair(LinkRefDef, stream)
*/
function parseLinkRefDef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "[" === token.type;
    }).map(nextStream => {
      return parseAnyBut(token => token.type === "]")(nextStream.next())
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.next().peek(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyButRef, right: nextStream }) => {
      const nextStream2 = filterSpace(nextStream.next())
      const { left: AnyButDef, right: nextStream3 } = parseAnyBut(token => token.type === "\n")(nextStream2);
      return pair(
        {
          type: TYPES.linkRefDef,
          linkRef: AnyButRef.textArray.join(""),
          linkRefDef: AnyButDef.textArray.join("")
        },
        nextStream3
      );
    })
    .actual(() => {
      throw new Error(
        "Error occurred while parsing LinkRefDef," + nextStream.toString()
      );
    })
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
        nextStream1.next() // remove "]" token
      );
    }
  }
  throw new Error("Error occurred while parsing Footnote," + stream.toString());
}

/**
 * stream => pair(FootnoteRef, stream)
 */
function parseFootnoteDef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "[" === token.type;
    }).map(nextStream => {
      const token = nextStream.next();
      return "^" === token.type;
    })
    .map(nextStream => {
      return parseAnyBut(token => token.type === "]")(nextStream.next())
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.next().peek(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyBut, right: nextStream }) => {
      const nextStream2 = filterSpace(nextStream.next())
      const { left: Expression, right: nextStream3 } = parseExpression(nextStream2);
      return pair(
        {
          type: TYPES.footnoteDef,
          footnote: AnyBut.textArray.join(""),
          Expression
        },
        nextStream3
      );
    })
    .actual(() => {
      throw new Error("Error occurred while parsing FootnoteDef," + stream.toString());
    })
}


/**
 * stream => pair(Italic, stream)
 */
function parseItalic(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "_" === token.type;
    }).map(nextStream => {
      return parseItalicType(nextStream.next());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.peek();
      return "_" === token.type;
    }).map(({ left: ItalicType, right: nextStream }) => {
      return pair({ type: TYPES.italic, ItalicType }, nextStream.next());
    }).actual(() => {
      throw new Error(
        "Error occurred while parsing Italic," + nextStream.toString()
      );
    })
}

/**
 * stream => pair(ItalicType, stream)
 */
function parseItalicType(stream) {
  return or(
    () => {
      const { left: Bold, right: nextStream } = parseBold(stream);
      return pair({ type: TYPES.italicType, Bold }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: TYPES.italicType, Link }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.italicType, Text }, nextStream);
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
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.peek();
      return "**" === token.type;
    }).map(nextStream => {
      return parseBoldType(nextStream.next());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.peek();
      return "**" === token.type;
    }).map(({ left: BoldType, right: nextStream }) => {
      return pair({ type: TYPES.bold, BoldType }, nextStream.next());
    }).actual(() => {
      throw new Error(
        "Error occurred while parsing Bold," + nextStream.toString()
      );
    })
}

/**
 * stream => pair(BoldType, stream)
 */
function parseBoldType(stream) {
  return or(
    () => {
      const { left: Italic, right: nextStream } = parseItalic(stream);
      return pair({ type: TYPES.boldType, Italic }, nextStream);
    },
    () => {
      const { left: Link, right: nextStream } = parseLink(stream);
      return pair({ type: TYPES.boldType, Link }, nextStream);
    },
    () => {
      const { left: Text, right: nextStream } = parseText(stream);
      return pair({ type: TYPES.boldType, Text }, nextStream);
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
  const token = stream.peek();
  if (token.type === "!") {
    const { left: Link, right: nextStream } = parseLink(stream.next());
    return pair({ type: TYPES.media, Link }, nextStream);
  }
}

/**
 * stream => pair(MediaRefDef, stream)
 */
function parseMediaRefDef(stream) {
  const token = stream.peek();
  if (token.type === "!") {
    const { left: LinkRefDef, right: nextStream } = parseLinkRefDef(stream.next());
    return pair({ type: TYPES.mediaRefDef, LinkRefDef }, nextStream);
  }
}

/**
 * stream => pair(Custom, stream)
 */
function parseCustom(stream) {
  if (stream.peek().type === "[") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => "]" === token.type)(stream.next());
    const nextStream1 = nextStream.next();
    if (nextStream1.peek().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream2 } = parseAnyBut(token => CUSTOM_SYMBOL === token.type)(nextStream1.next());
      return pair(
        {
          type: TYPES.custom,
          key: AnyBut.textArray.join(""),
          value: AnyButCustom.textArray.join("")
        },
        nextStream2.next()
      );
    }
  }
  throw new Error(
    "Error occurred while parsing Custom," + stream.toString()
  );
}

/**
 * stream => pair(Text, stream)
 */
function parseText(stream) {
  return or(
    () => {
      const { left: AnyBut, right: nextStream } = parseAnyBut(t =>
        !(t.type === TEXT_SYMBOL || t.type === " ")
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
      const token = stream.peek();
      if (token.type !== "\n") {
        return pair({ type: TYPES.text, text: stream.peek().text }, stream.next())
      }
      throw new Error("Error occurred while parsing Text" + stream.toString());
    })
}

/**
 * n => stream => pair(List, stream)
 */
function parseList(n) {
  return function (stream) {
    return or(
      () => {
        const { left: UList, right: nextStream } = parseUList(n)(stream);
        return pair({ type: TYPES.list, UList }, nextStream);
      },
      () => {
        const { left: OList, right: nextStream } = parseOList(n)(stream);
        return pair({ type: TYPES.list, OList }, nextStream);
      }
    );
  };
}

/**
 * n => stream => pair(UList, stream)
 **/
function parseUList(n) {
  return function (stream) {
    return or(
      () => {
        const { left: ListItem, right: stream1 } = parseListItem(n, "-")(stream);
        const { left: UList, right: stream2 } = parseUList(n)(stream1);
        return pair(
          {
            type: TYPES.ulist,
            list: [ListItem, ...UList.list]
          },
          stream2
        );
      },
      () => {
        const { left: ListItem, right: stream1 } = parseListItem(n, "-")(stream);
        return pair({ type: TYPES.ulist, list: [ListItem] }, stream1);
      }
    );
  }
}

/**
 * n => stream => pair(OList, stream)
 **/
function parseOList(n) {
  return function (stream) {
    return or(
      () => {
        const { left: ListItem, right: stream1 } = parseListItem(n, ORDER_LIST_SYMBOL)(stream);
        const { left: OList, right: stream2 } = parseOList(n)(stream1);
        return pair(
          {
            type: TYPES.olist,
            list: [ListItem, ...OList.list]
          },
          stream2
        );
      },
      () => {
        const { left: ListItem, right: stream1 } = parseListItem(n, ORDER_LIST_SYMBOL)(stream);
        return pair({ type: TYPES.olist, list: [ListItem] }, stream1);
      }
    );
  }
}

/**
 * (n,λ) => stream => pair(ListItem, stream)
 */
function parseListItem(n, λ) {
  return function (stream) {
    // order matters
    const stream1 = or(
      () => eatSymbol(2 * n, s => s.peek().text === " ")(stream),
      () => eatSymbol(n, s => s.peek().text === " " || s.peek().text === "/t")(stream)
    );
    const token = stream1.peek();
    if (token.type === λ) {
      const filterNextSpace = filterSpace(stream1)
      const { left: Expression, right: stream2 } = parseExpression(filterNextSpace);
      const token1 = stream2.peek();
      if (token1.type === "\n") {
        return or(
          () => {
            const { left: List, right: stream3 } = parseList(n + 1)(stream2.next());
            return pair(
              {
                type: TYPES.listItem,
                Expression,
                children: List
              },
              stream3
            );
          },
          () => {
            return pair(
              {
                type: TYPES.listItem,
                Expression,
                children: []
              },
              stream2.next()
            );
          }
        )
      }
    }
    throw new Error(`Error occurred while parsing ListItem(${n}, ${λ})`, stream.toString());
  }
}

/**
 * stream => pair(Break, stream)
 */
function parseBreak(stream) {
  const token = stream.peek();
  if (token.type === LINE_SEPARATOR_SYMBOL) {
    return pair({ type: TYPES.break }, stream.next());
  }
}

/**
 * (token => boolean) => stream => pair(Single, stream)
 * @param {token => boolean} tokenPredicate: token => boolean
 */
function parseSingleBut(tokenPredicate) {
  return stream => {
    const token = stream.peek();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: TYPES.singleBut, text: text }, stream.next());
    }
    throw new Error("Error occurred while parsing Single," + stream.toString());
  };
}

/**
 * stream => pair(Html, stream)
 */
function parseHtml(stream) {
  try {
    const { left: StartTag, right: nextStream1 } = parseStartTag(stream);
    const { left: InnerHtml, right: nextStream2 } = parseInnerHtml(nextStream1);
    const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
    return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3);
  } catch (e) {
    throw new Error(`Error occurred while parsing HTML, ${JSON.stringify(e)}` + stream.toString());
  }
}

/**
 * stream => pair(StartTag, stream)
 */
function parseStartTag(stream) {
  const token = stream.peek();
  if ("<" === token.type) {
    const nextStream1 = eatSpaces(stream.next());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if (">" === nextStream5.peek().type) {
      return pair({ type: TYPES.startTag, tag: tagName.text, Attrs }, nextStream5.next());
    }
  }
  throw new Error(`Error occurred while parsing StartTag, ${JSON.stringify(e)}` + stream.toString());
}

/**
 * stream => pair(AlphaNumName, stream)
 */
function parseAlphaNumName(tokenStream) {
  const strBuffer = [];
  let charStream = stream(tokenStream.peek().text);
  if (!isAlpha(charStream.peek())) throw new Error(`Error occurred while parsing AlphaNumName, ${tokenText.text}` + tokenStream.toString);
  strBuffer.push(charStream.peek());
  while (charStream.hasNext() && isAlphaNumeric(charStream.next().peek())) {
    charStream = charStream.next();
    strBuffer.push(charStream.peek());
  }
  return pair({ type: TYPES.alphaNumName, text: strBuffer.join("") }, tokenStream.next());
}

/**
 * stream => pair(Attrs, stream)
 */
function parseAttrs(stream) {
  return or(
    () => {
      const { left: Attr, right: nextStream } = parseAttr(stream);
      const nextStreamNoSpaces = eatSpaces(nextStream);
      const { left: Attrs, right: nextStream1 } = parseAttrs(nextStreamNoSpaces);
      return pair({
        type: TYPES.attrs,
        attributes: [Attr, ...Attrs.attributes]
      }, nextStream1);
    },
    () => {
      return pair({
        type: TYPES.attrs,
        attributes: [],
      }, stream);
    }
  )
}

/**
 * stream => pair(Attrs, stream)
 */
function parseAttr(stream) {
  return or(
    () => {
      return success(stream)
        .map(nextStream => {
          return parseAlphaNumName(nextStream);
        })
        .filter(({ left: _, right: nextStream }) => {
          return "=" === nextStream.peek().type &&
            '"' === nextStream.next().peek().type;
        })
        .map(({ left: attrName, right: nextStream }) => {
          const { left: AnyBut, right: nextStream1 } = parseAnyBut(
            token => '"' === token.type)(
              nextStream
                .next() // take =
                .next() // take "
            );
          return pair({
            type: TYPES.attr,
            attributeName: attrName.text,
            attributeValue: AnyBut.textArray.join("")
          },
            nextStream1.next() // take "
          )
        }).actual(() => {
          throw new Error(`Error occurred while parsing Attr, ${stream.toString()}`);
        })
    },
    () => {
      return success(stream)
        .map(nextStream => {
          return parseAlphaNumName(nextStream);
        })
        .filter(({ left: _, right: nextStream }) => {
          return "=" === nextStream.peek().type &&
            "'" === nextStream.next().peek().type;
        })
        .map(({ left: attrName, right: nextStream }) => {
          const { left: AnyBut, right: nextStream1 } = parseAnyBut(
            token => "'" === token.type)(
              nextStream
                .next() // take =
                .next() // take '
            );
          return pair({
            type: TYPES.attr,
            attributeName: attrName.text,
            attributeValue: AnyBut.textArray.join("")
          },
            nextStream1.next() // take '
          )
        }).actual(() => {
          throw new Error(`Error occurred while parsing Attr, ${stream.toString()}`);
        })
    }
  );
}

/**
 * stream => pair(InnerHtml, stream)
 */
function parseInnerHtml(stream) {
  return or(
    () => {
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: TYPES.innerHtml, Html }, nextStream);
    },
    () => {
      const { left: AnyBut, right: nextStream } = parseAnyBut(token => "</" === token.type)(stream);
      const nablaTxt = AnyBut.textArray.join("");
      const Document = parse(nablaTxt);
      return pair({ type: TYPES.innerHtml, Document }, nextStream)
    }
  );
}

/**
 * stream => pair(EndTag, stream)
 */
function parseEndTag(stream) {
  const token = stream.peek();
  if ("</" === token.type) {
    const nextStream1 = eatSpaces(stream.next());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    if (">" === nextStream3.peek().type) {
      return pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.next());
    }
  }
  throw new Error(`Error occurred while parsing EndTag, ${JSON.stringify(e)}` + stream.toString());
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================



function filterSpace(stream) {
  const nextTokenStream = stream.next();
  return nextTokenStream.peek().type === " " ?
    nextTokenStream.next() :
    nextTokenStream;
}