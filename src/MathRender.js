import katex from "katex";
import { Render } from "./Render";
import { buildDom } from "./DomBuilder";

export function render(tree) {
  return new MathRender().render(tree);
}

export function renderToString(tree, options) {
  return new MathRender().abstractRender(tree).then(doc => doc.toString(options));
}

class MathRender extends Render {

  /**
   * (formula, context) => DomBuilder
   */
  renderFormula(formula, context) {
    this.applyStyleIfNeeded(context);
    //must check if katex exist
    const Katex = katex || { render: () => { } };
    const { equation, isInline } = formula;
    const container = buildDom("span");
    const katexInnerHtml =
      Katex.renderToString(equation, {
        throwOnError: false,
        displayMode: !isInline,
        output: "html"
      })
    container.inner(katexInnerHtml);
    return container;
  }

  applyStyleIfNeeded(renderContext) {
    if (!renderContext.firstMathRenderDone) {
      renderContext.finalActions.push((docDomBuilder) => {
        const linkDomBuilder = buildDom("link")
          .attr("rel", "stylesheet")
          .attr("href", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css")
          .attr("integrity", "sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV")
          .attr("crossorigin", "anonymous")
        docDomBuilder.appendChildFirst(linkDomBuilder);
      })
      renderContext.firstMathRenderDone = true;
    }
  }
}


export { MathRender as Render };




