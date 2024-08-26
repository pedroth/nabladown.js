function details(input, args) {
    const [title] = args;
    return `
    <details>
      <summary>${title}</summary>
      ${input}
    </details>
    `
}

function c(input, args) {
  const [myClass] = args;
  return `<div class="${myClass}">${input}</div>`
}

MACROS = { c, details }