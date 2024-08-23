import { readFile } from "fs/promises";
import { or, pair, stream } from "./Utils";
import { readFileSync } from "fs";

//========================================================================================
/*                                                                                      *
 *                                     UTILS                                     *
 *                                                                                      */
//========================================================================================

const isNode = typeof window === "undefined";
const myFetch = isNode ?
    path => readFile(path, { encoding: "utf8" }) :
    path => {
        return fetch(path).then(f => f.text())
    };

function parseSymbol(symbol) {
    const sym = [...symbol];
    return stream => {
        let s = stream;
        let i = 0;
        while (i < sym.length) {
            if (s.head() === sym[i]) {
                i++;
                s = s.tail();
            } else {
                throw new Error(`Error occurred while parsing ${symbol}`);
            }
        }
        return pair({ type: "symbol", text: symbol }, s)
    }
}

function parseAnyBut(str) {
    return (stream) => {
        let nextStream = stream;
        const textArray = [];
        while (!nextStream.isEmpty() && !(nextStream.head() === str)) {
            textArray.push(nextStream.head());
            nextStream = nextStream.tail();
        }
        return pair(
            { type: "anybut", text: textArray.join("") },
            nextStream
        );
    };
}

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

export function parseMacroArgs(macroArgsStr) {
    const args = [];
    let charStack = [];
    let s = stream(macroArgsStr);
    let state = 0;
    while (!s.isEmpty()) {
        if (state === 0 && s.head() !== " " && s.head() !== '"') {
            charStack.push(s.head());
        }
        else if (state === 0 && s.head() === " ") {
            if (charStack.length > 0) args.push(charStack.join(""));
            charStack = [];
        }
        else if (state === 0 && s.head() === '"') {
            state = 1;
            charStack = [];
        }
        else if (state === 1 && s.head() !== '"') {
            charStack.push(s.head());
        }
        else if (state === 1 && s.head() === '"') {
            state = 0;
            args.push(charStack.join(""));
            charStack = [];
        }
        s = s.tail();
    }
    if (charStack.length > 0) args.push(charStack.join(""));
    return args;
}

export async function getMacros(macroDef) {
    const { left: macroImports, right: nextStream } = parseMacroImports(stream(macroDef));
    let finalCode = normalizeMacroCode(nextStream.toString());
    await Promise.all(
        macroImports
            .imports
            .map(async path => {
                const file = await myFetch(path)
                finalCode += normalizeMacroCode(file);
            })
    )
    let MACROS = {};
    eval(finalCode);
    return MACROS;
}

function normalizeMacroCode(macroFiles) {
    const splitMACROS = macroFiles.split("MACROS");
    if (splitMACROS.length > 1) {
        const stream1 = stream(splitMACROS[1]).filter(x => " " !== x);
        let { right: stream2 } = parseAnyBut("{")(stream1);
        stream2 = stream2.tail();// remove {
        const { left: functions } = parseAnyBut("}")(stream2);
        const finalCode = `${splitMACROS[0]}\n ${functions.text.split(",").map(f => `MACROS["${f}"] = ${f};`).join("\n")}`;
        return finalCode;
    }
    return macroFiles;
}

//========================================================================================
/*                                                                                      *
 *                                     PARSE IMPORTS                                    *
 *                                                                                      */
//========================================================================================


function parseMacroImports(inputStream) {
    return or(
        () => {
            let nextStream = parseNewLineAndSpaces(inputStream);
            const { right: nextStream1 } = parseSymbol("import")(nextStream);
            nextStream = parseNewLineAndSpaces(nextStream1);
            const { right: nextStream2 } = parseSymbol(`"`)(nextStream);
            const { left: anybut, right: nextStream3 } = parseAnyBut(`"`)(nextStream2);
            let nextStream4 = parseNewLineAndSpaces(nextStream3.tail()); // remove "
            const { right: nextStream5 } = or(() => parseSymbol(";")(nextStream4), () => parseSymbol("\n")(nextStream4));
            const { left: importMacro, right: nextStream6 } = parseMacroImports(nextStream5);
            return pair({ type: "import", imports: [anybut.text, ...importMacro.imports] }, nextStream6);
        },
        () => {
            return pair({ type: "import", imports: [] }, inputStream);
        }
    );
}


function parseNewLineAndSpaces(charStream) {
    let s = charStream;
    while (s.head() === "\n" || s.head() === " ") {
        s = s.tail();
    }
    return s;
}




// (async () => {
//     const macroDef = readFileSync("./test.mjs", { encoding: "utf-8" });
//     const macros = await getMacros(macroDef);
//     macros.macro6();

//     // console.log(parseMacroArgs(`id hello pedroth "Hello world " 3.145 "batata frita" "ervilhas com ovo" 1010101 test cebola`))
// })()