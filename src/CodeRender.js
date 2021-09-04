import { Render } from "./Render";
// TODO: Find a way to work with lazy loading and webpack
import "highlight.js/styles/railscasts.css";
import hljs from "highlight.js";

export function render(tree) {
  return new CodeRender().render(tree);
}

class CodeRender extends Render {
  /**
   * lineCode => HTML
   * @param {*} lineCode
   */
  renderLineCode(lineCode) {
    const { code } = lineCode;
    return this.getHighlightedCodeElem(code, "", true);
  }

  /**
   * blockCode => HTML
   * @param {*} blockCode
   */
  renderBlockCode(blockCode) {
    const { code, language } = blockCode;
    return this.getHighlightedCodeElem(code, language);
  }

  getHighlightedCodeElem(code, language, isInline = false) {
    const lang = !language || language.trim() === "" ? "plaintext" : language;
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
     `;
    style += isInline
      ? `padding: .2em .4em; color: orange;`
      : `padding: .2em .4em; overflow: auto;`;
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
}

export { CodeRender as Render };
