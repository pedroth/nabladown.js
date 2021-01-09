import katex from "katex";
import { asyncForEach, evalScriptTag, returnOne } from "./Utils";
import "highlight.js/styles/railscasts.css";
// TODO: Find a way to work with lazy loading and webpack
import hljs from "highlight.js";

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
    document.createElement("div")
  )(statement);
}

/**
 * title => HTML
 * @param {*} title
 */
function renderTitle(title) {
  const { level, Seq } = title;
  const header = document.createElement(`h${level}`);
  header.appendChild(renderSeq(Seq));
  return header;
}

/**
 * seq => HTML
 * @param {*} seq
 */
function renderSeq(seq) {
  const div = document.createElement("div");
  const seqArray = renderAuxSeq(seq);
  if (seqArray.length === 0)
    return div.appendChild(document.createElement("br"));
  seqArray.forEach(seqDiv => div.appendChild(seqDiv));
  div.setAttribute("style", "display: flex; align-items: center");
  return div;
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
      { predicate: t => !!t.Italic, value: t => renderItalic(t.Italic) },
      { predicate: t => !!t.Bold, value: t => renderBold(t.Bold) }
    ],
    document.createElement("div")
  )(seqTypes);
}

/**
 * text => HTML
 * @param {*} text
 */
function renderText(text) {
  const { text: txt } = text;
  const div = document.createElement("pre");
  div.innerHTML = txt;
  return div;
}

/**
 * italic => HTML
 * @param {*} italic
 */
function renderItalic(italic) {
  const { SeqTypes } = italic;
  const div = document.createElement("em");
  div.appendChild(renderSeqTypes(SeqTypes));
  return div;
}

/**
 * bold => HTML
 * @param {*} bold
 */
function renderBold(bold) {
  const { SeqTypes } = bold;
  const div = document.createElement("strong");
  div.appendChild(renderSeqTypes(SeqTypes));
  return div;
}

/**
 * anyBut => HTML
 * @param {*} anyBut
 */
function renderAnyBut(anyBut) {
  const { textArray } = anyBut;
  const div = document.createElement("pre");
  div.innerHTML = textArray.join("");
  return div;
}

/**
 * formula => HTML
 * @param {*} formula
 */
function renderFormula(formula) {
  //must check if katex exist
  const Katex = katex || { render: () => {} };
  const { equation } = formula;
  const div = document.createElement("div");
  if (!formula.isInline) div.setAttribute("style", "flex-grow: 1");
  Katex.render(equation, div, {
    throwOnError: false,
    displayMode: !formula.isInline
  });
  return div;
}

/**
 * html => HTML
 * @param {*} html
 */
function renderHtml(html) {
  const { html: innerHtml } = html;
  const div = document.createElement("div");
  div.innerHTML = innerHtml;
  const scripts = Array.from(div.getElementsByTagName("script"));
  const asyncLambdas = scripts.map(script => () => evalScriptTag(script));
  asyncForEach(asyncLambdas);
  return div;
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
    document.createElement("div")
  )(code);
}

/**
 * lineCode => HTML
 * @param {*} lineCode
 */
function renderLineCode(lineCode) {
  const { code } = lineCode;
  return getHighlightedCodeElem(code, "", true);
}

/**
 * blockCode => HTML
 * @param {*} blockCode
 */
function renderBlockCode(blockCode) {
  const { code, language } = blockCode;
  return getHighlightedCodeElem(code, language);
}

function getHighlightedCodeElem(code, language, isInline = false) {
  const lang = language === "" ? "plaintext" : language;
  const pre = document.createElement("pre");
  let style = `
  border-style: solid;
  border-width: thin;
  border-radius: 6px;
  box-sizing: border-box;
  background-color: #232323;
  border: hidden;
 `;
  style += isInline
    ? `padding: 5px`
    : `
  flex-grow: 1;
  padding: 16px;
  overflow: auto;
  font-size: 97%;
  `;
  pre.setAttribute("style", style);
  const codeHtml = document.createElement("code");
  codeHtml.setAttribute("class", `language-${lang}`);
  // lazy load doesn't work with webpack, only if I hack the bundle
  // import(`highlight.js/lib/languages/${lang}`).then(({ default: langLib }) => {
  //   hljs.registerLanguage(lang, langLib);
  //   codeHtml.innerHTML = hljs.highlight(lang, code).value;
  // });
  codeHtml.innerHTML = hljs.highlight(lang, code).value;
  pre.appendChild(codeHtml);
  return pre;
}

/**
 * link => HTML
 * @param {*} link
 */
function renderLink(link) {
  const { LinkStat, link: hyperlink } = link;
  const div = document.createElement("a");
  div.setAttribute("href", hyperlink);
  hyperlink.includes("http") && div.setAttribute("target", "_blank");
  const childStatement = renderLinkStat(LinkStat);
  div.appendChild(childStatement);
  return div;
}

/**
 * linkStat => HTML
 * @param {*} linkStat
 */
function renderLinkStat(linkStat) {
  const ans = document.createElement("div");
  const seqArray = renderAuxLinkStat(linkStat);
  seqArray.forEach(seqDiv => ans.appendChild(seqDiv));
  return ans;
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
      { predicate: l => !!l.Bold, value: l => renderBold(l.Bold) }
    ],
    document.createElement("div")
  )(linkTypes);
}
