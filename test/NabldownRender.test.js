import { expect, test } from "bun:test";
import { renderToString } from "../src/NabladownRender"
import { parse } from "../src/Parser"

test("Simple render", () => {
    const snapshot = `<main ><p ><h1 id="[object-htmlspanelement]"><span ><span >Hello </span><span style="color:red"><span ><span >world</span></span></span><span >, </span><em ><span ><span >this</span></span></em><span > is </span><span ><span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∇</mi></mrow><annotation encoding="application/x-tex">\nabla</annotation></semantics></math></span></span><span > </span><strong ><span ><span >Nabladown</span></span></strong><code >.js</code></span></h1></p></main>`
    const content =
        renderToString(
            parse(
                "# Hello <span style='color:red'>world</span>, _this_ is $\\nabla$ **Nabladown**`.js`\n"
            )
        );
    expect(content).toBe(snapshot);
});

test("Complex render", () => { })