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
import { fail, success } from "./Monads.js";
import {
  or,
  pair,
  stream,
  eatNSymbol,
  isAlphaNumeric,
  eatSpaces,
  isNumeric,
  eatSymbolsWhile,
  returnOne,
  eatSpacesTabsAndNewLines,
  mOr
} from "./Utils.js";

/**
 * Grammar
 *
 * Document ->  Paragraph Document / ε 
 * 
 * Paragraph -> List(0) / 
 *              Statement '\n'
 * 
 * Statement -> Title /
 *              FootNoteDef / 
 *              LinkRefDef / 
 *              Break / 
 *              Expression
 * 
 * Title -> '#' Expression
 * 
 * Expression -> ExpressionTypes Expression /
 *               ε
 * 
 * ExpressionTypes -> Formula /
 *                    Code / 
 *                    Footnote /
 *                    Link / 
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
 * AnonLink -> (" ")*http(s|ε)://AnyBut(" ") / [LinkExpression](AnyBut(')'))
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
 * Text -> AnyBut(¬TextToken) / SingleBut("\n", "</")
 * 
 * List(n) -> UList(n) /
 *            OList(n)
 * 
 * UList(n) -> ListItem(n, '-') UList(n) /
 *             ListItem(n, '-')
 * 
 * OList(n) -> ListItem(n, '1.') OList(n) /
 *             ListItem(n, '1.')
 * 
 * ListItem(n, λ) -> indentation(n) 'λ ' Expression'\n' List(n+1) /
 *                   indentation(n) 'λ ' Expression '\n'
 * 
 * Break -> '---'
 * 
 * SingleBut(s) -> ¬s
 * 
 * Html -> StartTag InnerHtml EndTag / EmptyTag / CommentTag
 * 
 * InnerHtml -> InnerHtmlTypes InnerHtml / ε
 * 
 * InnerHtmlTypes -> Html / Paragraph / Expression*
 * 
 * StartTag ->  < (" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")*>
 * 
 * EmptyTag -> <(" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")* />
 * 
 * Attrs -> Attr (" " || "\n")* Attrs / ε
 * 
 * Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 * 
 * EndTag -> </(" ")*AlphaNumName(" ")*>
 * 
 * AlphaNumName -> [a-zA-z][a-zA-Z0-9]*
 * 
 * 
 * Expression* := not empty expression
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
  commentTag: "commentTag",
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
 * stream => Try(pair(Document, stream))
 */
