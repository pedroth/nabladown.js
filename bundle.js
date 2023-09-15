const build = await Bun.build({
    entrypoints: [
        "./src/Lexer.js",
        "./src/Parser.js",
        "./src/Render.js",
        "./src/CodeRender.js",
        "./src/MathRender.js",
        "./src/NabladownRender.js"
    ],
    outdir: "./dist",
    // splitting: true // not working
})

console.log(build);