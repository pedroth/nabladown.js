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
    // target: "web",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log(build);

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
console.log(buildNode);

