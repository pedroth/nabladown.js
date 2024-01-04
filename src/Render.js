import katex from "katex";
import { buildDom } from "./buildDom";
import { tokenizer } from "./Lexer";
import { either, maybe } from "./Monads";
import { parse, parseExpression } from "./Parser";
import {
  evalScriptTag,
  returnOne,
  or,
  stream,
  innerHTMLToInnerText,
  runLazyAsyncsInOrder,
} from "./Utils";



//========================================================================================
/*                                                                                      *
 *                                        RENDER                                        *
 *                                                                                      */
//========================================================================================

/**
 * render: Abstract syntactic tree (AST) => Promise<DOM>
 */
export function render(tree) {
  return new Render().render(tree);
}

/**
 * render: Abstract syntax tree (AST) => Promise<String>
 */
export function renderToString(tree, options) {
  return new Render().abstractRender(tree).then(doc => doc.toString(options));
}

export class Render {
  /**
   * AST => Promise<DOM>
   */
  render(tree) {
    return this.abstractRender(tree)
      .then(doc => doc.build());
  }

  /**
   * (tree: AST, context) => Promise<DomBuilder>
   */
  async abstractRender(tree, context) {
    context = context || createContext(tree);
    const document = this.renderDocument(tree, context)
    await Promise.all(
      context.finalActions.map(f => f(document))
    );
    document.lazy((docDOM) => {
      const scripts = Array.from(docDOM.getElementsByTagName("script"));
      const lazyAsyncLambdas = scripts.map(script => () => evalScriptTag(script));
      runLazyAsyncsInOrder(lazyAsyncLambdas);
    });
    return document;
  }

  /**
   * (document, context) => DomBuilder
   */
  renderDocument(document, context) {
    const { paragraphs } = document;
    const documentContainer = buildDom("article");
    paragraphs.forEach(p => {
      if (isEmptyParagraph(p)) return;
      const paragraphDomBuilder = this.renderParagraph(p, context);
      documentContainer.appendChild(paragraphDomBuilder)
    });
    return documentContainer;
  }

  /**
   * (paragraph, context) => DomBuilder
   */
  renderParagraph(paragraph, context) {
    return returnOne([
      {
        predicate: p => !!p.List,
        value: p => this.renderList(p.List, context)
      },
      {
        predicate: p => !!p.Statement,
        value: p => {
          const { Statement } = p;
          const dom = buildDom("p");
          const statementDomBuilder = this.renderStatement(Statement, context);
          dom.appendChild(statementDomBuilder);
          return dom;
        }
      }
    ])(paragraph)
  }

  /**
   * (statement, context) => DomBuilder
   */
  renderStatement(statement, context) {
    return returnOne([
      { predicate: s => !!s.Title, value: s => this.renderTitle(s.Title, context) },
      { predicate: s => !!s.MediaRefDef, value: s => this.renderMediaRefDef(s.MediaRefDef, context) },
      { predicate: s => !!s.FootnoteDef, value: s => this.renderFootnoteDef(s.FootnoteDef, context) },
      { predicate: s => !!s.LinkRefDef, value: s => this.renderLinkRefDef(s.LinkRefDef, context) },
      { predicate: s => !!s.Break, value: s => this.renderBreak(s.Break, context) },
      { predicate: s => !!s.Expression, value: s => this.renderExpression(s.Expression, context) }
    ])(statement);
  }

  /**
   * (title, context) => DomBuilder
   */
  renderTitle(title, context) {
    const { level, Expression } = title;
    const header = buildDom(`h${level}`);
    const expressionDomB = this.renderExpression(Expression, context);
    const titleId = createIdFromExpression(expressionDomB)
    header
      .appendChild(expressionDomB)
      .attr("id", `${titleId}`);
    return header;
  }



  /**
   * (expression, context) => DomBuilder
   */
  renderExpression(expression, context) {
    const { expressions } = expression;
    const container = buildDom('span');
    expressions.forEach(expr => {
      const expressionTypeDomBuilder = this.renderExpressionType(expr, context);
      container.appendChild(expressionTypeDomBuilder)
    });
    return container;
  }

