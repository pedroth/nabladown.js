import katex from "katex";
import { asyncForEach, evalScriptTag, returnOne, isParagraph } from "./Utils";

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
  const listOfExpressions = renderProgram(tree);
  const body = document.createElement("div");
  listOfExpressions.forEach(e => body.appendChild(e));
  return body;
}

export const BaseRender = {
  render,
  renderProgram,
  renderExpression,
  renderStatement,
  renderTitle,
  renderSeq,
  renderSeqTypes,
  renderText,
  renderItalic,
  renderBold,
  renderAnyBut,
  renderCode,
  renderLineCode,
  renderBlockCode,
  renderFormula,
  renderHtml,
  renderLink,
  renderMedia,
  renderLinkStat,
  renderLinkTypes,
  renderSingle
};

//========================================================================================
/*                                                                                      *
 *                                    PRIVATE METHODS                                   *
 *                                                                                      */
//========================================================================================
/**
 *
 * program => [HTML]
 *
 * @param {*} program
 */
function renderProgram(program) {
  if (program.expression === null && program.program === null) return [];
  const expression = renderExpression(program.expression);
  const listOfExpression = renderProgram(program.program);
  return [expression, ...listOfExpression];
}

/**
 *
 * expression => HTML
 *
 * @param {*} expression
 */
function renderExpression(expression) {
  return renderStatement(expression.Statement);
}

/**
 *
 * statement => HTML
 * @param {*} statement
 */
function renderStatement(statement) {
  return returnOne(
    [
      { predicate: s => !!s.Title, value: s => renderTitle(s.Title) },
      { predicate: s => !!s.Seq, value: s => renderSeq(s.Seq) }
    ],
    createDefaultEl()
  )(statement);
}

/**
 * title => HTML
 * @param {*} title
 */
function renderTitle(title) {
  const { level, Seq } = title;
  const header = document.createElement(`h${level}`);
  header.innerHTML = renderSeq(Seq).innerHTML;
  return header;
}

/**
 * seq => HTML
 * @param {*} seq
 */
function renderSeq(seq) {
  const container = document.createElement("p");
  const seqArray = renderAuxSeq(seq);
  seqArray.forEach(seqContainer => {
    if (isParagraph(seqContainer))
      container.innerHTML += seqContainer.innerText;
    else container.appendChild(seqContainer);
  });
  return container;
}

function renderAuxSeq(seq) {
  if (seq.isEmpty) return [];
  const seqTypesDiv = renderSeqTypes(seq.SeqTypes);
  const seqDivArray = renderAuxSeq(seq.Seq);
  return [seqTypesDiv, ...seqDivArray];
}

/**
 * seqTypes => HTML
 *
 * @param {*} seqTypes
 */
function renderSeqTypes(seqTypes) {
  return returnOne(
    [
      { predicate: t => !!t.Text, value: t => renderText(t.Text) },
      { predicate: t => !!t.Formula, value: t => renderFormula(t.Formula) },
      { predicate: t => !!t.Html, value: t => renderHtml(t.Html) },
      { predicate: t => !!t.Code, value: t => renderCode(t.Code) },
      { predicate: t => !!t.Link, value: t => renderLink(t.Link) },
      { predicate: t => !!t.Media, value: t => renderMedia(t.Media) },
      { predicate: t => !!t.Italic, value: t => renderItalic(t.Italic) },
      { predicate: t => !!t.Bold, value: t => renderBold(t.Bold) }
    ],
    createDefaultEl()
  )(seqTypes);
}

/**
 * text => HTML
 * @param {*} text
 */
function renderText(text) {
  const { text: txt } = text;
  const container = document.createElement("p");
  container.innerHTML = txt;
  return container;
}

/**
 * italic => HTML
 * @param {*} italic
 */
function renderItalic(italic) {
  const { SeqTypes } = italic;
  const container = document.createElement("em");
  container.innerHTML = renderSeqTypes(SeqTypes).innerHTML;
  return container;
}

/**
 * bold => HTML
 * @param {*} bold
 */
function renderBold(bold) {
  const { SeqTypes } = bold;
  const container = document.createElement("strong");
  container.innerHTML = renderSeqTypes(SeqTypes).innerHTML;
  return container;
}

/**
 * anyBut => HTML
 * @param {*} anyBut
 */
function renderAnyBut(anyBut) {
  const { textArray } = anyBut;
  const container = document.createElement("p");
  container.innerHTML = textArray.join("");
  return container;
}

/**
 * formula => HTML
 * @param {*} formula
 */
