import { CodeRender } from "./CodeRender";
import { MathRender } from "./MathRender";
import { composeRender } from "./Render";

export function render(tree) {
  return new NabladownRender().render(tree);
}

const NabladownRender = composeRender(MathRender, CodeRender);

export { NabladownRender };
