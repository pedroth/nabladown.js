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

function olistItem(n) {
    return or(
        () => `${n}. olistItem\n${olist(n + 1)}`,
        () => `${n}. olistItem\n`
    )
}

function olist(n) {
    return or(
        () => `${space(n)}${olistItem(n)}${olist(n)}`,
        empty
    )
}

function ulistItem(n) {
    return or(
        () => `- ulistItem\n${ulist(n + 1)}`,
        () => `- ulistItem\n`
    )
}

function ulist(n) {
    return or(
        () => `${space(n)}${ulistItem(n)}${ulist(n)}`,
        empty
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