function parseDocument(stream) {
  return mOr(
    () => {
      return parseParagraph(stream)
        .flatMap(({ left: paragraph, right: nextStream1 }) => {
          return parseDocument(nextStream1)
            .map(({ left: document, right: nextStream2 }) => {
              return pair(
                {
                  type: TYPES.document,
                  paragraphs: [paragraph, ...document.paragraphs]
                },
                nextStream2
              )
            });
        })
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
 * stream => Try(pair(Paragraph, stream))
 */
function parseParagraph(stream) {
  return mOr(
    () => {
      return parseList(0)(stream)
        .map(({ left: List, right: nextStream }) => {
          return pair({ type: TYPES.paragraph, List }, nextStream);
        })
    },
    () => {
      return parseStatement(stream)
        .flatMap(({ left: Statement, right: nextStream }) => {
          if (nextStream.head().type === "\n") {
            return success(pair({ type: TYPES.paragraph, Statement }, nextStream.tail()));
          }
          return fail(
            "Error occurred while parsing expression," + nextStream.toString()
          );
        })
    },
  );
}

/**
 * stream => Try(pair(Statement, stream))
 */
function parseStatement(stream) {
  return mOr(
    () => {
      return parseTitle(stream)
        .map(({ left: Title, right: nextStream }) => {
          return pair({ type: TYPES.statement, Title }, nextStream);
        })
    },
    () => {
      return parseFootnoteDef(stream)
        .map(({ left: FootnoteDef, right: nextStream }) => {
          return pair({ type: TYPES.statement, FootnoteDef }, nextStream);
        })
    },
    () => {
      return parseLinkRefDef(stream)
        .map(({ left: LinkRefDef, right: nextStream }) => {
          return pair({ type: TYPES.statement, LinkRefDef }, nextStream);
        })
    },
    () => {
      return parseBreak(stream)
        .map(({ left: Break, right: nextStream }) => {
          return pair({ type: TYPES.statement, Break }, nextStream);
        })
    },
    () => {
      return parseExpression(stream)
        .map(({ left: Expression, right: nextStream }) => {
          return pair({ type: TYPES.statement, Expression }, nextStream);
        })
    },
  );
}

/**
 * stream => Try(pair(Title, stream))
 */
function parseTitle(stream) {
  if (stream.head().type === "#") {
    const level = stream.head().repeat;
    // shortcut in parsing this rule
    const filterNextSpace = filterSpace(stream.tail());
    const { left: Expression, right: nextStream } = parseExpression(filterNextSpace);
    return success(pair({ type: TYPES.title, Expression, level }, nextStream));
  }
  return fail(
    "Error occurred while parsing Title," + stream.toString()
  );
}

/**
 * stream => Try(pair(Expression, stream))
 */
export function parseExpression(stream) {
  return mOr(
    () => {
      parseExpressionTypes(stream)
        .flatMap(({ left: ExpressionTypes, right: nextStream }) => {
          return parseExpression(nextStream)
            .map(({ left: Expression, right: nextNextStream }) => {
              return pair(
                {
                  type: TYPES.expression,
                  expressions: [ExpressionTypes, ...Expression.expressions],
                },
                nextNextStream
              );
            })
        })
    },
    () => success(
      pair(
        {
          type: TYPES.expression,
          expressions: []
        },
        stream
      )
    )
  );
}

/**
 * stream => Try(pair(SeqTypes, stream))
 */
function parseExpressionTypes(stream) {
  return mOr(
    () => {
      return parseFormula(stream)
        .map(({ left: Formula, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Formula }, nextStream);
        })
    },
    () => {
      return parseCode(stream)
        .map(({ left: Code, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Code }, nextStream);
        })
    },
    () => {
      return parseFootnote(stream)
        .map(({ left: Footnote, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Footnote }, nextStream);
        })
    },
    () => {
      return parseLink(stream)
        .map(({ left: Link, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Link }, nextStream);
        })
    },
    () => {
      return parseMedia(stream)
        .map(({ left: Media, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Media }, nextStream);
        })
    },
    () => {
      return parseItalic(stream)
        .map(({ left: Italic, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Italic }, nextStream);
        })
    },
    () => {
      return parseBold(stream)
        .map(({ left: Bold, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Bold }, nextStream);
        })
    },
    () => {
      return parseCustom(stream)
        .map(({ left: Custom, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Custom }, nextStream);
        })
    },
    () => {
      return parseHtml(stream)
        .map(({ left: Html, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Html }, nextStream);
        })
    },
    () => {
      return parseText(stream)
        .map(({ left: Text, right: nextStream }) => {
          return pair({ type: TYPES.expressionTypes, Text }, nextStream);
        })
    }
  );
}

/**
 * stream => Try(pair(Formula, stream))
 */
function parseFormula(stream) {
  const token = stream.head();
  const repeat = token.repeat;
  if (token.type === "$") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => token.type === "$")(stream.tail());
    const nextToken = nextStream.head();
    if (nextToken.type === "$" && nextToken?.repeat === repeat) {
      return success(
        pair(
          {
            type: TYPES.formula,
            equation: AnyBut.textArray.join(""),
            isInline: nextToken?.repeat === 1
          },
          nextStream.tail()
        )
      );
    }
  }
  return fail(
    "Error occurred while parsing Formula," + stream.toString()
  );
}

/**
 * (token => boolean) => stream => Try(pair(AnyBut, stream))
 */
function parseAnyBut(tokenPredicate) {
  return (stream) => {
    let nextStream = stream;
    const textArray = [];
    while (!nextStream.isEmpty() && !tokenPredicate(nextStream.head())) {
      textArray.push(nextStream.head().text);
      nextStream = nextStream.tail();
    }
    return success(
      pair(
        { type: TYPES.anyBut, textArray },
        nextStream
      )
    );
  };
}

/**
 * stream => Try(pair(Code, stream))
 */
function parseCode(stream) {
  return mOr(
    () => {
      return parseLineCode(stream)
        .map(({ left: LineCode, right: nextStream }) => {
          return pair({ type: TYPES.code, LineCode }, nextStream);
        })
    },
    () => {
      return parseBlockCode(stream)
        .map(({ left: BlockCode, right: nextStream }) => {
          return pair({ type: TYPES.code, BlockCode }, nextStream);
        })
    }
  );
}

/**
 * stream => Try(pair(LineCode, stream))
 */
function parseLineCode(stream) {
  const lineCodeTokenPredicate = t => t.type === "`";
  const token = stream.head();
  if (lineCodeTokenPredicate(token)) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(t => lineCodeTokenPredicate(t))(stream.tail());
    if (lineCodeTokenPredicate(nextStream.head())) {
      return success(
        pair(
          { type: TYPES.lineCode, code: AnyBut.textArray.join("") },
          nextStream.tail()
        )
      );
    }
  }
  return fail("Error occurred while parsing LineCode," + stream.toString());
}

