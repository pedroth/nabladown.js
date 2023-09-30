import { Render as CodeRender } from "./CodeRender/CodeRender";
import { Render as MathRender } from "./MathRender";
import { composeRender } from "./Render";

export function render(tree) {
  return new NabladownRender().render(tree);
}

const NabladownRender = composeRender(MathRender, CodeRender);

export { NabladownRender as Render };
