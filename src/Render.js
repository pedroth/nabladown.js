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
 * render: Abstract syntactic tree => HTML
 * @param {*} tree
 * @returns HTML object
 *
 */
export function render(tree) {
  return new Render().render(tree);
}

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

export class Render {
  /**
   * Abstract syntactic tree => HTML
   */
  render(tree) {
    const paragraphs = this.renderDocument(tree);
    const body = document.createElement("main");
    paragraphs.forEach(e => body.appendChild(e));
    return body;
  }

  /**
   * document => [HTML]
   */
  renderDocument({ paragraphs }) {
    return paragraphs.map(p => this.renderParagraph(p));
  }

  /**
   * paragraph => HTML
   */
  renderParagraph({ Statement }) {
    const paragraph = document.createElement("p");
    paragraph.appendChild(this.renderStatement(Statement))
    return paragraph;
  }

  /**
   * statement => HTML
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
     * expression => HTML
     * @param {expression} expression
     */
  renderExpression({ expressions }) {
    const container = document.createElement('span');
    expressions.forEach(expression => container.appendChild(this.renderExpressionType(expression)));
    return container;
  }

  /**
   * expressionType => HTML
   *
   * @param {expressionType} expressionType
   */
  renderExpressionType(expressionType) {
    return returnOne([
      {
        predicate: t => !!t.Formula,
        value: t => this.renderFormula(t.Formula)
      },
      { predicate: t => !!t.Code, value: t => this.renderCode(t.Code) },
      { predicate: t => !!t.Link, value: t => this.renderLink(t.Link) },
      { predicate: t => !!t.Footnote, value: t => this.renderFootnote(t.Footnote) },
      { predicate: t => !!t.Media, value: t => this.renderMedia(t.Media) },
      { predicate: t => !!t.Italic, value: t => this.renderItalic(t.Italic) },
      { predicate: t => !!t.Bold, value: t => this.renderBold(t.Bold) },
      { predicate: t => !!t.Exec, value: t => this.renderExec(t.Exec) },
      { predicate: t => !!t.Custom, value: t => this.renderCustom(t.Custom) },
      { predicate: t => !!t.SingleBut, value: t => this.renderSingleBut(t.SingleBut) },
      { predicate: t => !!t.Text, value: t => this.renderText(t.Text) },
    ])(expressionType);
  }

  renderFootnote() {
    const div = document.createElement("div");
    div.innerText = "Footnote";
    return div;
  }


  /**
   * title => HTML
   */
  renderTitle(title) {
    const { level, Expression } = title;
    const header = document.createElement(`h${level}`);
    const expressionHTML = this.renderExpression(Expression);
    header.appendChild(expressionHTML);
    return header;
  }

  /**
   * formula => HTML
   * @param {formula} formula
   */
  renderFormula(formula) {
    const { equation } = formula;
    let container = document.createElement("span");
    container.innerHTML = equation;
    return container;
  }

  /**
   * code => HTML
   * @param {*} code
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
   * lineCode => HTML
   * @param {*} lineCode
   */
  renderLineCode(lineCode) {
    const { code } = lineCode;
    const container = document.createElement("code");
    container.innerText = code;
    return container;
  }

  /**
   * blockCode => HTML
   * @param {*} blockCode
   */
  renderBlockCode(blockCode) {
    const { code, language } = blockCode;
    const lang = language === "" ? "plaintext" : language;
    const container = document.createElement("pre");
    const codeTag = document.createElement("code");
    codeTag.setAttribute("class", `language-${lang}`);
    codeTag.innerText = code;
    container.appendChild(codeTag);
    return container;
  }

  /**
   * list => HTML
   */
  renderList(list) {
    return returnOne([
      { predicate: l => !!l.UList, value: l => this.renderUList(l.UList) },
      { predicate: l => !!l.OList, value: l => this.renderOList(l.OList) }
    ])(list);
  }

  renderUList(ulist) {
    const container = document.createElement("ul");
    const { list } = ulist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }

  renderOList(olist) {
    const container = document.createElement("ol");
    const { list } = olist;
    list.map(listItem => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }

  /**
   * listItem => HTML
   * @param {*} listItem
   */
  renderListItem({ Expression, children }) {
    const expression = this.renderExpression(Expression);
    const li = document.createElement("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(
        this.renderList(children)
      );
    }
    return li;
  }

  /**
   * text => HTML
   * @param {*} text
   */
  renderText(text) {
    const { text: txt } = text;
    const container = document.createElement("span");
    container.innerHTML = txt;
    return container;
  }

  /**
   * italic => HTML
   * @param {*} italic
   */
  renderItalic(italic) {
    const { ItalicType } = italic;
    const container = document.createElement("em");
    container.appendChild(this.renderItalicType(ItalicType));
    return container;
  }

  renderItalicType(italicType) {
    return returnOne([
      { predicate: b => !!b.Text, value: b => this.renderText(b.Text) },
      { predicate: b => !!b.Bold, value: b => this.renderBold(b.Italic) },
      { predicate: b => !!b.Link, value: b => this.renderLink(b.Link) }
    ])(italicType)
  }


  /**
   * bold => HTML
   * @param {*} bold
   */
  renderBold(bold) {
    const { BoldType } = bold;
    const container = document.createElement("strong");
    container.appendChild(this.renderBoldType(BoldType));
    return container;
  }

  renderBoldType(boldType) {
    return returnOne([
      { predicate: b => !!b.Text, value: b => this.renderText(b.Text) },
      { predicate: b => !!b.Italic, value: b => this.renderItalic(b.Italic) },
      { predicate: b => !!b.Link, value: b => this.renderLink(b.Link) }
    ])(boldType)
  }