  /**
   * (expressionType, context) => DomBuilder
   */
  renderExpressionType(expressionType, context) {
    return returnOne([
      { predicate: t => !!t.Formula, value: t => this.renderFormula(t.Formula, context) },
      { predicate: t => !!t.Code, value: t => this.renderCode(t.Code, context) },
      { predicate: t => !!t.Link, value: t => this.renderLink(t.Link, context) },
      { predicate: t => !!t.Footnote, value: t => this.renderFootnote(t.Footnote, context) },
      { predicate: t => !!t.Media, value: t => this.renderMedia(t.Media, context) },
      { predicate: t => !!t.Italic, value: t => this.renderItalic(t.Italic, context) },
      { predicate: t => !!t.Bold, value: t => this.renderBold(t.Bold, context) },
      { predicate: t => !!t.Html, value: t => this.renderHtml(t.Html, context) },
      { predicate: t => !!t.Custom, value: t => this.renderCustom(t.Custom, context) },
      { predicate: t => !!t.SingleBut, value: t => this.renderSingleBut(t.SingleBut) },
      { predicate: t => !!t.Text, value: t => this.renderText(t.Text) },
    ])(expressionType);
  }

  /**
   * (formula) => DomBuilder
   */
  renderFormula(formula) {
    const Katex = katex || { render: () => { } };
    const { equation, isInline } = formula;
    const container = buildDom("span");
    container.inner(
      Katex.renderToString(equation, {
        throwOnError: false,
        displayMode: !isInline,
        output: "mathml"
      }))
    return container;
  }

  /**
   * (anyBut) => DomBuilder
   */
  renderAnyBut(anyBut) {
    const { textArray } = anyBut;
    const container = buildDom("p");
    container.inner(textArray.join(""));
    return container;
  }

  /**
   * (code, context) => DomBuilder
   */
  renderCode(code, context) {
    return returnOne([
      {
        predicate: c => !!c.LineCode,
        value: c => this.renderLineCode(c.LineCode, context)
      },
      {
        predicate: c => !!c.BlockCode,
        value: c => this.renderBlockCode(c.BlockCode, context)
      }
    ])(code);
  }

  /**
   * lineCode => DomBuilder
   */
  renderLineCode(lineCode) {
    const { code } = lineCode;
    const container = buildDom("code");
    container.inner(code);
    return container;
  }

  /**
   * blockCode => DomBuilder
   */
  renderBlockCode(blockCode) {
    const { code, language } = blockCode;
    const lang = language === "" ? "plaintext" : language;
    const container = buildDom("pre");
    const codeTag = buildDom("code");
    codeTag.attr("class", `language-${lang}`);
    codeTag.innerText(code);
    container.appendChild(codeTag);
    return container;
  }

  /**
   * (link, context) => DomBuilder
   */
  renderLink(link, context) {
    return returnOne([
      {
        predicate: l => !!l.AnonLink,
        value: l => this.renderAnonLink(l.AnonLink, context)
      },
      {
        predicate: l => !!l.LinkRef,
        value: l => this.renderLinkRef(l.LinkRef, context)
      }
    ])(link)
  }

  /**
   * (anonLink, context) => DomBuilder
   */
  renderAnonLink(anonLink, context) {
    const { LinkExpression, link: hyperlink } = anonLink;
    const container = buildDom("a");
    container.attr("href", hyperlink);
    hyperlink.includes("http") && container.attr("target", "_blank");
    // renderExpression is used instead of renderLinkExpression
    const childStatement = this.renderLinkExpression(LinkExpression, context);
    container.appendChild(childStatement);
    return container;
  }

  /**
   * (linkExpression, context) => DomBuilder
   */
  renderLinkExpression(linkExpression, context) {
    return this.renderExpression(linkExpression, context);
  }

  /**
   * (linkRef, context) => DomBuilder
   */
  renderLinkRef(linkRef, context) {
    const { LinkExpression, link, refId } = getLinkData({ LinkRef: linkRef }, context);
    const expression = this.renderLinkExpression(LinkExpression, context);
    const container = buildDom("a");
    container.appendChild(expression);
    either(link, refId)
      .mapLeft(link => {
        container.attr("href", link);
        link.includes("http") && container.attr("target", "_blank");

      })
      .mapRight((refId) => {
        const { links } = context;
        if (!links.id2dom[refId]) {
          links.id2dom[refId] = [];
        }
        links.id2dom[refId].push(container);
      })
    return container;
  }

  /**
   * (linkRefDef, context) => DomBuilder
   */
  renderLinkRefDef(linkRefDef, context) {
    const { id, url } = linkRefDef;
    const { links } = context;
    const linkDomBuilders = links.id2dom[id];
    if (!links.id2link[id]) {
      links.id2link[id] = url;
    }
    if (linkDomBuilders) {
      linkDomBuilders
        .filter(linkDomBuilder => "a" === linkDomBuilder.getType())
        .forEach(linkDomBuilder => {
          linkDomBuilder.attr("href", url);
          url.includes("http") && linkDomBuilder.attr("target", "_blank");
        })
      linkDomBuilders
        .filter(linkDomBuilder => "a" !== linkDomBuilder.getType())
        .forEach(linkDomBuilder => {
          const mediaDomB = this.getMediaElementFromSrc(url);
          mediaDomB.attr("style", "max-width: 97%;")
          maybe(linkDomBuilder.getAttrs()["alt"]).map(val => mediaDomB.attr("alt", val))
          linkDomBuilder.appendChild(mediaDomB);
        });
    }
    return buildDom("div");
  }