/**
 * stream => Try(pair(BlockCode, stream))
 */
function parseBlockCode(stream) {
  const blockCodeTokenPredicate = t => t.type === CODE_SYMBOL;
  const token = stream.head();
  if (blockCodeTokenPredicate(token)) {
    const { left: languageAnyBut, right: nextStream } = parseAnyBut(t => t.type === "\n")(stream.tail());
    const { left: AnyBut, right: nextNextStream } = parseAnyBut(blockCodeTokenPredicate)(nextStream.tail());
    if (blockCodeTokenPredicate(nextNextStream.head())) {
      return success(
        pair(
          {
            type: TYPES.blockCode,
            code: AnyBut.textArray.join(""),
            language: languageAnyBut.textArray.join("").trim()
          },
          nextNextStream.tail()
        )
      );
    }
  }
  return fail(
    "Error occurred while parsing BlockCode," + stream.toString()
  );
}

/**
 * stream => Try(pair(Link, stream))
 */
function parseLink(stream) {
  return mOr(
    () => {
      return parseAnonLink(stream)
        .map(({ left: AnonLink, right: nextStream }) => {
          return pair({ type: TYPES.link, AnonLink }, nextStream);
        })
    },
    () => {
      return parseLinkRef(stream)
        .map(({ left: LinkRef, right: nextStream }) => {
          return pair({ type: TYPES.link, LinkRef }, nextStream);
        })
    }
  )
}

function createStringParser(string) {
  let tokenStream = tokenizer(stream(string));
  return stream => {
    let s = stream;
    while (!tokenStream.isEmpty()) {
      if (s.head().text !== tokenStream.head().text) return fail(`Error occurred while parsing string ${string},` + stream.toString());
      s = s.tail();
      tokenStream = tokenStream.tail();
    }
    return success(
      pair(string, s)
    );
  }
}


/**
 * stream => Try(pair(AnonLink, stream))
 */
function parseAnonLink(stream) {
  return mOr(
    () => {
      const cleanStream = eatSpaces(stream);
      const { left: httpStr, right: nextStream } = mOr(
        () => createStringParser("https://")(cleanStream),
        () => createStringParser("http://")(cleanStream)
      ).orCatch();
      return parseAnyBut(s => s.type === " " || s.type === "\n" || s.type === "\t")(nextStream)
        .map(({ left: AnyBut, right: nextStream2 }) => {
          const url = httpStr + AnyBut.textArray.join("");
          return pair(
            {
              type: TYPES.anonlink,
              LinkExpression: {
                type: TYPES.linkExpression,
                expressions: [{ type: TYPES.linkTypes, SingleBut: { type: TYPES.singleBut, text: url } }]
              },
              link: url
            },
            nextStream2
          );
        })
    },
    () => {
      return success(stream)
        .filter(nextStream => {
          const token = nextStream.head();
          return "[" === token.type;
        }).map(nextStream => {
          return parseLinkExpression(nextStream.tail());
        }).filter(({ right: nextStream }) => {
          const token = nextStream.head();
          return "]" === token.type;
        }).filter(({ right: nextStream }) => {
          const token = nextStream.tail().head();
          return "(" === token.type;
        }).map(({ left: LinkExpression, right: nextStream }) => {
          const { left: AnyBut, right: nextStream2 } = parseAnyBut(token => token.type === ")")(
            nextStream.take(2) // take ] and (
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
          )
        })
    }
  );
}

/**
 * stream => Try(pair(LinkExpression, stream))
 */
function parseLinkExpression(stream) {
  return mOr(
    () => {
      return parseLinkTypes(stream)
        .flatMap(({ left: LinkTypes, right: nextStream }) => {
          return parseLinkExpression(nextStream)
            .map(({ left: LinkExpression, right: nextNextStream }) => {
              return pair({
                type: TYPES.linkExpression,
                expressions: simplifyExpressions([LinkTypes, ...LinkExpression.expressions])
                // expressions: [LinkTypes, ...LinkExpression.expressions]
              },
                nextNextStream
              );
            })
        })
    },
    () => success(
      pair({ type: TYPES.linkExpression, expressions: [] }, stream)
    )
  );
}

/**
 * stream => Try(pair(LinkTypes, stream))
 */
