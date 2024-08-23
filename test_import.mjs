function macro6(input, args) {
    console.log("Hello!!");
}

function macro7(input, args) {
    return ``;
}

function test(input, args) {
    return `input: ${input}, args: ${args}`;
}

MACROS = { macro6, test, macro7 };