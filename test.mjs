function details(input, args) {
    const [title] = args;
    return `
    <details>
      <summary>${title}</summary>
      ${input}
    </details>
    `
}



MACROS = { details }