function parseLinkTypes(stream) {
  return mOr(
    () => {
      return parseFormula(stream)
        .map(({ left: Formula, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Formula }, nextStream);
        })
    },
    () => {
      return parseHtml(stream)
        .map(({ left: Html, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Html }, nextStream);
        })
    },
    () => {
      return parseCode(stream)
        .map(({ left: Code, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Code }, nextStream);
        })
    },
    () => {
      return parseItalic(stream)
        .map(({ left: Italic, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Italic }, nextStream);
        })
    },
    () => {
      return parseBold(stream)
        .map(({ left: Bold, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Bold }, nextStream);
        })
    },
    () => {
      return parseCustom(stream)
        .map(({ left: Custom, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Custom }, nextStream);
        })
    },
    () => {
      return parseMedia(stream)
        .map(({ left: Media, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, Media }, nextStream);
        })
    },
    () => {
      return parseSingleBut(token =>
        ["\n", "]"].includes(token.type))(stream)
        .map(({ left: SingleBut, right: nextStream }) => {
          return pair({ type: TYPES.linkTypes, SingleBut }, nextStream);
        })
    },
  );
}

/*
* stream => Try(pair(LinkRef, stream))
*/
function parseLinkRef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      return parseLinkExpression(nextStream.tail());
    }).filter(({ right: nextStream }) => {
      const token = nextStream.head();
      return "]" === token.type;
    }).filter(({ right: nextStream }) => {
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
          id: AnyBut.textArray.join("")
        },
        nextStream.tail()
      );
    })
}

/*
* stream => Try(pair(LinkRefDef, stream))
*/
function parseLinkRefDef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "[" === token.type;
    }).map(nextStream => {
      return parseAnyBut(token => token.type === "]")(nextStream.tail())
    }).filter(({ right: nextStream }) => {
      const token = nextStream.tail().head(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyButRef, right: nextStream }) => {
      const nextStream2 = filterSpace(
        nextStream
          .tail() // take ]
          .tail() // take :
      )
      const { left: AnyButDef, right: nextStream3 } = parseAnyBut(token => token.type === "\n")(nextStream2);
      return pair(
        {
          type: TYPES.linkRefDef,
          id: AnyButRef.textArray.join(""),
          url: AnyButDef.textArray.join("")
        },
        nextStream3
      );
    })
}

/**
 * stream => Try(pair(Footnote, stream))
 */
function parseFootnote(stream) {
  if (stream.head().type === "[") {
    const nextStream = stream.tail();
    if (nextStream.head().type === "^") {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut(token => token.type === "]")(nextStream.tail());
      return success(
        pair(
          { type: TYPES.footnote, id: AnyBut.textArray.join("") },
          nextStream1.tail() // remove "]" token
        )
      )
    }
  }
  return fail("Error occurred while parsing Footnote," + stream.toString());
}

/**
 * stream => Try(pair(FootnoteDef, stream))
 */
function parseFootnoteDef(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "[" === token.type;
    })
    .filter(nextStream => {
      const token = nextStream.tail().head();
      return "^" === token.type;
    })
    .map(nextStream => {
      return parseAnyBut(token => token.type === "]")(
        nextStream
          .tail()
          .tail()
      )
    }).filter(({ right: nextStream }) => {
      const token = nextStream.tail().head(); // take ]
      return ":" === token.type;
    }).map(({ left: AnyBut, right: nextStream }) => {
      const nextStream2 = filterSpace(nextStream.tail())
      const { left: Expression, right: nextStream3 } = parseExpression(nextStream2);
      return pair(
        {
          type: TYPES.footnoteDef,
          id: AnyBut.textArray.join(""),
          Expression
        },
        nextStream3
      );
    })
}


/**
 * stream => Try(pair(Italic, stream))
 */
function parseItalic(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "_" === token.type;
    }).map(nextStream => {
      return parseItalicExpression(nextStream.tail());
    }).filter(({ right: nextStream }) => {
      const token = nextStream.head();
      return "_" === token.type;
    }).map(({ left: ItalicExpression, right: nextStream }) => {
      return pair({ type: TYPES.italic, ItalicExpression }, nextStream.tail());
    })
}

/** 
 * stream => Try(pair(ItalicExpression, stream))
*/
function parseItalicExpression(stream) {
  return mOr(
    () => {
      return parseItalicType(stream)
        .flatMap(({ left: ItalicType, right: nextStream }) => {
          return parseItalicExpression(nextStream)
            .map(({ left: ItalicExpression, right: nextNextStream }) => {
              return pair({
                type: TYPES.italicExpression,
                expressions: simplifyExpressions([ItalicType, ...ItalicExpression.expressions])
              },
                nextNextStream
              );
            })
        })
    },
    () => success(
      pair({ type: TYPES.italicExpression, expressions: [] }, stream)
    )
  );
}

/**
 * stream => Try(pair(ItalicType, stream))
 */