  /**
   * (footnote, context) => DomBuilder
   */
  renderFootnote(footnote, context) {
    const { id } = footnote;
    const { footnotes } = context;

    if (!footnotes.id2dom[id]) {
      footnotes.id2dom[id] = [];
    }
    if (!footnotes.id2label[id]) {
      footnotes.id2label[id] = ++footnotes.idCounter;
    }

    const fnDomId = footnotes.id2dom[id].length;
    const fnLabel = footnotes.id2label[id];

    const container = buildDom("sup");
    const link = buildDom("a")
      .attr("id", `fn${id}-${fnDomId}`)
      .inner(`[${fnLabel}]`);
    container.appendChild(link)

    footnotes.id2dom[id].push(link);

    return container;
  }

  /**
   * (footnoteDef, context) => DomBuilder
   */
  renderFootnoteDef(footnoteDef, context) {
    const { id, Expression } = footnoteDef
    const { footnotes } = context;
    if (!footnotes.domBuilder) {
      const footnotesDiv = buildDom("div")
        .appendChild(buildDom("hr"))
        .appendChild(buildDom("ol"));
      context.finalActions.push(doc =>
        doc.appendChild(footnotesDiv)
      );
      footnotes.domBuilder = footnotesDiv;
    }
    context.finalActions.push(() => {
      footnotes.domBuilder
        .getChildren()[1] // get list of footnote
        .appendChild(
          buildDom("li")
            .appendChild(
              this.renderExpression(Expression, context)
            )
            .appendChild(
              ...footnotes.id2dom[id].map((_, i) => buildDom("a")
                .attr("id", `fnDef${id}`)
                .attr("href", `#fn${id}-${i}`)
                .inner("↩"))
            )
        );
      footnotes.id2dom[id].forEach(dom => dom.attr("href", `#fnDef${id}`));
    });
    return buildDom("div");
  }

  /**
   * (italic, context) => DomBuilder
   */
  renderItalic(italic, context) {
    const { ItalicExpression } = italic;
    const container = buildDom("em");
    container.appendChild(this.renderItalicExpression(ItalicExpression, context));
    return container;
  }

  /**
   * (italicExpression, context) => DomBuilders
   */
  renderItalicExpression(italicExpression, context) {
    return this.renderExpression(italicExpression, context);
  }

  /**
   * (bold, context) => DomBuilder
   */
  renderBold(bold, context) {
    const { BoldExpression } = bold;
    const container = buildDom("strong");
    container.appendChild(this.renderBoldExpression(BoldExpression, context));
    return container;
  }

  /**
   * (boldExpression, context) => DomBuilders
   */
  renderBoldExpression(boldExpression, context) {
    return this.renderExpression(boldExpression, context);
  }

  /**
   * (media, context) => DomBuilder
   */
  renderMedia(media, context) {
    const { Link } = media;
    const { links } = context;
    const { LinkExpression, link, refId } = getLinkData(Link, context);
    const container = buildDom("div");
    container.attr(
      "style", "text-align:center;"
    );
    let mediaElem;
    either(link, refId)
      .mapLeft(link => {
        mediaElem = this.getMediaElementFromSrc(link);
        mediaElem.attr("style", "max-width: 97%;")
      })
      .mapRight(refId => {
        mediaElem = buildDom("div");
        if (!links.id2dom[refId]) {
          links.id2dom[refId] = [];
        }
        links.id2dom[refId].push(mediaElem);
      })
    const caption = this.renderExpression(LinkExpression, context);
    mediaElem.attr("alt", createIdFromExpression(caption));
    container.appendChild(mediaElem);
    container.appendChild(
      buildDom("figcaption")
        .appendChild(caption)
    );
    return container;
  }

  /**
   * src: string => DomBuilder
   */
  getMediaElementFromSrc(src) {
    const defaultAction = this.getImagePredicateValue().value;
    return returnOne([
      this.getVideoPredicateValue(),
      this.getAudioPredicateValue(),
      this.getImagePredicateValue(),
      ...this.getEmbeddedPredicateValue()
    ], defaultAction)(src);
  }

