import watch from "node-watch";
import { execSync } from "child_process";

// eslint-disable-next-line no-undef
if ("--watch" === Bun.argv.at(-1)) {
    watch('./src/', { recursive: true }, (evt, name) => {
        console.log("%s changed", name);
        console.log("%s", execSync("bun run build"));
    });
}

// eslint-disable-next-line no-undef
const build = await Bun.build({
    entrypoints: [
        "./src/index.js",
        "./src/Lexer.js",
        "./src/Parser.js",
        "./src/Render.js",
        "./src/MathRender.js",
        "./src/NabladownRender.js",
        "./src/CodeRender/CodeRender.js",
    ],
    outdir: "./dist/web/",
    target: "browser",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log("WEB:", build);

console.log(">>>>>>>>>>>");

// eslint-disable-next-line no-undef
const buildNode = await Bun.build({
    entrypoints: [
        "./src/index.js",
        "./src/Lexer.js",
        "./src/Parser.js",
        "./src/Render.js",
        "./src/MathRender.js",
        "./src/NabladownRender.js",
        "./src/CodeRender/CodeRender.js",
    ],
    outdir: "./dist/node/",
    target: "node",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log("NODE:", buildNode);