function parseItalicType(stream) {
  return mOr(
    () => {
      return parseBold(stream)
        .map(({ left: Bold, right: nextStream }) => {
          return pair({ type: TYPES.italicType, Bold }, nextStream);
        })
    },
    () => {
      return parseLink(stream)
        .map(({ left: Link, right: nextStream }) => {
          return pair({ type: TYPES.italicType, Link }, nextStream);
        })
    },
    () => {
      return parseSingleBut(token =>
        ["\n", "_"].includes(token.type))(stream)
        .map(({ left: SingleBut, right: nextStream }) => {
          return pair({ type: TYPES.italicType, SingleBut }, nextStream);
        })
    },
  );
}

/**
 * stream => Try(pair(Bold, stream))
 */
function parseBold(stream) {
  return success(stream)
    .filter(nextStream => {
      const token = nextStream.head();
      return "*" === token.type;
    }).map(nextStream => {
      return parseBoldExpression(nextStream.tail());
    }).filter(({ right: nextStream }) => {
      const token = nextStream.head();
      return "*" === token.type;
    }).map(({ left: BoldExpression, right: nextStream }) => {
      return pair({ type: TYPES.bold, BoldExpression }, nextStream.tail());
    })
}

/**
 * stream => Try(pair(BoldExpression, stream))
 */
function parseBoldExpression(stream) {
  return mOr(
    () => {
      return parseBoldType(stream)
        .flatMap(({ left: BoldType, right: nextStream }) => {
          return parseBoldExpression(nextStream)
            .map(({ left: BoldExpression, right: nextNextStream }) => {
              return pair({
                type: TYPES.boldExpression,
                expressions: simplifyExpressions([BoldType, ...BoldExpression.expressions])
              },
                nextNextStream
              );
            })

        })
    },
    () => success(
      pair({ type: TYPES.boldExpression, expressions: [] }, stream)
    )
  );
}

/**
 * stream => Try(pair(BoldType, stream))
 */
function parseBoldType(stream) {
  return mOr(
    () => {
      return parseItalic(stream)
        .map(({ left: Italic, right: nextStream }) => {
          return pair({ type: TYPES.boldType, Italic }, nextStream);
        })
    },
    () => {
      return parseLink(stream)
        .map(({ left: Link, right: nextStream }) => {
          return pair({ type: TYPES.boldType, Link }, nextStream);
        })
    },
    () => {
      return parseSingleBut(token =>
        ["\n", "*"].includes(token.type))(stream)
        .map(({ left: SingleBut, right: nextStream }) => {
          return pair({ type: TYPES.boldType, SingleBut }, nextStream);
        })
    }
  );
}

/**
 * stream => Try(pair(Media, stream))
 */
function parseMedia(stream) {
  const token = stream.head();
  if (token.type === "!") {
    return parseLink(stream.tail())
      .map(({ left: Link, right: nextStream }) => {
        return pair({ type: TYPES.media, Link }, nextStream);
      })
  }
  return fail("Caught error in media" + stream.toString());
}

/**
 * stream => Try(pair(Custom, stream))
 */
function parseCustom(stream) {
  if (stream.head().type === "[") {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => "]" === token.type)(stream.tail());
    const nextStream1 = nextStream.tail();
    if (nextStream1.head().type === CUSTOM_SYMBOL) {
      const { left: AnyButCustom, right: nextStream2 } = parseAnyBut(token => CUSTOM_SYMBOL === token.type)(nextStream1.tail());
      return success(
        pair(
          {
            type: TYPES.custom,
            key: AnyBut.textArray.join(""),
            value: AnyButCustom.textArray.join("")
          },
          nextStream2.tail()
        )
      );
    }
  }
  return fail(
    "Error occurred while parsing Custom," + stream.toString()
  );
}

/**
 * stream => Try(pair(Text, stream))
 */
function parseText(stream) {
  return mOr(
    () => {
      return parseAnyBut(t =>
        !(t.type === TEXT_SYMBOL || t.type === " ")
      )(stream)
        .map(({ left: AnyBut, right: nextStream }) => {
          if (AnyBut.textArray.length > 0) {
            return pair(
              { type: TYPES.text, text: AnyBut.textArray.join("") },
              nextStream
            );
          }
        })
    },
    () => {
      const token = stream.head();
      if (token.type !== "\n" && token.type !== "</") {
        return success(
          pair({ type: TYPES.text, text: stream.head().text }, stream.tail())
        );
      }
      return fail("Error occurred while parsing Text" + stream.toString());
    })
}

/**
 * (n) => stream => Try(pair(List, stream))
 */
