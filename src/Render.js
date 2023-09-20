import { buildDom } from "./DomBuilder";
import {
  asyncForEach,
  evalScriptTag,
  returnOne,
  isParagraph,
  or
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
   * footnote => DomBuilder
   */
  renderFootnote() {
    const div = buildDom("div");
    div.inner("Footnote");
    return div;
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
   * formula => DomBuilder
   */
  renderFormula(formula) {
    const { equation } = formula;
    const container = buildDom("span");
    container.inner(equation);
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
   * text => DomBuilder
   */
  renderText(text) {
    const { text: txt } = text;
    const container = buildDom("span");
    container.inner(txt);
    return container;
  }

  /**
   * italic => DomBuilder
   */
  renderItalic(italic) {
    const { ItalicType } = italic;
    const container = buildDom("em");
    container.appendChild(this.renderItalicType(ItalicType));
    return container;
  }

  /**
   * italicType => DomBuilder
   */
  renderItalicType(italicType) {
    return returnOne([
      { predicate: b => !!b.Text, value: b => this.renderText(b.Text) },
      { predicate: b => !!b.Bold, value: b => this.renderBold(b.Italic) },
      { predicate: b => !!b.Link, value: b => this.renderLink(b.Link) }
    ])(italicType)
  }


  /**
   * bold => DomBuilder
   */
  renderBold(bold) {
    const { BoldType } = bold;
    const container = buildDom("strong");
    container.appendChild(this.renderBoldType(BoldType));
    return container;
  }

  /**
   * boldType => DomBuilder
   */
  renderBoldType(boldType) {
    return returnOne([
      { predicate: b => !!b.Text, value: b => this.renderText(b.Text) },
      { predicate: b => !!b.Italic, value: b => this.renderItalic(b.Italic) },
      { predicate: b => !!b.Link, value: b => this.renderLink(b.Link) }
    ])(boldType)
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
   * singleBut => DomBuilder
   */
  renderSingleBut(singleBut) {
    const { text } = singleBut;
    const container = buildDom("span");
    container.inner(text);
    return container;
  }

  /**
   * innerHtml => DomBuilder
   */
  renderInnerHtml(innerHtml) {
    return returnOne([
      { predicate: i => !!i.Html, value: i => this.renderHtml(i.Html) },
      { predicate: i => !!i.Document, value: i => this.renderDocument(i.Document) },
      { predicate: i => !!i.Expression, value: i => this.renderExpression(i.Expression) }
    ])(innerHtml)
  }

  /**
   * html => DomBuilder
   */
  renderHtml(html) {
    const { StartTag, InnerHtml, EndTag } = html;
    if (StartTag.tag.text !== EndTag.tag.text) {
      const container = buildDom("tag");
      container.inner(`startTag and endTag are not the same, ${StartTag.tag.text} !== ${EndTag.tag}`);
      return container;
    }
    const container = buildDom(StartTag.tag);
    const attributes = StartTag.Attrs.attributes;
    attributes.forEach(({ attributeName, attributeValue }) => container.attr(attributeName, attributeValue));
    const innerHtmldomBuilder = this.renderInnerHtml(InnerHtml);
    container.appendChild(innerHtmldomBuilder);
    // const scripts = Array.from(container.getElementsByTagName("script"));
    // const asyncLambdas = scripts.map(script => () => evalScriptTag(script));
    // asyncForEach(asyncLambdas);
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
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(childStatement);
    return container;
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
   * linkTypes => DomBuilder
   */
  renderLinkTypes(linkTypes) {
    return this.renderExpressionType(linkTypes);
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
   * footnoteDef => DomBuilder
   */
  renderFootnoteDef(renderFootnoteDef) {
    const div = buildDom("div");
    div.inner("FootnoteDef" + JSON.stringify(renderFootnoteDef));
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
   * break => DomBuilder
   */
  renderBreak(breakEl) {
    const div = buildDom("div");
    div.inner("Break" + JSON.stringify(breakEl));
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