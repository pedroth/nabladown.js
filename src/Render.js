import { buildDom } from "./DomBuilder";
import { tokenizer } from "./Lexer";
import { parse, parseExpression } from "./Parser";
import {
  asyncForEach,
  evalScriptTag,
  returnOne,
  or,
  stream
} from "./Utils";

//========================================================================================
/*                                                                                      *
 *                                        RENDER                                        *
 *                                                                                      */
//========================================================================================

/**
 * render: Abstract syntactic tree (AST) => HTML
 */
export function render(tree) {
  return new Render().render(tree);
}

/**
 * render: Abstract syntactic tree (AST) => DomBuilder
 */
export function abstractRender(tree) {
  return new Render().abstractRender(tree);
}

export class Render {
  /**
   * AST => HTML
   */
  render(tree) {
    return this.renderDocument(tree).build();
  }

  /**
   * AST => DomBuilder
   */
  abstractRender(tree) {
    return this.renderDocument(tree);
  }

  /**
   * document => DomBuilder
   */
  renderDocument(document) {
    const { paragraphs } = document;
    const documentContainer = buildDom("main");
    paragraphs.map(p => documentContainer.appendChild(this.renderParagraph(p)));
    return documentContainer;
  }

  /**
   * paragraph => DomBuilder
   */
  renderParagraph(paragraph) {
    const { Statement } = paragraph;
    const dom = buildDom("p");
    dom.appendChild(this.renderStatement(Statement))
    return dom;
  }

  /**
   * statement => DomBuilder
   */
  renderStatement(statement) {
    return returnOne([
      { predicate: s => !!s.Title, value: s => this.renderTitle(s.Title) },
      { predicate: s => !!s.List, value: s => this.renderList(s.List) },
      { predicate: s => !!s.MediaRefDef, value: s => this.renderMediaRefDef(s.MediaRefDef) },
      { predicate: s => !!s.FootnoteDef, value: s => this.renderFootnoteDef(s.FootnoteDef) },
      { predicate: s => !!s.LinkRefDef, value: s => this.renderLinkRefDef(s.LinkRefDef) },
      { predicate: s => !!s.Break, value: s => this.renderBreak(s.Break) },
      { predicate: s => !!s.Expression, value: s => this.renderExpression(s.Expression) }
    ])(statement);
  }

  /**
   * title => DomBuilder
   */
  renderTitle(title) {
    const { level, Expression } = title;
    const header = buildDom(`h${level}`);
    const expressionHTML = this.renderExpression(Expression);
    header.appendChild(expressionHTML);
    return header;
  }



  /**
   * expression => DomBuilder
   */
  renderExpression(expression) {
    const { expressions } = expression;
    const container = buildDom('span');
    expressions.forEach(expr => container.appendChild(this.renderExpressionType(expr)));
    return container;
  }

  /**
   * expressionType => DomBuilder
   */
  renderExpressionType(expressionType) {
    return returnOne([
      { predicate: t => !!t.Formula, value: t => this.renderFormula(t.Formula) },
      { predicate: t => !!t.Code, value: t => this.renderCode(t.Code) },
      { predicate: t => !!t.Link, value: t => this.renderLink(t.Link) },
      { predicate: t => !!t.Footnote, value: t => this.renderFootnote(t.Footnote) },
      { predicate: t => !!t.Media, value: t => this.renderMedia(t.Media) },
      { predicate: t => !!t.Italic, value: t => this.renderItalic(t.Italic) },
      { predicate: t => !!t.Bold, value: t => this.renderBold(t.Bold) },
      { predicate: t => !!t.Html, value: t => this.renderHtml(t.Html) },
      { predicate: t => !!t.Custom, value: t => this.renderCustom(t.Custom) },
      { predicate: t => !!t.SingleBut, value: t => this.renderSingleBut(t.SingleBut) },
      { predicate: t => !!t.Text, value: t => this.renderText(t.Text) },
    ])(expressionType);
  }

  /**
   * formula => DomBuilder
   */
  renderFormula(formula) {
    const { equation } = formula;
    const container = buildDom("span");
    container.inner(equation);
    return container;
  }

  /**
   * anyBut => DomBuilder
   */
  renderAnyBut(anyBut) {
    const { textArray } = anyBut;
    const container = buildDom("p");
    container.inner(textArray.join(""));
    return container;
  }