function parseList(n) {
  return function (stream) {
    return mOr(
      () => {
        return parseUList(n)(stream)
          .map(({ left: UList, right: nextStream }) => {
            return pair({ type: TYPES.list, UList }, nextStream);
          })
      },
      () => {
        return parseOList(n)(stream)
          .map(({ left: OList, right: nextStream }) => {
            return pair({ type: TYPES.list, OList }, nextStream);
          })
      },
    );
  };
}

/**
 * (n) => stream => Try(pair(UList, stream))
 **/
function parseUList(n) {
  return function (stream) {
    return mOr(
      () => {
        return parseListItem(n, "-")(stream)
          .flatMap(({ left: ListItem, right: stream1 }) => {
            return parseUList(n)(stream1)
              .map(({ left: UList, right: stream2 }) => {
                return pair(
                  {
                    type: TYPES.ulist,
                    list: [ListItem, ...UList.list]
                  },
                  stream2
                );
              })
          })
      },
      () => {
        return parseListItem(n, "-")(stream)
          .map(({ left: ListItem, right: stream1 }) => {
            return pair({ type: TYPES.ulist, list: [ListItem] }, stream1);
          })
      }
    );
  }
}

/**
 * (n) => stream => Try(pair(OList, stream))
 **/
function parseOList(n) {
  return function (stream) {
    return mOr(
      () => {
        return parseListItem(n, ORDER_LIST_SYMBOL)(stream)
          .flatMap(({ left: ListItem, right: stream1 }) => {
            return parseOList(n)(stream1)
              .map(({ left: OList, right: stream2 }) => {
                return pair(
                  {
                    type: TYPES.olist,
                    list: [ListItem, ...OList.list]
                  },
                  stream2
                );
              })
          })
      },
      () => {
        return parseListItem(n, ORDER_LIST_SYMBOL)(stream)
          .map(({ left: ListItem, right: stream1 }) => {
            return pair({ type: TYPES.olist, list: [ListItem] }, stream1);
          })
      }
    );
  }
}

/**
 * (stream, n, λ) => Try(pair(Expression, stream))
 */
function parseListItemExpression({ stream, n, λ }) {
  return success(stream)
    .map((nextNextStream) => {
      return indentation(n, nextNextStream);
    })
    .filter((nextStream) => {
      return λ === nextStream.head().type;
    })
    .flatMap((nextStream) => {
      const filterNextSpace = filterSpace(nextStream.tail());
      return parseExpression(filterNextSpace);
    })
    .filter(({ right: nextStream }) => {
      return "\n" === nextStream.head().type;
    })
    .map(({ left: Expression, right: nextStream }) => {
      return pair(Expression, nextStream.tail());
    })
}

/**
 * (n,λ) => stream => Try(pair(ListItem, stream))
 */
function parseListItem(n, λ) {
  return function (stream) {
    return mOr(
      () => {
        return parseListItemExpression({ stream, n, λ })
          .flatMap(({ left: Expression, right: stream2 }) => {
            return parseList(n + 1)(stream2)
              .map(({ left: List, right: stream3 }) => {
                return pair(
                  {
                    type: TYPES.listItem,
                    Expression,
                    children: List
                  },
                  stream3
                );

              })
          })
      },
      () => {
        return parseListItemExpression({ stream, n, λ })
          .map(({ left: Expression, right: stream2 }) => {
            return pair(
              {
                type: TYPES.listItem,
                Expression,
              },
              stream2
            );
          })
      },
    )
  }
}

/**
 * stream => Try(pair(Break, stream))
 */
function parseBreak(stream) {
  const token = stream.head();
  if (token.type === LINE_SEPARATOR_SYMBOL) {
    return success(
      pair({ type: TYPES.break }, stream.tail())
    );
  }
}

/**
 * (token => boolean) => stream => Try(pair(Single, stream))
 * @param {token => boolean} tokenPredicate: token => boolean
 */
function parseSingleBut(tokenPredicate) {
  return stream => {
    const token = stream.head();
    if (!tokenPredicate(token)) {
      const text = token.text || "";
      return success(
        pair({ type: TYPES.singleBut, text: text }, stream.tail())
      );
    }
    return fail("Error occurred while parsing Single," + stream.toString());
  };
}

/**
 * stream => Try(pair(Html, stream))
 */