function renderFormula(formula) {
  //must check if katex exist
  const Katex = katex || { render: () => {} };
  const { equation } = formula;
  let container = document.createElement("span");
  Katex.render(equation, container, {
    throwOnError: false,
    displayMode: !formula.isInline
  });
  return container;
}

/**
 * html => HTML
 * @param {*} html
 */
function renderHtml(html) {
  const { html: innerHtml } = html;
  const container = document.createElement("div");
  container.innerHTML = innerHtml;
  const scripts = Array.from(container.getElementsByTagName("script"));
  const asyncLambdas = scripts.map(script => () => evalScriptTag(script));
  asyncForEach(asyncLambdas);
  return container;
}

/**
 * code => HTML
 * @param {*} code
 */
function renderCode(code) {
  return returnOne(
    [
      { predicate: c => !!c.LineCode, value: c => renderLineCode(c.LineCode) },
      {
        predicate: c => !!c.BlockCode,
        value: c => renderBlockCode(c.BlockCode)
      }
    ],
    createDefaultEl()
  )(code);
}

/**
 * lineCode => HTML
 * @param {*} lineCode
 */
function renderLineCode(lineCode) {
  const { code } = lineCode;
  const container = document.createElement("code");
  container.innerText = code;
  return container;
}

/**
 * blockCode => HTML
 * @param {*} blockCode
 */
function renderBlockCode(blockCode) {
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
 * link => HTML
 * @param {*} link
 */
function renderLink(link) {
  const { LinkStat, link: hyperlink } = link;
  const container = document.createElement("a");
  container.setAttribute("href", hyperlink);
  hyperlink.includes("http") && container.setAttribute("target", "_blank");
  const childStatement = renderLinkStat(LinkStat);
  container.appendChild(childStatement);
  return container;
}
/**
 * media => HTML
 * @param {*} media
 */
function renderMedia(media) {
  const { LinkStat, link: src } = media;
  const container = document.createElement("div");
  container.setAttribute(
    "style",
    "display: flex; flex-grow: 1; flex-direction: column"
  );
  const mediaElem = getMediaElementFromSrc(src);
  const childStatement = renderLinkStat(LinkStat);
  container.appendChild(mediaElem);
  container.appendChild(childStatement);
  return container;
}

/**
 * src:string => HTML
 *
 * @param {*} src
 */
function getMediaElementFromSrc(src) {
  return returnOne([
    getVideoPredicateValue(),
    getAudioPredicateValue(),
    getImagePredicateValue(),
    getEmbeddedPredicateValue()
  ])(src);
}

function getVideoPredicateValue() {
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

function getAudioPredicateValue() {
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

function getImagePredicateValue() {
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

function getEmbeddedPredicateValue() {
  return {
    predicate: src => [".youtube.com"].some(e => src.includes(e)),
    value: src => {
      const frame = document.createElement("iframe");
      const [srcLeft, _] = src.split(".com/");
      const [, videoId] = src.split("=");
      frame.setAttribute("src", srcLeft + ".com/embed/" + videoId);
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
function renderLinkStat(linkStat) {
  const container = document.createElement("span");
  const seqArray = renderAuxLinkStat(linkStat);
  seqArray.forEach(seqContainer => {
    if (isParagraph(seqContainer))
      container.innerHTML += seqContainer.innerText;
    else container.appendChild(seqContainer);
  });
  return container;
}

function renderAuxLinkStat(linkStat) {
  if (linkStat.isEmpty) return [];
  const linkTypeDiv = renderLinkTypes(linkStat.LinkType);
  const linkStatDivArray = renderAuxLinkStat(linkStat.LinkStat);
  return [linkTypeDiv, ...linkStatDivArray];
}

/**
 * linkTypes => HTML
 * @param {*} linkTypes
 */
function renderLinkTypes(linkTypes) {
  return returnOne(
    [
      { predicate: l => !!l.AnyBut, value: l => renderAnyBut(l.AnyBut) },
      { predicate: l => !!l.Formula, value: l => renderFormula(l.Formula) },
      { predicate: l => !!l.Code, value: l => renderCode(l.Code) },
      { predicate: l => !!l.Html, value: l => renderHtml(l.Html) },
      { predicate: l => !!l.Italic, value: l => renderItalic(l.Italic) },
      { predicate: l => !!l.Bold, value: l => renderBold(l.Bold) },
      { predicate: l => !!l.Single, value: l => renderSingle(l.Single) }
    ],
    createDefaultEl()
  )(linkTypes);
}

/**
 * single => HTML
 * @param {*} single
 */
function renderSingle(single) {
  return renderText(single);
}

function createDefaultEl() {
  return document.createElement("div");
}
