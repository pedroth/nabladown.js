import katex from "katex";
import { Render } from "./Render";
import { buildDom } from "./DomBuilder";

export function render(tree) {
  return new MathRender().render(tree);
}

const DUMMY_TIME_IN_MILLIS = 10;
class MathRender extends Render {
  /**
   * (formula, context) => DomBuilder
   */
  renderFormula(formula, context) {
    applyStyleIfNeeded(context);
    //must check if katex exist
    const Katex = katex || { render: () => { } };
    const { equation, isInline } = formula;
    const container = buildDom("span");
    container.lazy((buildedDom) => {
      // needed the timeout to work! Smoke alert.
      setTimeout(() => {
        Katex.render(equation, buildedDom, {
          throwOnError: false,
          displayMode: !isInline
        });
      }, DUMMY_TIME_IN_MILLIS)
    })
    return container;
  }
}


export { MathRender as Render };


let isFirstRendering = true;
function applyStyleIfNeeded(renderContext) {
  renderContext.lazyActions.push(() => {
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
  })
}