function parseHtml(stream) {
  return mOr(
    () => {
      return parseStartTag(stream)
        .flatMap(({ left: StartTag, right: nextStream1 }) => {
          // small hack to parse script and style tags
          return returnOne([{
            predicate: () => "style" === StartTag.tag || "script" === StartTag.tag,
            value: ss => parseSimpleInnerHtml(ss)
          }],
            (ss) => parseInnerHtml(ss)
          )(nextStream1)
            .flatMap(({ left: InnerHtml, right: nextStream2 }) => {
              return parseEndTag(nextStream2)
                .map(({ left: EndTag, right: nextStream3 }) => {
                  return pair({ type: TYPES.html, StartTag, InnerHtml, EndTag }, nextStream3)
                })
            })
        })
    },
    () => {
      return parseEmptyTag(stream)
        .map(({ left: EmptyTag, right: nextStream }) => {
          return pair({ type: TYPES.html, EmptyTag }, nextStream);
        })
    },
    () => {
      return parseCommentTag(stream)
        .map(({ left: CommentTag, right: nextStream }) => {
          return pair({ type: TYPES.html, CommentTag }, nextStream);
        })
    }
  );
}

/**
 * stream => Try(pair(StartTag, stream))
 */
function parseStartTag(stream) {
  const token = stream.head();
  if ("<" === token.type) {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
    if (">" === nextStream5.head().type) {
      return success(
        pair({ type: TYPES.startTag, tag: tagName.text, Attrs }, nextStream5.tail())
      );
    }
  }
  return fail(`Error occurred while parsing StartTag,` + stream.toString());
}

/**
 * stream => Try(pair(EmptyTag, stream))
 */
function parseEmptyTag(stream) {
  const token = stream.head();
  if ("<" === token.type) {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
    if ("/>" === nextStream5.head().type) {
      return success(
        pair({ type: TYPES.emptyTag, tag: tagName.text, Attrs }, nextStream5.tail())
      );
    }
  }
  return fail(`Error occurred while parsing EmptyTag,` + stream.toString());
}

function parseCommentTag(stream) {
  return success(stream)
    .filter((nextStream) => {
      return "<!--" === nextStream.head().type
    })
    .flatMap((nextStream) => {
      const { left: AnyBut, right: nextStream1 } = parseAnyBut(
        token => '-->' === token.type
      )(nextStream.tail());
      if (AnyBut.textArray.length > 0) {
        return success(
          pair({ type: TYPES.commentTag }, nextStream1.tail())
        );
      }
      return fail(`Dummy error. Real error to be thrown in _orCatch_ function`);
    })
}

/**
 * stream => Try(pair(AlphaNumName, stream))
 */