  /**
   * anyBut => HTML
   * @param {*} anyBut
   */
  renderAnyBut(anyBut) {
    const { textArray } = anyBut;
    const container = document.createElement("p");
    container.innerHTML = textArray.join("");
    return container;
  }


  renderSingleBut(singleBut) {
    const { text } = singleBut;
    const container = document.createElement("span");
    container.innerHTML = text;
    return container;
  }



  /**
   * html => HTML
   * @param {*} html
   */
  renderHtml(html) {
    const { html: innerHtml } = html;
    const container = document.createElement("div");
    container.innerHTML = innerHtml;
    const scripts = Array.from(container.getElementsByTagName("script"));
    const asyncLambdas = scripts.map(script => () => evalScriptTag(script));
    asyncForEach(asyncLambdas);
    return container;
  }


  /**
   * link => HTML
   * @param {*} link
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

  renderAnonLink(anonLink) {
    const { LinkExpression, link: hyperlink } = anonLink;
    const container = document.createElement("a");
    container.setAttribute("href", hyperlink);
    hyperlink.includes("http") && container.setAttribute("target", "_blank");
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(childStatement);
    return container;
  }



  renderLinkRef(linkRef) {
    const div = document.createElement("div");
    div.innerText = "linkRef:" + JSON.stringify(linkRef);
    return div;
  }

  /**
   * media => HTML
   * @param {*} media
   */
  renderMedia(media) {
    const { Link } = media;
    const { LinkExpression, link } = getLinkData(Link);
    const container = document.createElement("div");
    container.setAttribute(
      "style", "text-align:center;"
    );
    const mediaElem = this.getMediaElementFromSrc(link);
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(mediaElem);
    container.appendChild(childStatement);
    return container;
  }

  /**
   * src:string => HTML
   *
   * @param {*} src
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
        const video = document.createElement("video");
        video.setAttribute("src", src);
        video.setAttribute("controls", "");
        return video;
      }
    };
  }

  getAudioPredicateValue() {
    return {
      predicate: src => [".mp3", ".ogg", ".wav"].some(e => src.includes(e)),
      value: src => {
        const audio = document.createElement("audio");
        audio.setAttribute("src", src);
        audio.setAttribute("controls", "");
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
        const img = document.createElement("img");
        img.setAttribute("src", src);
        return img;
      }
    };
  }

  getEmbeddedPredicateValue() {
    return {
      predicate: src => [".youtube.com", "youtu.be"].some(e => src.includes(e)),
      value: src => {
        const frame = document.createElement("iframe");
        const videoId = or(
          () => {
            return src.split("v=")[1].split("&")[0];
          },
          () => {
            return src.split(".be/")[1];
          }
        );
        frame.setAttribute(
          "src",
          "https://www.youtube-nocookie.com/embed/" + videoId
        );
        frame.setAttribute("frameborder", 0);
        frame.setAttribute("height", "315");
        frame.setAttribute(
          "allow",
          "fullscreen; clipboard-write; encrypted-media; picture-in-picture"
        );
        return frame;
      }
    };
  }

  /**
   * linkStat => HTML
   * @param {*} linkStat
   */
  renderLinkStat(linkStat) {
    const container = document.createElement("span");
    const seqArray = this.renderAuxLinkStat(linkStat);
    seqArray.forEach(seqContainer => {
      if (isParagraph(seqContainer))
        container.innerHTML += seqContainer.innerText;
      else container.appendChild(seqContainer);
    });
    return container;
  }

  renderAuxLinkStat(linkStat) {
    if (linkStat.isEmpty) return [];
    const linkTypeDiv = this.renderLinkTypes(linkStat.LinkType);
    const linkStatDivArray = this.renderAuxLinkStat(linkStat.LinkStat);
    return [linkTypeDiv, ...linkStatDivArray];
  }

  /**
   * linkTypes => HTML
   * @param {*} linkTypes
   */
  renderLinkTypes(linkTypes) {
    return returnOne([
      { predicate: l => !!l.AnyBut, value: l => this.renderAnyBut(l.AnyBut) },
      {
        predicate: l => !!l.Formula,
        value: l => this.renderFormula(l.Formula)
      },
      { predicate: l => !!l.Code, value: l => this.renderCode(l.Code) },
      { predicate: l => !!l.Html, value: l => this.renderHtml(l.Html) },
      { predicate: l => !!l.Italic, value: l => this.renderItalic(l.Italic) },
      { predicate: l => !!l.Bold, value: l => this.renderBold(l.Bold) },
      { predicate: l => !!l.Single, value: l => this.renderSingle(l.Single) }
    ])(linkTypes);
  }

  /**
   * single => HTML
   * @param {*} single
   */
  renderSingle(single) {
    return this.renderText(single);
  }

  renderMediaRefDef(mediaRefDef) {
    const div = document.createElement("div");
    div.innerText = "MediaRefDef" + JSON.stringify(mediaRefDef);
    return div;
  }

  renderFootnoteDef(renderFootnoteDef) {
    const div = document.createElement("div");
    div.innerText = "FootnoteDef" + JSON.stringify(renderFootnoteDef);
    return div;
  }

  renderLinkRefDef(linkRefDef) {
    const div = document.createElement("div");
    div.innerText = "LinkRefDef" + JSON.stringify(linkRefDef);
    return div;
  }

  renderBreak(breakEl) {
    const div = document.createElement("div");
    div.innerText = "Break" + JSON.stringify(breakEl);
    return div;
  }



  renderCustom(custom) {
    const div = document.createElement("div");
    div.innerText = "Custom" + JSON.stringify(custom);
    return div;
  }

}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


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