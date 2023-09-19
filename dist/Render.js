var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../node_modu
function pair(a, b) {
  return { left: a, right: b };
}
function stream(stringOrArray) {
  const array = [...stringOrArray];
  return {
    next: () => stream(array.slice(1)),
    take: (n) => stream(array.slice(n)),
    peek: () => array[0],
    hasNext: () => array.length > 1,
    isEmpty: () => array.length === 0,
    toString: () => array.map((s) => typeof s === "string" ? s : JSON.stringify(s)).join(""),
    filter: (predicate) => stream(array.filter(predicate)),
    log: () => {
      let s = stream(array);
      while (s.hasNext()) {
        console.log(s.peek());
        s = s.next();
      }
    }
  };
}
function eatSymbol(n, symbolPredicate) {
  return function(stream2) {
    if (n === 0)
      return stream2;
    if (symbolPredicate(stream2)) {
      return eatSymbol(n - 1, symbolPredicate)(stream2.next());
    }
    throw new Error(`Caught error while eating ${n} symbols`, stream2.toString());
  };
}
function eatSpaces(tokenStream) {
  let s = tokenStream;
  if (s.peek().type !== " ")
    return s;
  while (s.peek().type === " ")
    s = s.next();
  return s;
}
function or(...rules) {
  let accError = null;
  for (let i = 0;i < rules.length; i++) {
    try {
      return rules[i]();
    } catch (error) {
      accError = error;
    }
  }
  throw accError;
}
function returnOne(listOfPredicates, lazyDefaultValue = createDefaultEl) {
  return (input) => {
    for (let i = 0;i < listOfPredicates.length; i++) {
      if (listOfPredicates[i].predicate(input))
        return listOfPredicates[i].value(input);
    }
    return lazyDefaultValue(input);
  };
}
function isParagraph(domNode) {
  return domNode.constructor.name === "HTMLParagraphElement";
}
function createDefaultEl() {
  const defaultDiv = document.createElement("div");
  defaultDiv.innerText = "This could be a bug!!";
  return defaultDiv;
}
function success(x) {
  return {
    filter: (p) => {
      if (p(x))
        return success(x);
      return fail();
    },
    map: (t) => {
      return success(t(x));
    },
    actual: () => x
  };
}
function fail() {
  const monad = {};
  monad.filter = () => monad;
  monad.map = () => monad;
  monad.actual = (lazyError) => lazyError();
  return monad;
}
function isAlpha(str) {
  const charCode = str.charCodeAt(0);
  return charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}
function isAlphaNumeric(str) {
  const charCode = str.charCodeAt(0);
  return charCode >= 48 && charCode <= 57 || charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}

class MultiMap {
  constructor() {
    this.map = {};
  }
  put(key, value) {
    if (!this.map[key])
      this.map[key] = [];
    this.map[key].push(value);
  }
  get(key) {
    const value = this.map[key];
    return value;
  }
}

// ../node_modul
function render(tree) {
  return new Render().render(tree);
}
function composeRender(...classes) {
  const prodClass = class extends Render {
  };
  classes.forEach((cl) => {
    Object.getOwnPropertyNames(cl.prototype).filter((x) => x !== "constructor").forEach((k) => {
      prodClass.prototype[k] = cl.prototype[k];
    });
  });
  return prodClass;
}
var getLinkData = function(link) {
  return returnOne([
    {
      predicate: (l) => !!l.AnonLink,
      value: (l) => ({
        link: l.AnonLink.link,
        LinkExpression: l.AnonLink.LinkExpression
      })
    },
    {
      predicate: (l) => !!l.LinkRef,
      value: (l) => ({
        link: "https://pedroth.github.io/",
        LinkExpression: { expressons: [] }
      })
    }
  ])(link);
};

