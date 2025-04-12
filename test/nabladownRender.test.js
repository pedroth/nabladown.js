import { expect, test } from "bun:test";
import { renderToString } from "../src/NabladownRender"
import { parse } from "../src/Parser"
import { readFile } from "fs/promises";

function normalize(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

test("Simple render", async () => {
    const snapshot = await readFile("./test/resources/snapshot.html", 'utf-8')
    const nablaFile = await readFile("./test/resources/test.nd", "utf-8")
    const content = await renderToString(
        parse(
            nablaFile
        )
    );
    expect(normalize(content)).toEqual(normalize(snapshot));
});

test("Complex render", async () => {
    const snapshot = await readFile("./test/resources/snapshot1.html", 'utf-8')
    const nablaFile = await readFile("./test/resources/test1.nd", "utf-8")
    const content = await renderToString(parse(
        nablaFile
    ));
    expect(normalize(content)).toEqual(normalize(snapshot));
});

test("Nabla documentation", async () => {
    const snapshot = await readFile("./test/resources/snapshot2.html", 'utf-8')
    const nablaFile = await readFile("./test/resources/test2.nd", "utf-8")
    const content = await renderToString(parse(
        nablaFile
    ));
    expect(normalize(content)).toEqual(normalize(snapshot));
})
