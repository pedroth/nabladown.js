import katex from "katex";
import { Render } from "./Render";
import { buildDom } from "./DomBuilder";

export function render(tree) {
  return new MathRender().render(tree);
}

class MathRender extends Render {
  /**
   * formula => HTML
   * @param {*} formula
   */
  renderFormula(formula) {
    applyStyleIfNeeded();
    //must check if katex exist
    const Katex = katex || { render: () => { } };
    const { equation, isInline } = formula;
    const container = buildDom("span");
    container.lazy((buildedDom) => {
      console.log("rendering formula")
      Katex.render(equation, buildedDom, {
        throwOnError: false,
        displayMode: !isInline
      });
    })
    return container;
  }
}


export { MathRender as Render };


let isFirstRendering = true;
function applyStyleIfNeeded() {
  if (isFirstRendering) {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute(
      "href",
      "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css"
    );
    link.setAttribute(
      "integrity",
      "sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV"
    );
    link.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(link);
    isFirstRendering = false;
  }
}

