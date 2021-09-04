import katex from "katex";
import { Render } from "./Render";

export function render(tree) {
  return new MathRender().render(tree);
}

class MathRender extends Render {
  /**
   * formula => HTML
   * @param {*} formula
   */
  renderFormula(formula) {
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
    //must check if katex exist
    const Katex = katex || { render: () => {} };
    const { equation, isInline } = formula;
    let container = document.createElement("span");
    Katex.render(equation, container, {
      throwOnError: false,
      displayMode: !isInline
    });
    return container;
  }
}

let isFirstRendering = true;

export { MathRender as Render };