export function parseAlphaNumName(tokenStream) {
  const strBuffer = [];
  let s = tokenStream;
  if (isNumeric(s.head().text)) return fail(`Error occurred while parsing AlphaNumName, ${s.head().text}`);
  while (!s.isEmpty()) {
    const string = parseCharAlphaNumName(stream(s.head().text));
    if (string === "") break;
    strBuffer.push(string);
    s = s.tail();
  }
  if (strBuffer.length === 0) return fail(`Error occurred while parsing AlphaNumName, ${tokenStream.toString()}`);
  return success(
    pair({ type: TYPES.alphaNumName, text: strBuffer.join("") }, s)
  );
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
 * stream => Try(pair(Attrs, stream))
 */
function parseAttrs(stream) {
  return mOr(
    () => {
      return parseAttr(stream)
        .flatMap(({ left: Attr, right: nextStream }) => {
          const nextStreamNoSpaces = eatSpacesTabsAndNewLines(nextStream);
          return parseAttrs(nextStreamNoSpaces)
            .map(({ left: Attrs, right: nextStream1 }) => {
              return pair({
                type: TYPES.attrs,
                attributes: [Attr, ...Attrs.attributes]
              }, nextStream1);
            })
        })
    },
    () => {
      return success(
        pair({
          type: TYPES.attrs,
          attributes: [],
        }, stream)
      );
    }
  )
}

/**
 * stream => Try(pair(Attrs, stream))
 */
function parseAttr(stream) {
  return mOr(
    () => {
      return success(stream)
        .flatMap(nextStream => {
          return parseAlphaNumName(nextStream);
        })
        .filter(({ right: nextStream }) => {
          return "=" === nextStream.head().type &&
            '"' === nextStream.tail().head().type;
        })
        .flatMap(({ left: attrName, right: nextStream }) => {
          return parseAnyBut(token => '"' === token.type)(
            nextStream
              .tail() // take =
              .tail() // take "
          ).map(({ left: AnyBut, right: nextStream1 }) => {
            return pair({
              type: TYPES.attr,
              attributeName: attrName.text,
              attributeValue: AnyBut.textArray.join("")
            },
              nextStream1.tail() // take "
            )
          })
        })
    },
    () => {
      return success(stream)
        .flatMap(nextStream => {
          return parseAlphaNumName(nextStream);
        })
        .filter(({ right: nextStream }) => {
          return "=" === nextStream.head().type &&
            "'" === nextStream.tail().head().type;
        })
        .flatMap(({ left: attrName, right: nextStream }) => {
          return parseAnyBut(
            token => "'" === token.type)(
              nextStream
                .tail() // take =
                .tail() // take '
            )
            .map(({ left: AnyBut, right: nextStream1 }) => {
              return pair({
                type: TYPES.attr,
                attributeName: attrName.text,
                attributeValue: AnyBut.textArray.join("")
              },
                nextStream1.tail() // take '
              )
            })
        })
    },
    () => {
      return success(stream)
        .flatMap(nextStream => {
          return parseAlphaNumName(nextStream);
        })
        .map(({ left: attrName, right: nextStream }) => {
          return pair({
            type: TYPES.attr,
            attributeName: attrName.text,
            attributeValue: '"true"'
          },
            nextStream
          )
        })
    }
  );
}

/**
 * stream => Try(pair(InnerHtml, stream))
 */
function parseInnerHtml(stream) {
  return mOr(
    () => {
      return parseInnerHtmlTypes(stream)
        .flatMap(({ left: InnerHtmlTypes, right: nextStream }) => {
          return parseInnerHtml(nextStream)
            .map(({ left: InnerHtml, right: nextStream1 }) => {
              return pair({
                type: TYPES.innerHtml,
                innerHtmls: [InnerHtmlTypes, ...InnerHtml.innerHtmls]
              }, nextStream1);
            })
        })
    },
    () => {
      return success(
        pair({
          type: TYPES.innerHtml,
          innerHtmls: []
        }, stream)
      );
    }
  );
}

/**
 * stream => Try(pair(InnerHtml, stream))
 */
function parseSimpleInnerHtml(stream) {
  return parseAnyBut(token => token.type === "</")(stream)
    .map(({ left: AnyBut, right: nextStream }) => {
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
    })
}

/**
 * stream => Try(pair(InnerHtmlTypes, stream))
 */
function parseInnerHtmlTypes(stream) {
  const filteredStream = eatSymbolsWhile(
    stream,
    token => token.type === " " ||
      token.type === "\t" ||
      token.type === "\n"
  );
  return mOr(
    () => {
      return parseHtml(filteredStream)
        .map(({ left: Html, right: nextStream }) => {
          return pair(
            {
              type: TYPES.innerHtmlTypes,
              Html,
            },
            nextStream
          );
        })
    },
    () => {
      return parseParagraph(filteredStream)
        .map(({ left: Paragraph, right: nextStream }) => {
          return pair(
            {
              type: TYPES.innerHtmlTypes,
              Paragraph
            },
            nextStream
          );
        })
    },
    () => {
      return parseExpression(filteredStream)
        .flatMap(({ left: Expression, right: nextStream }) => {
          if (Expression.expressions.length === 0) return fail("Empty expression while parsing innerHtmlType" + nextStream.toString())
          return success(
            pair(
              {
                type: TYPES.innerHtmlTypes,
                Expression
              },
              nextStream
            )
          );
        })
    }
  );
}

/**
 * stream => Try(pair(EndTag, stream))
 */
function parseEndTag(stream) {
  const filteredStream = eatSpacesTabsAndNewLines(stream);
  const token = filteredStream.head();
  if ("</" === token.type) {
    const nextStream1 = eatSpaces(filteredStream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
    const nextStream3 = eatSpaces(nextStream2);
    if (">" === nextStream3.head().type) {
      return success(
        pair({ type: TYPES.endTag, tag: tagName.text }, nextStream3.tail())
      );
    }
  }
  return fail(`Error occurred while parsing EndTag` + stream.toString());
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function filterSpace(stream) {
  return stream.head().type !== " " ? stream : stream.tail();
}

const indentation = (n, stream) => {
  return eatNSymbol(n, s => s.head().type === " " || s.head().type === "\t")(stream);
}

function simplifyExpressions(expressions) {
  let groupText = [];
  const newExpressions = [];
  const groupSingleBut = singleList => ({
    type: TYPES.linkTypes,
    SingleBut:
    {
      type: TYPES.singleBut,
      text: singleList.map(({ SingleBut }) => SingleBut.text).join("")
    }
  });
  expressions.forEach(expression => {
    if (expression.SingleBut) {
      groupText.push(expression);
      return;
    }
    if (!expression.SingleBut) {
      if (groupText.length) {
        newExpressions.push(groupSingleBut(groupText))
        groupText = [];
      }
      newExpressions.push(expression);
      return;
    }
  })
  if (groupText.length) newExpressions.push(groupSingleBut(groupText));
  return newExpressions;
}
