import { BaseRender } from "./Render";
import "highlight.js/styles/railscasts.css";
// TODO: Find a way to work with lazy loading and webpack
import hljs from "highlight.js";

const PRender = { ...BaseRender };
PRender.renderCode = renderCode;
PRender.renderLineCode = renderLineCode;
PRender.renderBlockCode = renderBlockCode;

export function render(tree) {
  return PRender.render(tree);
}

//========================================================================================
/*                                                                                      *
 *                                    PRIVATE METHODS                                   *
 *                                                                                      */
//========================================================================================

/**
 * code => HTML
 * @param {*} code
 */
function renderCode(code) {
  const { LineCode, BlockCode } = code;
  return !!LineCode ? renderLineCode(LineCode) : renderBlockCode(BlockCode);
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
  const container = isInline
    ? document.createElement("span")
    : document.createElement("pre");
  let style = `
    border-style: solid;
    border-width: thin;
    border-radius: 6px;
    box-sizing: border-box;
    background-color: #232323;
    border: hidden;
    font-size: 85%;
    color: orange;
   `;
  style += isInline ? `padding: 5px` : `padding: .2em .4em; overflow: auto;`;
  container.setAttribute("style", style);
  const codeTag = document.createElement("code");
  codeTag.setAttribute("class", `language-${lang}`);
  // lazy load doesn't work with webpack, only if I hack the bundle
  /* 
  import(`highlight.js/lib/languages/${lang}`).then(({ default: langLib }) => {
     hljs.registerLanguage(lang, langLib);
     codeHtml.innerHTML = hljs.highlight(lang, code).value;
   });
   */
  codeTag.innerHTML = hljs.highlight(lang, code).value;
  container.appendChild(codeTag);
  return container;
}
