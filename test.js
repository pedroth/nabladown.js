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


function listItem(n, λ) {
    return `${space(n)}${λ} ${or(
        () => `listItem\n${list(n + 1)}`,
        () => `listItem\n`
    )}`
}

function olist(n) {
    return or(
        () => `${listItem(n, `${n}.`)}${olist(n)}`,
        () => `${listItem(n, `${n}.`)}`
    )
}

function ulist(n) {
    return or(
        () => `${listItem(n, "-")}${ulist(n)}`,
        () => `${listItem(n, "-")}`
    )
}

function list(n) {
    return or(
        () => ulist(n),
        () => olist(n)
    )
}

(() => {
    console.log(list(0))
})()