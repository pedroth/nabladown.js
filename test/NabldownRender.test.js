import { expect, test } from "bun:test";
import { renderToString } from "../src/NabladownRender"
import { parse } from "../src/Parser"
import { readFile } from "fs/promises";

test("Simple render", async () => {
    const snapshot = await readFile("./test/resources/snapshot.html", 'utf-8')
    const content = await renderToString(
        parse(
            "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n"
        )
    );
    expect(content).toEqual(snapshot);
});

test("Complex render", async () => {
    const snapshot = await readFile("./test/resources/snapshot1.html", 'utf-8')
    const nablaFile = await readFile("./test/resources/test1.nd", "utf-8")
    const content = await renderToString(parse(
        nablaFile
    ));
    expect(content).toEqual(snapshot);
});

test("Nabla documentation", async () => {
    const snapshot = await readFile("./test/resources/snapshot2.html", 'utf-8')
    const nablaFile = await readFile("./test/resources/test2.nd", "utf-8")
    const content = await renderToString(parse(
        nablaFile
    ));
    expect(content).toEqual(snapshot);
})
