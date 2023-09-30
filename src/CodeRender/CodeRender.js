import { Render } from "../Render";
import hybridStyleURL from "highlight.js/styles/hybrid.css";
import CodeRenderStyleURL from "./CodeRender.css";
import hljs from "highlight.js"
import { buildDom } from "../DomBuilder";

class CodeRender extends Render {
  /**
   * lineCode => HTML
   * @param {*} lineCode
   */
  renderLineCode(lineCode) {
    applyStyleIfNeeded();
    const { code } = lineCode;
    const container = buildDom("span");
    container.attr("class", "base_code line_code");
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
    applyStyleIfNeeded();
    const { code, language } = blockCode;
    const lang = trimLanguage(language);
    const container = buildDom("div")
      .attr("style", "position: relative;");
    const preTag = buildDom("pre")
      .attr("class", "base_code block_code");
    container.appendChild(preTag);
    const codeTag = buildDom("code")
      .attr("class", `language-${lang} `);
    codeTag.inner(hljs.highlight(code, { language: lang }).value);
    preTag.appendChild(codeTag);
    container.appendChild(createCopyButton(code));
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
    const HighlightStyleDOM = document.createElement("style");
    const CodeStyleDOM = document.createElement("style");
    fetch("./dist" + hybridStyleURL.substring(1))
      .then((data) => data.text())
      .then(styleFile => {
        HighlightStyleDOM.innerText = styleFile;
        document
          .head
          .insertBefore(HighlightStyleDOM, document.head.firstChild);
      })
      .then(() => fetch("./dist" + CodeRenderStyleURL.substring(1)))
      .then((data) => data.text())
      .then(styleFile => {
        CodeStyleDOM.innerText = styleFile;
        document
          .head
          .insertBefore(CodeStyleDOM, document.head.firstChild);
      });
    isFirstRendering = false;
  }
}

function trimLanguage(language) {
  return !language || language.trim() === "" ? "plaintext" : language;
}

function createCopyButton(string2copy) {
  const ND_COPY_CLASS = "nd_copy";
  const ND_COPIED_CLASS = "nd_copied";
  const COPY_SVG_VIEWBOX = "0 0 384 512";
  const COPIED_SVG_VIEWBOX = "0 0 24 24";
  const COPY_BUTTON_ICON_PATH = `M336 64h-88.6c.4-2.6.6-5.3.6-8 0-30.9-25.1-56-56-56s-56 25.1-56 56c0 2.7.2 5.4.6 8H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 32c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm160 432c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16h48v20c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12V96h48c8.8 0 16 7.2 16 16z`
  const COPIED_BUTTON_ICON_PATH = `M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`;

  const copyText = buildDom("span")
    .attr("class", ND_COPY_CLASS)
    .inner("COPY");
  const svg = buildDom("svg")
    .attr("viewBox", COPY_SVG_VIEWBOX)
    .attr("class", ND_COPY_CLASS)
    .appendChild(
      buildDom("path")
        .attr("d", COPY_BUTTON_ICON_PATH)
    );
  const copyTextRef = copyText.getRef();
  const svgRef = svg.getRef();
  return buildDom("button")
    .attr("class", ND_COPY_CLASS)
    .event("click", () => {
      navigator.clipboard.writeText(string2copy);
      copyTextRef(dom => {
        dom.classList.add(ND_COPIED_CLASS)
        dom.innerText = "COPIED";
      })
      svgRef(dom => {
        dom.classList.add(ND_COPIED_CLASS);
        dom.children[0].setAttribute("d", COPIED_BUTTON_ICON_PATH);
        dom.setAttribute("viewBox", COPIED_SVG_VIEWBOX);
      })
      setTimeout(() => {
        copyTextRef(dom => {
          dom.classList.remove(ND_COPIED_CLASS)
          dom.innerText = "COPY";
        })
        svgRef(dom => {
          dom.classList.remove(ND_COPIED_CLASS);
          dom.children[0].setAttribute("d", COPY_BUTTON_ICON_PATH);
          dom.setAttribute("viewBox", COPY_SVG_VIEWBOX);
        })
      }, 1500)
    })
    .appendChild(
      buildDom("span")
        .attr("style", "display: flex; flex-direction:row;")
        .appendChild(copyText)
        .appendChild(
          svg
        )
    )
}
