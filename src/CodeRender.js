import { Render } from "./Render";
import hybridStyleURL from "highlight.js/styles/hybrid.css";
// import hljs from "highlight.js/lib/core";
import hljs from "highlight.js"
import { buildDom } from "./DomBuilder";

const BASE_CODE_STYLE = `
      border-style: solid;
      border-width: thin;
      border-radius: 6px;
      box-sizing: border-box;
      background-color: #232323;
      border: hidden;
      font-size: 85%;
     `;
const LINE_CODE_STYLE = BASE_CODE_STYLE + `padding: .2em .4em; color: orange;`;
const BLOCK_CODE_STYLE = BASE_CODE_STYLE + `padding: .2em .4em; overflow: auto;`;


class CodeRender extends Render {
  /**
   * lineCode => HTML
   * @param {*} lineCode
   */
  renderLineCode(lineCode) {
    const { code } = lineCode;
    const container = buildDom("span");
    container.attr("style", LINE_CODE_STYLE);
    const codeTag = buildDom("code");
    codeTag.inner(code);
    container.appendChild(codeTag);
    return container;
  }

  /**
   * blockCode => HTML
   * @param {*} blockCode
   */
  renderBlockCode(blockCode) {
    const { code, language } = blockCode;
    // After bun update this was needed
    applyStyleIfNeeded();
    const lang = trimLanguage(language);
    const container = buildDom("pre");
    container.attr("style", BLOCK_CODE_STYLE);
    const codeTag = buildDom("code");
    codeTag.attr("class", `language-${lang}`);
    // try to lazy load language package in future
    // import(`highlight.js/lib/languages/${lang}`).then((langDef) => {
    //   console.log("debug lang definition", langDef);
    //   hljs.registerLanguage(lang, langLib);
    //   codeTag.innerHTML = hljs.highlight(code, { language: lang }).value;
    // });
    codeTag.inner(hljs.highlight(code, { language: lang }).value);
    container.appendChild(codeTag);
    return container;
  }
}

export { CodeRender as Render };


export function render(tree) {
  return new CodeRender().render(tree);
}
//========================================================================================
/*                                                                                      *
*                                         UTILS                                        *
*                                                                                      */
//========================================================================================


let isFirstRendering = true;
function applyStyleIfNeeded() {
  if (isFirstRendering) {
    const styleDOM = document.createElement("style");
    fetch("./dist" + hybridStyleURL.substring(1)).then((data) => data.text()).then(styleFile => {
      styleDOM.innerText = styleFile;
      document.head.insertBefore(styleDOM, document.head.firstChild);
    });
    isFirstRendering = false;
  }
}

function trimLanguage(language) {
  return !language || language.trim() === "" ? "plaintext" : language;
}
