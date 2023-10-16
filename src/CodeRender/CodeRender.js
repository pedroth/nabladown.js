import { Render } from "../Render";
import languageStyleURL from "highlight.js/styles/github-dark.css";
import codeRenderStyleURL from "./CodeRender.css";
import hljs from "highlight.js"
import { buildDom } from "../DomBuilder";
import { readFileSync } from "fs";
import { success } from "../Monads";

export function render(tree) {
  return new CodeRender().render(tree);
}

export function renderToString(tree, options) {
  return new CodeRender().abstractRender(tree).then(doc => doc.toString(options));
}

class CodeRender extends Render {
  /**
   * (lineCode, context) => DomBuilder
   */
  renderLineCode(lineCode, context) {
    applyStyleIfNeeded(context);
    const { code } = lineCode;
    const container = buildDom("span");
    container.attr("class", "base_code line_code");
    const codeTag = buildDom("code");
    codeTag.inner(code);
    container.appendChild(codeTag);
    return container;
  }

  /**
   * (blockCode, context) => DomBuilder
   */
  renderBlockCode(blockCode, context) {
    applyStyleIfNeeded(context);
    const { code, language } = blockCode;
    const lang = trimLanguage(language);
    const container = buildDom("div")
      .attr("style", "position: relative;");
    const preTag = buildDom("pre")
      .attr("class", "base_code block_code");
    container.appendChild(preTag);
    const innerHTMLCodeStr = hljs.highlight(
      code,
      { language: lang }
    ).value;
    const codeTag = buildDom("code")
      .attr("class", `language-${lang}`)
      .inner(innerHTMLCodeStr);
    preTag.appendChild(codeTag);
    container.appendChild(createCopyButton(code));
    return container;
  }
}

export { CodeRender as Render };

//========================================================================================
/*                                                                                      *
*                                         UTILS                                        *
*                                                                                      */
//========================================================================================


function applyStyleIfNeeded(renderContext) {
  if (!renderContext.firstCodeRenderDone) {
    renderContext.finalActions.push(
      async (docDomBuilder) => {
        const hlStyleDomBuilder = buildDom("style");
        const codeStyleDomBuilder = buildDom("style");
        await updateStylesBlockWithData(hlStyleDomBuilder, codeStyleDomBuilder);
        docDomBuilder.appendChildFirst(hlStyleDomBuilder);
        docDomBuilder.appendChildFirst(codeStyleDomBuilder);
      })
    renderContext.firstCodeRenderDone = true;
  }
}

async function updateStylesBlockWithData(hlStyleDomBuilder, codeStyleDomBuilder) {
  if (typeof window !== "undefined") {
    await fetchResource(languageStyleURL)
      .catch(() => fetchResource(`/dist/web/${languageStyleURL.substring(1)}`))
      .then((data) => data.text())
      .then((file) => hlStyleDomBuilder.inner(file))

    await fetchResource(codeRenderStyleURL)
      .catch(() => fetchResource(`/dist/web/${codeRenderStyleURL.substring(1)}`))
      .then((data) => data.text())
      .then((file) => codeStyleDomBuilder.inner(file))
  } else {
    const LOCAL_NABLADOWN = "./node_modules/nabladown.js/dist/node";
    readResource(languageStyleURL)
      .failBind(url => {
        return readResource(`${LOCAL_NABLADOWN}${url.substring(1)}`)
      })
      .map(languageStyleFile => {
        hlStyleDomBuilder.inner(languageStyleFile);
      })

    readResource(codeRenderStyleURL)
      .failBind(url => {
        return readResource(`${LOCAL_NABLADOWN}${url.substring(1)}`)
      })
      .map(copyStyleFile => {
        codeStyleDomBuilder.inner(copyStyleFile);
      });
  }
}

function trimLanguage(language) {
  return !language || language.trim() === "" ? "plaintext" : language.trim();
}

const TIME_OF_COPIED_IN_MILLIS = 1500;
function createCopyButton(string2copy) {
  const ND_COPY_CLASS = "nd_copy";
  const ND_COPIED_CLASS = "nd_copied";
  const COPY_SVG_VIEWBOX = "0 0 24 24";
  const COPIED_SVG_VIEWBOX = "0 0 24 24";
  const COPY_BUTTON_ICON_PATH = `M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z`
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
  const maybeCopyTextRef = copyText.getRef();
  const maybeSvgRef = svg.getRef();
  return buildDom("button")
    .attr("class", ND_COPY_CLASS)
    .attr("title", "Copy to clipboard")
    .event("click", () => {
      navigator.clipboard.writeText(string2copy);
      maybeCopyTextRef(maybeDom => {
        maybeDom.map(dom => {
          dom.classList.add(ND_COPIED_CLASS)
          dom.innerText = "COPIED";
        })
      })
      maybeSvgRef(maybeDom => {
        maybeDom.map(dom => {
          dom.classList.add(ND_COPIED_CLASS);
          dom.children[0].setAttribute("d", COPIED_BUTTON_ICON_PATH);
          dom.setAttribute("viewBox", COPIED_SVG_VIEWBOX);
        })
      })
      setTimeout(() => {
        maybeCopyTextRef(maybeDom => {
          maybeDom.map(dom => {
            dom.classList.remove(ND_COPIED_CLASS)
            dom.innerText = "COPY";
          })
        })
        maybeSvgRef(maybeDom => {
          maybeDom.map(dom => {
            dom.classList.remove(ND_COPIED_CLASS);
            dom.children[0].setAttribute("d", COPY_BUTTON_ICON_PATH);
            dom.setAttribute("viewBox", COPY_SVG_VIEWBOX);
          });
        })
      }, TIME_OF_COPIED_IN_MILLIS)
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

function fetchResource(resourceName) {
  return fetch(resourceName)
    .then(data => {
      if (!data.ok) throw new Error(`Resource ${resourceName}, not found`);
      return data;
    })
}

function readResource(resourceName) {
  return success(resourceName)
    .map(
      url =>
        readFileSync(
          url,
          { encoding: "utf8" }
        )
    )
}