  /**
   * code => DomBuilder
   */
  renderCode(code) {
    return returnOne([
      {
        predicate: c => !!c.LineCode,
        value: c => this.renderLineCode(c.LineCode)
      },
      {
        predicate: c => !!c.BlockCode,
        value: c => this.renderBlockCode(c.BlockCode)
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
    codeTag.inner(code);
    container.appendChild(codeTag);
    return container;
  }

  /**
   * link => DomBuilder
   */
  renderLink(link) {
    return returnOne([
      {
        predicate: l => !!l.AnonLink,
        value: l => this.renderAnonLink(l.AnonLink)
      },
      {
        predicate: l => !!l.LinkRef,
        value: l => this.renderLinkRef(l.LinkRef)
      }
    ])(link)
  }

  /**
   * anonLink => DomBuilder
   */
  renderAnonLink(anonLink) {
    const { LinkExpression, link: hyperlink } = anonLink;
    const container = buildDom("a");
    container.attr("href", hyperlink);
    hyperlink.includes("http") && container.attr("target", "_blank");
    // renderExpression is used instead of renderLinkExpression
    const childStatement = this.renderLinkExpression(LinkExpression);
    container.appendChild(childStatement);
    return container;
  }

  /**
   * linkExpression => DomBuilder
   */
  renderLinkExpression(linkExpression) {
    return this.renderExpression(linkExpression)
  }

  /**
   * linkRef => DomBuilder
   */
  renderLinkRef(linkRef) {
    const div = buildDom("div");
    div.inner("linkRef:" + JSON.stringify(linkRef));
    return div;
  }

  /**
   * linkRefDef => DomBuilder
   */
  renderLinkRefDef(linkRefDef) {
    const div = buildDom("div");
    div.inner("LinkRefDef" + JSON.stringify(linkRefDef));
    return div;
  }

  /**
   * footnote => DomBuilder
   */
  renderFootnote() {
    const div = buildDom("div");
    div.inner("Footnote");
    return div;
  }

  /**
   * footnoteDef => DomBuilder
   */
  renderFootnoteDef(renderFootnoteDef) {
    const div = buildDom("div");
    div.inner("FootnoteDef" + JSON.stringify(renderFootnoteDef));
    return div;
  }

  /**
   * italic => DomBuilder
   */
  renderItalic(italic) {
    const { ItalicExpression } = italic;
    const container = buildDom("em");
    container.appendChild(this.renderItalicExpression(ItalicExpression));
    return container;
  }

  /**
   * italicExpression => DomBuilders
   */
  renderItalicExpression(italicExpression) {
    return this.renderExpression(italicExpression);
  }

  /**
   * bold => DomBuilder
   */
  renderBold(bold) {
    const { BoldExpression } = bold;
    const container = buildDom("strong");
    container.appendChild(this.renderBoldExpression(BoldExpression));
    return container;
  }

  /**
   * boldExpression => DomBuilders
   */
  renderBoldExpression(boldExpression) {
    return this.renderExpression(boldExpression);
  }

  /**
   * media => DomBuilder
   */
  renderMedia(media) {
    const { Link } = media;
    const { LinkExpression, link } = getLinkData(Link);
    const container = buildDom("div");
    container.attr(
      "style", "text-align:center;"
    );
    const mediaElem = this.getMediaElementFromSrc(link);
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(mediaElem);
    container.appendChild(childStatement);
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
      this.getEmbeddedPredicateValue()
    ], defaultAction)(src);
  }

  getVideoPredicateValue() {
    return {
      predicate: src => [".mp4", ".ogg", ".avi"].some(e => src.includes(e)),
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
    return {
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
        frame.attr(
          "allow",
          "fullscreen; clipboard-write; encrypted-media; picture-in-picture"
        );
        return frame;
      }
    };
  }

  /**
   * mediaRefDef => DomBuilder
   */
  renderMediaRefDef(mediaRefDef) {
    const div = buildDom("div");
    div.inner("MediaRefDef" + JSON.stringify(mediaRefDef));
    return div;
  }

  /**
   * custom => DomBuilder
   */
  renderCustom(custom) {
    const div = buildDom("div");
    div.inner("Custom" + JSON.stringify(custom));
    return div;
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
   * list => DomBuilder
   */
  renderList(list) {
    return returnOne([
      { predicate: l => !!l.UList, value: l => this.renderUList(l.UList) },
      { predicate: l => !!l.OList, value: l => this.renderOList(l.OList) }
    ])(list);
  }

  /**
   * ulist => DomBuilder
   */
  renderUList(ulist) {
    const container = buildDom("ul");
    const { list } = ulist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }

  /**
   * olist => DomBuilder
   */
  renderOList(olist) {
    const container = buildDom("ol");
    const { list } = olist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }

  /**
   * listItem => DomBuilder
   */
  renderListItem({ Expression, children }) {
    const expression = this.renderExpression(Expression);
    const li = buildDom("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(
        this.renderList(children)
      );
    }
    return li;
  }

  /**
   * break => DomBuilder
   */
  renderBreak(breakEl) {
    const div = buildDom("div");
    div.inner("Break" + JSON.stringify(breakEl));
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
   * html => DomBuilder
  */
  renderHtml(html) {
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
          return returnOne([
            {
              predicate: innerHtml => {
                const { innerHtmls } = innerHtml;
                const [first] = innerHtmls;
                return tag === "style" && first?.text !== undefined
              },
              value: innerHtml => {
                const { innerHtmls } = innerHtml;
                const [first] = innerHtmls;
                container.inner(first.text)
                return container;
              }
            },
            {
              predicate: _ => tag === "script",
              value: innerHtml => {
                const { innerHtmls } = innerHtml;
                const [first] = innerHtmls;
                const scriptText = first.text;
                const attrsMap = container.getAttrs();
                // eval src from script
                if (
                  Object.entries(attrsMap).length !== 0 &&
                  !!attrsMap["src"]
                ) {
                  container.lazy(
                    () => fetch(attrsMap["src"])
                      .then(code => code.text())
                      .then(code => {
                        eval(code);
                      })
                  );
                }
                // eval scriptText from script
                if (scriptText !== "") {
                  container.inner(scriptText);
                  container.lazy(() => new Promise((re) => {
                    setTimeout(() => {
                      eval(scriptText)
                      re(true)
                    }, 1000);
                  }));
                }
                return container;
              }
            },
          ], () => {
            const innerHtmldomBuilder = this.renderInnerHtml(InnerHtml);
            innerHtmldomBuilder
              .getChildren()
              .filter(child => !child.isEmpty())
              .forEach(child => {
                container.appendChild(child)
              });
            return container;
          })(InnerHtml)
        }
      },
      {
        predicate: h => !!h.EmptyTag,
        value: h => this.renderEmptyTag(h.EmptyTag)
      }
    ])(html);
  }

  /**
   * innerHtml => DomBuilder
   */
  renderInnerHtml(innerHtml) {
    const { innerHtmls } = innerHtml;
    const container = buildDom("div");
    innerHtmls
      .forEach(innerHtmlTypes =>
        container.appendChild(
          this.renderInnerHtmlTypes(innerHtmlTypes)
        )
      );
    return container;
  }

  renderInnerHtmlTypes(innerHtmlTypes) {
    return returnOne([
      {
        predicate: i => !!i.Html,
        value: i => {
          const { Html } = i;
          return this.renderHtml(Html)
        }
      },
      {
        predicate: i => !!i.text,
        value: i => {
          const { text } = i;
          return this.renderNablaText(text);
        },
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
  const prodClass = class extends Render { };
  classes.forEach(cl => {
    Object.getOwnPropertyNames(cl.prototype)
      .filter(x => x !== "constructor")
      .forEach(k => {
        prodClass.prototype[k] = cl.prototype[k];
      });
  });
  return prodClass;
}

function getLinkData(link) {
  return returnOne([
    {
      predicate: l => !!l.AnonLink,
      value: l => ({
        link: l.AnonLink.link,
        LinkExpression: l.AnonLink.LinkExpression
      })
    },
    {
      predicate: l => !!l.LinkRef,
      value: l => ({
        link: "https://pedroth.github.io/",
        LinkExpression: { expressons: [] }
      })
    }
  ])(link);
}

function createIdFromHTML(html) {
  const id = html.innerText;
  id.replace(" ", "-");
  return id;
}