  getVideoPredicateValue() {
    return {
      predicate: src => [
        ".mp4",
        ".ogg",
        ".avi",
        ".webm"
      ].some(e => src.includes(e)),
      value: src => {
        const video = buildDom("video");
        video.attr("src", src);
        video.attr("controls", "");
        return video;
      }
    };
  }

  getAudioPredicateValue() {
    return {
      predicate: src => [".mp3", ".ogg", ".wav"].some(e => src.includes(e)),
      value: src => {
        const audio = buildDom("audio");
        audio.attr("src", src);
        audio.attr("controls", "");
        return audio;
      }
    };
  }

  getImagePredicateValue() {
    return {
      predicate: src =>
        [
          ".apng",
          ".avif",
          ".gif",
          ".jpg",
          ".jpeg",
          ".jfif",
          ".pjpeg",
          ".pjp",
          ".png",
          ".svg",
          ".webp"
        ].some(e => src.includes(e)),
      value: src => {
        const img = buildDom("img");
        img.attr("src", src);
        return img;
      }
    };
  }

  getEmbeddedPredicateValue() {
    return [{
      predicate: src => [".youtube.com", "youtu.be"].some(e => src.includes(e)),
      value: src => {
        const frame = buildDom("iframe");
        const videoId = or(
          () => {
            return src.split("v=")[1].split("&")[0];
          },
          () => {
            return src.split(".be/")[1];
          }
        );
        frame.attr(
          "src",
          "https://www.youtube-nocookie.com/embed/" + videoId
        );
        frame.attr("frameborder", 0);
        frame.attr("height", "315");
        frame.attr("width", "560")
        frame.attr(
          "allow",
          "fullscreen; clipboard-write; encrypted-media; picture-in-picture"
        );
        return frame;
      }
    }];
  }

  /**
   * (custom, context) => DomBuilder
   */
  renderCustom(custom, context) {
    const { key, value } = custom;
    const div = buildDom("div");
    div.attr("class", key);
    const valueAsDoc = parse(value);
    const { left: valueAsExpression } = parseExpression(
      tokenizer(
        stream(value)
      )
    );
    if (valueAsDoc.paragraphs.length > 0) {
      context.finalActions.push(() => {
        const stashFinalActions = [...context.finalActions];
        context.finalActions = [];
        return this.abstractRender(
          valueAsDoc,
          context
        ).then((domBuilderDoc) => {
          div.appendChild(domBuilderDoc);
          context.finalActions = stashFinalActions;
        })
      });
      return div;
    }
    const span = buildDom("span").attr("class", key);
    const domBuilderExpression = this.renderExpression(valueAsExpression, context);
    span.appendChild(domBuilderExpression);
    return span;
  }

  /**
   * text => DomBuilder
   */
  renderText(text) {
    const { text: txt } = text;
    const container = buildDom("span");
    container.inner(txt);
    return container;
  }

  /**
   * (list, context) => DomBuilder
   */
  renderList(list, context) {
    return returnOne([
      { predicate: l => !!l.UList, value: l => this.renderUList(l.UList, context) },
      { predicate: l => !!l.OList, value: l => this.renderOList(l.OList, context) }
    ])(list);
  }