class Render {
  render(tree) {
    return this.renderDocument(tree);
  }
  renderDocument({ paragraphs }) {
    console.log("debug: renderDocument");
    const documentContainer = document.createElement("main");
    paragraphs.map((p) => documentContainer.appendChild(this.renderParagraph(p)));
    return documentContainer;
  }
  renderParagraph({ Statement }) {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = this.renderStatement(Statement).innerHTML;
    return paragraph;
  }
  renderStatement(statement) {
    return returnOne([
      { predicate: (s) => !!s.Title, value: (s) => this.renderTitle(s.Title) },
      { predicate: (s) => !!s.List, value: (s) => this.renderList(s.List) },
      { predicate: (s) => !!s.MediaRefDef, value: (s) => this.renderMediaRefDef(s.MediaRefDef) },
      { predicate: (s) => !!s.FootnoteDef, value: (s) => this.renderFootnoteDef(s.FootnoteDef) },
      { predicate: (s) => !!s.LinkRefDef, value: (s) => this.renderLinkRefDef(s.LinkRefDef) },
      { predicate: (s) => !!s.Break, value: (s) => this.renderBreak(s.Break) },
      { predicate: (s) => !!s.Expression, value: (s) => this.renderExpression(s.Expression) }
    ])(statement);
  }
  renderExpression({ expressions }) {
    console.log("debug: renderExpression");
    const container = document.createElement("span");
    expressions.forEach((expression) => container.appendChild(this.renderExpressionType(expression)));
    return container;
  }
  renderExpressionType(expressionType) {
    return returnOne([
      {
        predicate: (t) => !!t.Formula,
        value: (t) => this.renderFormula(t.Formula)
      },
      { predicate: (t) => !!t.Code, value: (t) => this.renderCode(t.Code) },
      { predicate: (t) => !!t.Link, value: (t) => this.renderLink(t.Link) },
      { predicate: (t) => !!t.Footnote, value: (t) => this.renderFootnote(t.Footnote) },
      { predicate: (t) => !!t.Media, value: (t) => this.renderMedia(t.Media) },
      { predicate: (t) => !!t.Italic, value: (t) => this.renderItalic(t.Italic) },
      { predicate: (t) => !!t.Bold, value: (t) => this.renderBold(t.Bold) },
      { predicate: (t) => !!t.Html, value: (t) => this.renderHtml(t.Html) },
      { predicate: (t) => !!t.Custom, value: (t) => this.renderCustom(t.Custom) },
      { predicate: (t) => !!t.SingleBut, value: (t) => this.renderSingleBut(t.SingleBut) },
      { predicate: (t) => !!t.Text, value: (t) => this.renderText(t.Text) }
    ])(expressionType);
  }
  renderFootnote() {
    const div = document.createElement("div");
    div.innerText = "Footnote";
    return div;
  }
  renderTitle(title) {
    const { level, Expression } = title;
    const header = document.createElement(`h${level}`);
    const expressionHTML = this.renderExpression(Expression);
    header.appendChild(expressionHTML);
    return header;
  }
  renderFormula(formula) {
    const { equation } = formula;
    let container = document.createElement("span");
    container.innerHTML = equation;
    return container;
  }
  renderCode(code) {
    return returnOne([
      {
        predicate: (c) => !!c.LineCode,
        value: (c) => this.renderLineCode(c.LineCode)
      },
      {
        predicate: (c) => !!c.BlockCode,
        value: (c) => this.renderBlockCode(c.BlockCode)
      }
    ])(code);
  }
  renderLineCode(lineCode) {
    const { code } = lineCode;
    const container = document.createElement("code");
    container.innerText = code;
    return container;
  }
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
  renderList(list) {
    return returnOne([
      { predicate: (l) => !!l.UList, value: (l) => this.renderUList(l.UList) },
      { predicate: (l) => !!l.OList, value: (l) => this.renderOList(l.OList) }
    ])(list);
  }
  renderUList(ulist) {
    const container = document.createElement("ul");
    const { list } = ulist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }
  renderOList(olist) {
    const container = document.createElement("ol");
    const { list } = olist;
    list.map((listItem) => {
      container.appendChild(this.renderListItem(listItem));
    });
    return container;
  }
  renderListItem({ Expression, children }) {
    const expression = this.renderExpression(Expression);
    const li = document.createElement("li");
    li.appendChild(expression);
    if (children) {
      li.appendChild(this.renderList(children));
    }
    return li;
  }
  renderText(text) {
    const { text: txt } = text;
    const container = document.createElement("span");
    container.innerHTML = txt;
    return container;
  }
  renderItalic(italic) {
    const { ItalicType } = italic;
    const container = document.createElement("em");
    container.appendChild(this.renderItalicType(ItalicType));
    return container;
  }
  renderItalicType(italicType) {
    return returnOne([
      { predicate: (b) => !!b.Text, value: (b) => this.renderText(b.Text) },
      { predicate: (b) => !!b.Bold, value: (b) => this.renderBold(b.Italic) },
      { predicate: (b) => !!b.Link, value: (b) => this.renderLink(b.Link) }
    ])(italicType);
  }
  renderBold(bold) {
    const { BoldType } = bold;
    const container = document.createElement("strong");
    container.appendChild(this.renderBoldType(BoldType));
    return container;
  }
  renderBoldType(boldType) {
    return returnOne([
      { predicate: (b) => !!b.Text, value: (b) => this.renderText(b.Text) },
      { predicate: (b) => !!b.Italic, value: (b) => this.renderItalic(b.Italic) },
      { predicate: (b) => !!b.Link, value: (b) => this.renderLink(b.Link) }
    ])(boldType);
  }
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
  renderInnerHtml(innerHtml, container) {
    const DOM = returnOne([
      { predicate: (i) => !!i.Html, value: (i) => this.renderHtml(i.Html) },
      {
        predicate: (i) => !!i.Document,
        value: (i) => {
          const span = document.createElement("span");
          span.innerHTML = this.renderDocument(i.Document).innerHTML;
          return span;
        }
      }
    ])(innerHtml);
    container.appendChild(DOM);
    return container;
  }
  renderHtml(html) {
    const { StartTag, InnerHtml, EndTag } = html;
    if (StartTag.tag.text !== EndTag.tag.text) {
      const container2 = document.createElement("tag");
      container2.innerText = `startTag and endTag are not the same, ${StartTag.tag.text} !== ${EndTag.tag}`;
      return container2;
    }
    const container = document.createElement(StartTag.tag);
    const attributes = StartTag.Attrs.attributes;
    attributes.forEach(({ attributeName, attributeValue }) => container.setAttribute(attributeName, attributeValue));
    const updatedContainer = this.renderInnerHtml(InnerHtml, container);
    return updatedContainer;
  }
  renderLink(link) {
    return returnOne([
      {
        predicate: (l) => !!l.AnonLink,
        value: (l) => this.renderAnonLink(l.AnonLink)
      },
      {
        predicate: (l) => !!l.LinkRef,
        value: (l) => this.renderLinkRef(l.LinkRef)
      }
    ])(link);
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
  renderMedia(media) {
    const { Link } = media;
    const { LinkExpression, link } = getLinkData(Link);
    const container = document.createElement("div");
    container.setAttribute("style", "text-align:center;");
    const mediaElem = this.getMediaElementFromSrc(link);
    const childStatement = this.renderExpression(LinkExpression);
    container.appendChild(mediaElem);
    container.appendChild(childStatement);
    return container;
  }
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
      predicate: (src) => [".mp4", ".ogg", ".avi"].some((e) => src.includes(e)),
      value: (src) => {
        const video = document.createElement("video");
        video.setAttribute("src", src);
        video.setAttribute("controls", "");
        return video;
      }
    };
  }
  getAudioPredicateValue() {
    return {
      predicate: (src) => [".mp3", ".ogg", ".wav"].some((e) => src.includes(e)),
      value: (src) => {
        const audio = document.createElement("audio");
        audio.setAttribute("src", src);
        audio.setAttribute("controls", "");
        return audio;
      }
    };
  }
  getImagePredicateValue() {
    return {
      predicate: (src) => [
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
      ].some((e) => src.includes(e)),
      value: (src) => {
        const img = document.createElement("img");
        img.setAttribute("src", src);
        return img;
      }
    };
  }
  getEmbeddedPredicateValue() {
    return {
      predicate: (src) => [".youtube.com", "youtu.be"].some((e) => src.includes(e)),
      value: (src) => {
        const frame = document.createElement("iframe");
        const videoId = or(() => {
          return src.split("v=")[1].split("&")[0];
        }, () => {
          return src.split(".be/")[1];
        });
        frame.setAttribute("src", "https://www.youtube-nocookie.com/embed/" + videoId);
        frame.setAttribute("frameborder", 0);
        frame.setAttribute("height", "315");
        frame.setAttribute("allow", "fullscreen; clipboard-write; encrypted-media; picture-in-picture");
        return frame;
      }
    };
  }
  renderLinkStat(linkStat) {
    const container = document.createElement("span");
    const seqArray = this.renderAuxLinkStat(linkStat);
    seqArray.forEach((seqContainer) => {
      if (isParagraph(seqContainer))
        container.innerHTML += seqContainer.innerText;
      else
        container.appendChild(seqContainer);
    });
    return container;
  }
  renderAuxLinkStat(linkStat) {
    if (linkStat.isEmpty)
      return [];
    const linkTypeDiv = this.renderLinkTypes(linkStat.LinkType);
    const linkStatDivArray = this.renderAuxLinkStat(linkStat.LinkStat);
    return [linkTypeDiv, ...linkStatDivArray];
  }
  renderLinkTypes(linkTypes) {
    return returnOne([
      { predicate: (l) => !!l.AnyBut, value: (l) => this.renderAnyBut(l.AnyBut) },
      {
        predicate: (l) => !!l.Formula,
        value: (l) => this.renderFormula(l.Formula)
      },
      { predicate: (l) => !!l.Code, value: (l) => this.renderCode(l.Code) },
      { predicate: (l) => !!l.Html, value: (l) => this.renderHtml(l.Html) },
      { predicate: (l) => !!l.Italic, value: (l) => this.renderItalic(l.Italic) },
      { predicate: (l) => !!l.Bold, value: (l) => this.renderBold(l.Bold) },
      { predicate: (l) => !!l.Single, value: (l) => this.renderSingle(l.Single) }
    ])(linkTypes);
  }
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
export {
  render,
  composeRender,
  Render
};
