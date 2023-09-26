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
  eatNSymbol,
  success,
  isAlphaNumeric,
  eatSpaces,
  isNumeric,
  eatSymbols,
  returnOne
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
 *                    Custom /
 *                    Html / 
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
 *              Code / 
 *              Italic / 
 *              Bold / 
 *              Custom / 
 *              Media / 
 *              Html / 
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
 * Italic -> _ItalicExpression_
 * 
 * ItalicExpression -> ItalicType ItalicExpression;
 * 
 * ItalicType -> Bold / Link / SingleBut("\n", "_")
 * 
 * Bold -> **BoldExpression**
 * 
 * BoldExpression -> BoldType BoldExpression;
 * 
 * BoldType -> Italic / Link / SingleBut("\n", "**")
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
 * Html -> StartTag InnerHtml EndTag / EmptyTag 
 * 
 * InnerHtml -> InnerHtmlTypes InnerHtml / ε
 * 
 * InnerHtmlTypes -> AnyBut("<" || "</") / Html
 * 
 * StartTag -> (" " || "\n")* < (" ")* AlphaNumName (" ")* Attrs (" ")*>
 * 
 * EmptyTag -> <(" ")* AlphaNumName (" ")* />
 * 
 * Attrs -> Attr Attrs / ε
 * 
 * Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 * 
 * EndTag -> (" " || "\n")* </(" ")*AlphaNumName(" ")*>
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
  italicExpression: "italicExpression",
  italicType: "italicType",
  bold: "bold",
  boldExpression: "boldExpression",
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
  emptyTag: "emptyTag",
  innerHtml: "innerHtml",
  innerHtmlTypes: "innerHtmlTypes",
  endTag: "endTag",
  alphaNumName: "alphaNumName",
  attr: "attr",
  attrs: "attrs",
}

/**
 * parse: String => Abstract syntactic tree
 */