  /**
   * (ulist, context) => DomBuilder
   */
  renderUList(ulist, context) {
    const container = buildDom("ul");
    const { list } = ulist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem, context));
    });
    return container;
  }

  /**
   * (olist, context) => DomBuilder
   */
  renderOList(olist, context) {
    const container = buildDom("ol");
    const { list } = olist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem, context));
    });
    return container;
  }

  /**
   * listItem => DomBuilder
   */
  renderListItem(listItem, context) {
    const { Expression, children } = listItem;
    const expression = this.renderExpression(Expression, context);
    const li = buildDom("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(
        this.renderList(children, context)
      );
    }
    return li;
  }

  /**
   * break => DomBuilder
   */
  renderBreak() {
    const div = buildDom("hr");
    return div;
  }

  /**
   * singleBut => DomBuilder
   */
  renderSingleBut(singleBut) {
    const { text } = singleBut;
    const container = buildDom("span");
    container.inner(text);
    return container;
  }

  /**
   * (html, context) => DomBuilder
  */
  renderHtml(html, context) {
    return returnOne([
      {
        predicate: h => !!h.StartTag,
        value: h => {
          const { StartTag, InnerHtml, EndTag } = h;
          if (StartTag.tag.text !== EndTag.tag.text) {
            const container = buildDom("tag");
            container.inner(`startTag and endTag are not the same, ${StartTag.tag.text} !== ${EndTag.tag}`);
            return container;
          }
          const { tag, Attrs } = StartTag;
          const container = buildDom(tag);
          const attributes = Attrs.attributes;
          attributes.forEach(({ attributeName, attributeValue }) => container.attr(attributeName, attributeValue));
          if (tag !== "style" && tag !== "script") {
            const innerHtmldomBuilder = this.renderInnerHtml(InnerHtml, context);
            innerHtmldomBuilder
              .getChildren()
              .forEach(child => {
                container.appendChild(child)
              });
            return container;
          }
          // create style and script container
          const { innerHtmls } = InnerHtml;
          const [first] = innerHtmls;
          container.inner(first.text)
          return container;
        }
      },
      {
        predicate: h => !!h.EmptyTag,
        value: h => this.renderEmptyTag(h.EmptyTag)
      },
      {
        predicate: h => !!h.CommentTag,
        value: h => this.renderCommentTag(h.CommentTag)
      }
    ])(html);
  }

  /**
   * (innerHtml, context) => DomBuilder
   */
  renderInnerHtml(innerHtml, context) {
    const { innerHtmls } = innerHtml;
    const container = buildDom("div");
    innerHtmls
      .forEach(innerHtmlTypes =>
        container.appendChild(
          this.renderInnerHtmlTypes(innerHtmlTypes, context)
        )
      );
    return container;
  }

  /**
   * (innerHtmlTypes, context) => DomBuilder
   */
  renderInnerHtmlTypes(innerHtmlTypes, context) {
    return returnOne([
      {
        predicate: i => !!i.Html,
        value: i => {
          const { Html } = i;
          return this.renderHtml(Html, context);
        }
      },
      {
        predicate: i => !!i.Paragraph,
        value: i => {
          const { Paragraph } = i;
          return this.renderParagraph(Paragraph, context);
        }
      },
      {
        predicate: i => !!i.Expression,
        value: i => {
          const { Expression } = i;
          return this.renderExpression(Expression, context);
        }
      },
    ])(innerHtmlTypes)
  }

  /**
   * emptyTag => DomBuilder
   */
  renderEmptyTag(emptyTag) {
    const { tag, Attrs } = emptyTag;
    const container = buildDom(tag);
    const attributes = Attrs.attributes;
    attributes.forEach(({ attributeName, attributeValue }) => container.attr(attributeName, attributeValue));
    return container;
  }

  /**
   * commentTag => DomBuilder
   */
  renderCommentTag(commentTag) {
    return buildDom();
  }

  renderNablaText(text) {
    const { left: Expression } = parseExpression(tokenizer(stream(text)));
    if (Expression.expressions.length > 0) {
      return this.renderExpression(Expression);
    }
    const Document = parse(text);
    if (Document.paragraphs.length > 0) {
      return this.renderDocument(Document);
    }
    return buildDom("span").inner(text);
  }

}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

/**
 * Array<Render> => Render
 */
export function composeRender(...classes) {
  const prodClass = class extends Render { }
  classes.forEach(cl => {
    Object.getOwnPropertyNames(cl.prototype)
      .filter(x => x !== "constructor")
      .forEach(k => {
        prodClass.prototype[k] = cl.prototype[k];
      });
  });
  return prodClass;
}

function createIdFromExpression(expression) {
  return innerHTMLToInnerText(
    expression.toString()
  )
    .trim()
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace(/-+/g, '-');
}

function getLinkData(link, context) {
  const { links } = context;
  return returnOne([
    {
      predicate: l => !!l.AnonLink,
      value: l => ({
        link: l.AnonLink.link,
        LinkExpression: l.AnonLink.LinkExpression
      })
    },
    {
      predicate: l => !!l.LinkRef && links.id2link[l.LinkRef.id],
      value: l => {
        const { LinkExpression, id } = l.LinkRef;
        return {
          link: links.id2link[id],
          LinkExpression
        }
      }
    },
    {
      predicate: l => !!l.LinkRef,
      value: l => {
        const { LinkExpression, id } = l.LinkRef;
        return {
          refId: id,
          LinkExpression
        }
      }
    }
  ])(link);
}

/**
 * ast: Abstract syntax tree 
 * returns {links, finalActions, footnotes, ast} 
 */
function createContext(ast) {
  return {
    links: {
      id2dom: {},
      id2link: {}
    },
    finalActions: [],
    footnotes: {
      id2dom: {},
      id2label: {},
      idCounter: 0,
      dombuilder: null
    },
    ast
  }
}

function isEmptyParagraph(paragraph) {
  const { Statement } = paragraph;
  if (Statement) {
    const { Expression } = Statement;
    return Expression && Expression.expressions.length === 0;
  }
  return false;
}