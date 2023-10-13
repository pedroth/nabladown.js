import katex from "katex";
import { Render } from "./Render";
import { buildDom } from "./DomBuilder";

export function render(tree) {
  return new MathRender().render(tree);
}

export function renderToString(tree) {
  return new MathRender().abstractRender(tree).toString();
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
    container.lazy((eitherDom) => {
      eitherDom
        .mapRight(dom => {
          setTimeout(() => {
            Katex.render(equation, dom, {
              throwOnError: false,
              displayMode: !isInline,
              output: "html"
            });
          }, 10)
        })
        .mapLeft((domBuilder) => {
          domBuilder.inner(
            Katex.renderToString(equation, {
              throwOnError: false,
              displayMode: !isInline,
              output: "html"
            })
          )
        })
    })
    return container;
  }

  applyStyleIfNeeded(renderContext) {
    if (!renderContext.firstMathRenderDone) {
      renderContext.lazyActions.push((eitherDocDom) => {
        const linkDomBuilder = buildDom("link")
          .attr("rel", "stylesheet")
          .attr("href", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css")
          .attr("integrity", "sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV")
          .attr("crossorigin", "anonymous")
        eitherDocDom
          .mapRight(docDom => {
            docDom.insertBefore(linkDomBuilder.build(), docDom.firstChild)
          })
          .mapLeft(docDomBuilder => {
            docDomBuilder.appendChildFirst(linkDomBuilder);
          })
      })
      renderContext.firstMathRenderDone = true;
    }
  }
}


export { MathRender as Render };