export function parse(string) {
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
  if (nextStream.head().type === "\n") {
    return pair(
      {
        type: TYPES.paragraph,
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
  if (stream.head().type === "#") {
    const level = stream.head().repeat;
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
export function parseExpression(stream) {
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
      const { left: Custom, right: nextStream } = parseCustom(stream);
      return pair({ type: TYPES.expressionTypes, Custom }, nextStream);
    },
    () => {
      const { left: Html, right: nextStream } = parseHtml(stream);
      return pair({ type: TYPES.expressionTypes, Html }, nextStream);
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
  const token = stream.head();
  const repeat = token.repeat;
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => token.type === "$")(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return pair(
        {
          type: TYPES.formula,
          equation: AnyBut.textArray.join(""),
          isInline: nextToken?.repeat === 1
        },
        nextStream.tail()
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
        const peek = stream.head();
        if (!tokenPredicate(peek)) {
          const { left: AnyBut, right: nextStream } = parseAnyBut(tokenPredicate)(stream.tail());
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
  const token = stream.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(t => lineCodeTokenPredicate(t))(stream.tail());
    if (lineCodeTokenPredicate(nextStream.head())) {
      return pair(
        { type: TYPES.lineCode, code: AnyBut.textArray.join("") },
        nextStream.tail()
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
  const token = stream.head();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream } = parseAnyBut(t => t.type === "\n")(stream.tail());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream.tail());
    if (blockCodeTokenPredicate(nextNextStream.head())) {
      return pair(
        {
          type: TYPES.blockCode,
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
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      return parseLinkExpression(nextStream.tail());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.head();
      return "]" === token.type;
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.tail().head();
      return "(" === token.type;
    }).map(({ left: LinkExpression, right: nextStream }) => {
      const { left: AnyBut, right: nextStream2 } = parseAnyBut(token => token.type === ")")(
        nextStream
          .tail() // take ]
          .tail() // take (
      );
      return { LinkExpression, AnyBut, nextStream: nextStream2 }
    }).filter(({ nextStream }) => {
      const token = nextStream.head();
      return ")" === token.type;
    }).map(({ LinkExpression, AnyBut, nextStream }) => {
      return pair(
        {
          type: TYPES.anonlink,
          LinkExpression,
          link: AnyBut.textArray.join("")
        },
        nextStream.tail()
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
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      return parseLinkExpression(nextStream.tail());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.head();
      return "]" === token.type;
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.tail().head();
      return "[" === token.type;
    }).map(({ left: LinkExpression, right: nextStream }) => {
      const { left: AnyBut, right: nextStream2 } = parseAnyBut(token => token.type === "]")(
        nextStream
          .tail() // take ]
          .tail() // take [
      );
      return { LinkExpression, AnyBut, nextStream: nextStream2 }
    }).filter(({ nextStream }) => {
      const token = nextStream.head();
      return "]" === token.type;
    }).map(({ LinkExpression, AnyBut, nextStream }) => {
      return pair(
        {
          type: TYPES.linkRef,
          LinkExpression,
          linkRef: AnyBut.textArray.join("")
        },
        nextStream.tail()
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
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      return parseAnyBut(token => token.type === "]")(nextStream.tail())
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.tail().head(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyButRef, right: nextStream }) => {
      const nextStream2 = filterSpace(nextStream.tail())
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
  if (stream.head().type === "[") {
    const nextStream = stream.tail();
    if (nextStream.head().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut(token => token.type === "]")(nextStream.tail());
      return pair(
        { type: TYPES.footnote, footnote: AnyBut.textArray.join("") },
        nextStream1.tail() // remove "]" token
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
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      const token = nextStream.tail();
      return "^" === token.type;
    })
    .map(nextStream => {
      return parseAnyBut(token => token.type === "]")(nextStream.tail())
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.tail().head(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyBut, right: nextStream }) => {
      const nextStream2 = filterSpace(nextStream.tail())
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
      const token = nextStream.head();
      return "_" === token.type;
    }).map(nextStream => {
      return parseItalicExpression(nextStream.tail());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.head();
      return "_" === token.type;
    }).map(({ left: ItalicExpression, right: nextStream }) => {
      return pair({ type: TYPES.italic, ItalicExpression }, nextStream.tail());
    }).actual(() => {
      throw new Error(
        "Error occurred while parsing Italic," + nextStream.toString()
      );
    })
}

/** 
 * stream => pair(ItalicExpression, stream)
*/
function parseItalicExpression(stream) {
  return or(
    () => {
      const { left: ItalicType, right: nextStream } = parseItalicType(stream);
      const { left: ItalicExpression, right: nextNextStream } = parseItalicExpression(nextStream);
      return pair({
        type: TYPES.italicExpression,
        expressions: [ItalicType, ...ItalicExpression.expressions]
      },
        nextNextStream
      );
    },
    () => pair({ type: TYPES.italicExpression, expressions: [] }, stream)
  );
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
      const { left: SingleBut, right: nextStream } = parseSingleBut(token =>
        ["\n", "_"].includes(token.type))(stream);
      return pair({ type: TYPES.italicType, SingleBut }, nextStream);
    },
  );
}

/**
 * stream => pair(Bold, stream)
 */
function parseBold(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "**" === token.type;
    }).map(nextStream => {
      return parseBoldExpression(nextStream.tail());
    }).filter(({ _, right: nextStream }) => {
      const token = nextStream.head();
      return "**" === token.type;
    }).map(({ left: BoldExpression, right: nextStream }) => {
      return pair({ type: TYPES.bold, BoldExpression }, nextStream.tail());
    }).actual(() => {
      throw new Error(
        "Error occurred while parsing Bold," + nextStream.toString()
      );
    })
}

function parseBoldExpression(stream) {
  return or(
    () => {
      const { left: BoldType, right: nextStream } = parseBoldType(stream);
      const { left: BoldExpression, right: nextNextStream } = parseBoldExpression(nextStream);
      return pair({
        type: TYPES.BoldExpression,
        expressions: [BoldType, ...BoldExpression.expressions]
      },
        nextNextStream
      );
    },
    () => pair({ type: TYPES.boldExpression, expressions: [] }, stream)
  );
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
      const { left: SingleBut, right: nextStream } = parseSingleBut(token =>
        ["\n", "**"].includes(token.type))(stream);
      return pair({ type: TYPES.boldType, SingleBut }, nextStream);
    }
  );
}

/**
 * stream => pair(Media, stream)
 */
function parseMedia(stream) {
  const token = stream.head();
  if (token.type === "!") {
    const { left: Link, right: nextStream } = parseLink(stream.tail());
    return pair({ type: TYPES.media, Link }, nextStream);
  }
}

/**
 * stream => pair(MediaRefDef, stream)
 */
function parseMediaRefDef(stream) {
  const token = stream.head();
  if (token.type === "!") {
    const { left: LinkRefDef, right: nextStream } = parseLinkRefDef(stream.tail());
    return pair({ type: TYPES.mediaRefDef, LinkRefDef }, nextStream);
  }
}

/**
 * stream => pair(Custom, stream)
 */
function parseCustom(stream) {
  if (stream.head().type === "[") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => "]" === token.type)(stream.tail());
    const nextStream1 = nextStream.tail();
    if (nextStream1.head().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream2 } = parseAnyBut(token => CUSTOM_SYMBOL === token.type)(nextStream1.tail());
      return pair(
        {
          type: TYPES.custom,
          key: AnyBut.textArray.join(""),
          value: AnyButCustom.textArray.join("")
        },
        nextStream2.tail()
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
      const token = stream.head();
      if (token.type !== "\n") {
        return pair({ type: TYPES.text, text: stream.head().text }, stream.tail())
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
      () => eatNSymbol(2 * n, s => s.head().text === " ")(stream),
      () => eatNSymbol(n, s => s.head().text === " " || s.head().text === "/t")(stream)
    );
    const token = stream1.head();
    if (token.type === λ) {
      const filterNextSpace = filterSpace(stream1)
      const { left: Expression, right: stream2 } = parseExpression(filterNextSpace);
      const token1 = stream2.head();
      if (token1.type === "\n") {
        return or(
          () => {
            const { left: List, right: stream3 } = parseList(n + 1)(stream2.tail());
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
              stream2.tail()
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
  const token = stream.head();
  if (token.type === LINE_SEPARATOR_SYMBOL) {
    return pair({ type: TYPES.break }, stream.tail());
  }
}

/**
 * (token => boolean) => stream => pair(Single, stream)
 * @param {token => boolean} tokenPredicate: token => boolean
 */
function parseSingleBut(tokenPredicate) {
  return stream => {
    const token = stream.head();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return pair({ type: TYPES.singleBut, text: text }, stream.tail());
    }
    throw new Error("Error occurred while parsing Single," + stream.toString());
  };
}

/**
 * stream => pair(Html, stream)
 */
function parseHtml(stream) {
  return or(
    () => {
      const { left: StartTag, right: nextStream1 } = parseStartTag(stream);
      // small hack to parse script and style tags
      const { left: InnerHtml, right: nextStream2 } = returnOne([
        {
          predicate: _ => "style" === StartTag.tag || "script" === StartTag.tag,
          value: ss => parseSimpleInnerHtml(ss)
        },
      ],
        (ss) => parseInnerHtml(ss)
      )(nextStream1);

      const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
      return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3);
    },
    () => {
      const { left: EmptyTag, right: nextStream } = parseEmptyTag(stream);
      return pair({ type: TYPES.html, EmptyTag }, nextStream);
    }
  );
}

/**
 * stream => pair(StartTag, stream)
 */
function parseStartTag(stream) {
  const token = stream.head();
  if ("<" === token.type) {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if (">" === nextStream5.head().type) {
      return pair({ type: TYPES.startTag, tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error(`Error occurred while parsing StartTag, ${JSON.stringify(e)}` + stream.toString());
}

/**
 * stream => pair(EmptyTag, stream)
 */
function parseEmptyTag(stream) {
  const token = stream.head();
  if ("<" === token.type) {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpaces(nextStream4);
    if ("/>" === nextStream5.head().type) {
      return pair({ type: TYPES.emptyTag, tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error(`Error occurred while parsing EmptyTag, ${JSON.stringify(e)}` + stream.toString());
}

/**
 * stream => pair(AlphaNumName, stream)
 */
export function parseAlphaNumName(tokenStream) {
  const strBuffer = [];
  let s = tokenStream;
  if (isNumeric(s.head().text)) throw new Error(`Error occurred while parsing AlphaNumName, ${s.head().text}`);
  while (!s.isEmpty()) {
    const string = parseCharAlphaNumName(stream(s.head().text));
    if (string === "") break;
    strBuffer.push(string);
    s = s.tail();
  }
  if (strBuffer.length === 0) throw new Error(`Error occurred while parsing AlphaNumName, ${tokenStream.toString()}`);
  return pair({ type: TYPES.alphaNumName, text: strBuffer.join("") }, s);
}

function parseCharAlphaNumName(charStream) {
  const strBuffer = [];
  while (!charStream.isEmpty() && isAlphaNumeric(charStream.head())) {
    strBuffer.push(charStream.head());
    charStream = charStream.tail();
  }
  return strBuffer.join("");
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
          return "=" === nextStream.head().type &&
            '"' === nextStream.tail().head().type;
        })
        .map(({ left: attrName, right: nextStream }) => {
          const { left: AnyBut, right: nextStream1 } = parseAnyBut(
            token => '"' === token.type)(
              nextStream
                .tail() // take =
                .tail() // take "
            );
          return pair({
            type: TYPES.attr,
            attributeName: attrName.text,
            attributeValue: AnyBut.textArray.join("")
          },
            nextStream1.tail() // take "
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
          return "=" === nextStream.head().type &&
            "'" === nextStream.tail().head().type;
        })
        .map(({ left: attrName, right: nextStream }) => {
          const { left: AnyBut, right: nextStream1 } = parseAnyBut(
            token => "'" === token.type)(
              nextStream
                .tail() // take =
                .tail() // take '
            );
          return pair({
            type: TYPES.attr,
            attributeName: attrName.text,
            attributeValue: AnyBut.textArray.join("")
          },
            nextStream1.tail() // take '
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
      const { left: InnerHtmlTypes, right: nextStream } = parseInnerHtmlTypes(stream);
      const { left: InnerHtml, right: nextStream1 } = parseInnerHtml(nextStream);
      return pair({
        type: TYPES.innerHtml,
        innerHtmls: [InnerHtmlTypes, ...InnerHtml.innerHtmls]
      }, nextStream1);
    },
    () => {
      return pair({
        type: TYPES.innerHtml,
        innerHtmls: []
      }, stream);
    }
  );
}

/**
 * stream => pair(InnerHtml, stream)
 */
function parseSimpleInnerHtml(stream) {
  const { left: AnyBut, right: nextStream } = parseAnyBut(token => token.type === "</")(stream);
  const text = AnyBut.textArray.join("");
  return pair({
    type: TYPES.innerHtml,
    innerHtmls: [{
      type: TYPES.innerHtmlTypes,
      text: text
    }]
  },
    nextStream
  );
}

/**
 * stream => pair(InnerHtmlTypes, stream)
 */
function parseInnerHtmlTypes(stream) {
  const filteredStream = eatSymbols(
    stream,
    token => token.type === " " || token.type === "\t" || token.type === "\n"
  );
  return or(
    () => {
      const { left: AnyBut, right: nextStream } = parseAnyBut(token =>
        "</" === token.type ||
        "<" === token.type
      )(filteredStream);
      const nablaTxt = AnyBut.textArray.join("").trim();
      if (nablaTxt === "") throw new Error(`Error occurred while parsing InnerHtml, ${innerHtmlStream.toString()}`);
      return pair({
        type: TYPES.innerHtmlTypes,
        text: nablaTxt,
      }, nextStream);
    },
    () => {
      const { left: Html, right: nextStream } = parseHtml(filteredStream);
      return pair({
        type: TYPES.innerHtmlTypes,
        Html,
      }, nextStream);
    }
  );
}

/**
 * stream => pair(EndTag, stream)
 */
function parseEndTag(stream) {
  const filteredStream = eatSymbols(
    stream,
    token => token.type === " " || token.type === "\t" || token.type === "\n"
  );
  const token = filteredStream.head();
  if ("</" === token.type) {
    const nextStream1 = eatSpaces(filteredStream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    if (">" === nextStream3.head().type) {
      return pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.tail());
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
  const nextTokenStream = stream.tail();
  return nextTokenStream.head().type === " " ?
    nextTokenStream.tail() :
    nextTokenStream;
}