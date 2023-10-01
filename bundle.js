// eslint-disable-next-line no-undef
const build = await Bun.build({
    entrypoints: [
        "./src/Lexer.js",
        "./src/Parser.js",
        "./src/Render.js",
        "./src/MathRender.js",
        "./src/NabladownRender.js",
        "./src/CodeRender/CodeRender.js",
    ],
    outdir: "./dist",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})

console.log(build);