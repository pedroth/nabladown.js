function randomNumber() {
    const myArray = new Uint32Array(10);
    return crypto.getRandomValues(myArray)[0];
}

function or(...list) {
    const randomIndex = Math.floor(list.length * Math.random());
    return list[randomIndex]();
}

function empty() {
    return "";
}

function space(n) {
    if (n === 0) return empty()
    return ` ${space(n - 1)}`;
}

function text(n) {
    return `${space(n)}text`;
}

function innerHtml(n) {
    return or(
        () => `${text(n)}${innerHtml(n)}`,
        () => `${html(n)}${innerHtml(n)}`,
        empty
    )
}

function endTag(n, id) {
    return `${space(n)}</ end_tag_${id} >`;
}

function startTag(n, id) {
    return `${space(n)}< start_tag_${id} >`;
}

function emptyTag(n) {
    return `${space(n)}< empty_tag />`;
}

function html(n) {
    const uid = randomNumber();
    return or(
        () => `${startTag(n, uid)}\n${innerHtml(n + 1)}\n${endTag(n, uid)}\n`,
        () => emptyTag(n)
    )
}

(() => {
    console.log(html(0))
})()