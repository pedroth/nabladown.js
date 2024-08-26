# Nabladown.js 

A parser and renderer for the `Nabladown` language.

NablaDown.js is a `JS` library able to `parse: String -> Abstract Syntax Tree` a pseudo/flavored **Markdown** language and `render: Abstract Syntax Tree -> HTML` it into `HTML`.

The purpose of this library is to render beautiful documents in `HTML`, using a simple language as **Markdown**, with the focus on rendering `code`,`equations`,`html` and `custom behavior` with `macros` .

The library is written in a way, that is possible to create and compose multiple renderers together. This way is possible to add features on top of a basic renderer. More on that below (check the [Advanced section](#advanced)).

Playground Usage:
[![](/Nabladown.webp)](https://pedroth.github.io/nabladown.js)

# Contents

1. [QuickStart](#quick-start)
2. [Language cheat sheet](#language-cheat-sheet)
3. [Try it](#try-it)
3. [Advanced](#advanced)
4. [Develop nabladown.js](#develop-nabladownjs)
5. [Influences](#influences)
6. [TODO](#todo)

# Quick Start

Nabladown.js provides two main functions:

- `parse: String -> AST`
- `render: AST -> HTML`

The `parser` will produce a [Abstract Synatx Tree(AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) from a `string`, and `render` will create `HTML nodes` from the parsing tree.

## Web

``` html
<!DOCTYPE html>
<html lang="en">

<head>
</head>

<body>

</body>
<script type="module">
    import { parse, render } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/index.js";

    // You can also import from local file e.g:
    // import { parse, render } from "./node_modules/nabladown.js/dist/web/index.js";

    const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";

    render(parse(content)).then(dom => document.body.appendChild(dom));
</script>
</html>
```

## [React](https://react.dev/) 

Install it using `npm install nabladown.js`

```jsx
import { useEffect, useState } from 'react'
import { parse, render } from "nabladown.js/dist/web/index"
import './App.css'

const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";
function App() {
  const [dom, setDom] = useState("");
  useEffect(() => {
    render(parse(content)).then((nablaDom) => setDom(nablaDom));
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: dom.innerHTML }}>
    </div>
  )
}

export default App
```

## [Node][node] / [Bun][bun]

[node]:https://nodejs.org/en
[bun]: https://bun.sh/

Install it using `npm install nabladown.js` / `bun add nabladown.js`

```js
import { parse, render } from "nabladown.js/dist/node/index.js";

const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";

(async () => {
    const domStr = await render(parse(content))
    console.log(domStr);
})();
```

With formatted string:
```js
import { parse, renderToString } from "nabladown.js/dist/node/index.js";

const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";

(async () => {
    const domStr = await renderToString(parse(content), {isFormatted: true})
    console.log(domStr);
})();
```
## NPM

Check `npm` page [here](https://www.npmjs.com/package/nabladown.js), to check all `nabladown.js` versions.

# Language cheat sheet

This language is similar [markdown syntax](https://www.markdownguide.org/cheat-sheet/) but adds some extras like formulas, code, HTML, and Macros.

> Although similar to markdown, it has some minor differences

## Headers

```js
# H1
## H2
### H3
...
###### H6
```

## Style

```js
_italics_

*bold*

*_bold and italics_*

_*italics and bold*_
```

## Paragraph

```js
lorem ipsum lorem ipsum // paragraph

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum. lorem ipsum lorem ipsum lorem ipsum lorem ipsum // paragraph

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum. lorem ipsum lorem ipsum
lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum. // paragraph
```

## Lists

### Unordered

```js
- Parent
 - Child
  - GrandChild
  - GrandChild
 - Child
```

### Ordered

```js
// numbers don't really matter,
// they just need to be numbers
1. Parent
 2. Child
  3. GrandChild
  3. GrandChild
 8. Child
```

### Mixed type

```js
1. Ordered Parent
 - Unordered Child
 - Unordered Child
 - Unordered Child
2. Ordered Parent
 - Unordered Child
 - Unordered Child
```

### Indentation

Single spaces:
```js
- A list
 - A sublist
  - A subsublist
 - A sublist
- A list
```
Single tabs:
```js
- A list
  - A sublist
    - A subsublist
  - A sublist
- A list
```

> For now, `nabladown.js` is not able to write paragraphs in lists. Like [here](https://www.markdownguide.org/basic-syntax/#paragraphs). To be added in future.
> But there is an hack:
> ```md
> - A list
>  - <div>
>     !!!
>     Write paragraph as usual
>     !!!
>    </div>
>  - Another list item
> ```


## Links

```js
// simple link
[nabladown.js](https://pedroth.github.io/nabladown.js/)

// link using reference
[brave][ref]

Some optional text...

[ref]: https://search.brave.com/
```

It is possible to link to titles:

```markdown
# A Title

[Go to title](#a-title)
```

You can also use bare links like this: 

```md
https://pedroth.github.io/nabladown.js/
```

## Footnotes

```js
Some optional text [^1]
blablabla [^foot] blablabla

...

[^1]: Text with *nabladown* syntax
[^foot]: You can use any identifier
```

> For now, it's not possible to add paragraphs in footnotes, like [here](https://www.markdownguide.org/extended-syntax/#footnotes)
> But there is an hack:
> ```md
> A complex footnote[^complex] !!
> ---
> [^complex]: <div> 
> !!!
> Write nabladown as usual!
> !!!!
> </div>
> ```

## Images/Videos

```js
// simple image
![Image legend](https://picsum.photos/200)

// image with title
![Image _legend_  with $\nabla$](https://picsum.photos/200)

// Image with link to it
[![Image reference + *link* + reference][link_variable]][link_variable]

[link_variable]: some link to image

// video
![Free *video*](https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4)

// youtube video with legend
![*Megaman* youtube video](https://www.youtube.com/watch?v=uVxshK09WvI)
![_Megaman_ share youtube link](https://youtu.be/uVxshK09WvI?si=oKwO_2ZG9_4X1oaU)

// sound
![Free _sound_](https://www.bensound.com/bensound-music/bensound-ukulele.mp3)
```

## Math

Use [Tex](https://en.wikibooks.org/wiki/LaTeX/Mathematics) syntax inside '$'.

```js
// inline
Lorem ipsum $x^2+1 = 0$

// paragraph
$$e^{2\pi i} - 1 = 0$$

// paragraph
$$
\oint_{\partial\Omega} \alpha = \ int_\Omega \text{d} \alpha
$$
```

## Code

### Inline code

```js
lorem ipsum `inline code here` lorem ipsum
```

### Block code

````
```java
class Main {
  public static void main(String[] args) {
    System.out.println("Hello")
  }
}
```
````
In the abstract

````
```<language>

block code...

```
````

Syntax [here](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks).
Name of the available languages according to [highlight.js](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)

## Line Separation

```js
lorem ipsum 

---

lorem ipsum

```

## HTML

```html
# Normal markdown with <span style="color: red"> red text </span> inline

A paragraph with html and nabladown inside:
<div>
<a href="https://pedroth.github.io/nabladown.js">
    $1 + 1 = 2$
</a>
<button onClick="alert('hello world')">
  hello *world*
</button>
</div>
```

## Comments

Normal html comments:

```html
<div class="quote">
  <a href="https://pedroth.github.io/nabladown.js">
    $$\sum_ {n=1}^\infty 1 / n^2 = \pi^2 / 6$$
  </a>
  <hr />
  <!-- A comment -->
  <div style="text-align: center">
    <button onClick="alert('hello world')">
      hello _*world*_!!
    </button>
  </div>
</div>
<!-- 
  Another comment

  With text in it!!
-->
```

## Macros

Macros definitions:
```js
:::
  // Define a function in js, with form: 
  // f: (input: string, array: string[]) => string
  function addClass(input, args) {
    const [className] = args;
    return `
      <div class="${className}">
        ${input}
      </div>
    `
  }

  // export function in special way
  MACROS = {addClass}
:::
```
Macros usage:

```
[addClass myClass]:::

Normal $\nabla$nabladowns`.js`

:::
```
Arguments are differentiated through the `space` character unless they have `"` quotes:

```js
:::
 function id(input, args) {
  const [name] = args;
  return `<div id="${name}">${input}</div>`;
 }

 MACROS={id}
:::

[id "hello world"]:::
 *Hello world!!!*
:::

```

A general usage of macros would be:

```
[alreadyDefinedMacroFunction arg1 arg2 ... argN]:::

A nabladown.js string

:::
```

It should be possible to import macros:

```
:::
import "./path2macros.js";
import "./src/macros.js";
:::

```
That is the only way to import files, for now. The file with defining macros should be something like this:
```
// macros.js

function macro1(input, args) {
 ... 
}

...

function macroN(input, args) {
  ...
}

MACROS = {macro1, ..., macroN}

```

### Creating details section using a macro

```js
:::

function details(input, args) {
  const [title] = args;
  return `
  <details>
    <summary>${title}</summary>
    ${input}
  </details>
  `
}

MACROS = {details}

:::
# A details example

[details "Factorial definition"]:::

$$
  n! = \begin{cases} 
		1 & \text{if } n = 0, \\
		n \times (n-1)! & \text{if } n > 0.
 	  \end{cases}
$$
:::

```


# Try it

You can try `nabladown.js` language in two ways:
  - Using [playground](https://pedroth.github.io/nabladown.js/)
  - Using the [nabladown-server](https://github.com/pedroth/nabladown-server)

# Advanced

## Library exports

This library exports:

- Parser.js
- Render.js (vanilla render)
- MathRender.js (vanilla + math)
- CodeRender.js (vanilla + code)
- NablaRender.js (vanilla + math + code)

### Web import

```js
import {parse} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/Parser.js"
import {render as vanillaRender, Render} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/Render.js"
import {render as mathRender, Render as MathRender} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/MathRender.js"
import {render as codeRender, Render as CodeRender} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/CodeRender/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/NabladownRender.js"
```

> You can also import a particular version of `nabladown.js` from [jsdelivr](https://www.jsdelivr.com/)


You can also point to local `nabladown.js`

```js
import {parse} from "<LOCAL_NABLADOWN.JS>/dist/web/Parser.js"
import {render as vanillaRender, Render} from "<LOCAL_NABLADOWN.JS>/dist/web/Render.js"
import {render as mathRender, Render as MathRender} from "<LOCAL_NABLADOWN.JS>/dist/web/MathRender.js"
import {render as codeRender, Render as CodeRender} from "<LOCAL_NABLADOWN.JS>/dist/web/CodeRender/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "<LOCAL_NABLADOWN.JS>/dist/web/NabladownRender.js"
```

### Node / Bun

```js
import {parse} from "nabladown.js/dist/node/Parser.js"
import {render as vanillaRender, Render} from "nabladown.js/dist/node/Render.js"
import {render as mathRender, Render as MathRender} from "nabladown.js/dist/node/MathRender.js"
import {render as codeRender, Render as CodeRender} from "nabladown.js/dist/node/CodeRender/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "nabladown.js/dist/node/NabladownRender.js"
```


## Using all renders
```html
<html>

<body></body>
<script type="module">
    import { parse } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/Parser.js"
    import { render as vanillaRender } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/Render.js"
    import { render as mathRender } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/MathRender.js"
    import { render as codeRender } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/CodeRender/CodeRender.js"
    import { render as nablaRender } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/NabladownRender.js"

    (async () => {
        // append basic rendering
        await vanillaRender(parse("# $\\nabla$ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
        // append code rendering
        await codeRender(parse("# $\\nabla$ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
        // append math rendering
        await mathRender(parse("# $\\nabla$ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
        // append nabladown rendering
        await nablaRender(parse("# $\\nabla$ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
    })()
</script>

</html>
```

## Extending basic renderer

It is possible to extend the basic renderer, to build a custom one. There are a few ways of doing this:

- Adding style to HTML components using regular CSS.
- Extending `Render class` from [Render.js](/src/Render.js)

The [CodeRender class](/src/CodeRender/CodeRender.js) is an example of extending the `Render class`, where code highlight was implemented.

The [MathRender class](/src/MathRender.js) is an example of extending the `Render class`, where [katex](https://katex.org/) rendering was added.

You can also combine multiple renderers together using `composeRender` function. Check [NabladownRender class](/src/NabladownRender.js) for an example of that.

## Changing CSS

```html
<html>
  <head>
    <style>
      body {
        background-color: #212121;
        color: white;
        font-family: sans-serif;
      }

      body h1 {
        text-decoration: underline;
        background-color: blue;
      }

      body code {
        border-style: solid;
        border-width: thin;
        border-radius: 6px;
        box-sizing: border-box;
        background-color: red;
        border: hidden;
        font-size: 85%;
        padding: 0.2em 0.4em;
        color: green;
      }
    </style>
  </head>
  <body></body>
  <script type="module">
    import {parse, render} from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/index.js"
    render(parse("# $ \\nabla $ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
  </script>
</html>
```

## Extending NabladownRender class

### Change headers color based on their level 

```html
<html>

<body></body>
<script type="module">
    import { parse } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/index.js"
    import { Render } from "https://cdn.jsdelivr.net/npm/nabladown.js/dist/web/NabladownRender.js";
    class CustomRender extends Render {
        /**
         * (title, context) => DomBuilder
         */
        renderTitle(title, context) {
            const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
            const { level } = title;
            const header = super.renderTitle(title, context);
            header.attr("style", `color:${colors[level - 1]}`);
            return header;
        }
    }

    const render = syntaxTree => new CustomRender().render(syntaxTree);
    const text = `# $ \\nabla$Nabladown.js \n#### $ \\nabla$Nabladown.js \n#####$ \\nabla$Nabladown.js \n`;
    // append custom rendering
    render(parse(text)).then(dom => document.body.appendChild(dom));
</script>

</html>
```

> All render methods return a `DOM abstraction` object, described [here](/src/buildDom.js).

For more details, you need to dig the source code **:D**

# Develop Nabladown.js

## Dependencies

`nabladown.js` is using `bun@^1.0.3`, `nodejs@20.8.1` and `npm@10.1.0`

## Building library

`bun run build`

## Testing

Running unit tests: `bun test`.

Running playground `index.html`, just use `bun serve`.

# Influences / Inspiration

- [Markdown](https://www.markdownguide.org/)
- [Quarto](https://www.markdownguide.org/)
- [AsciiDoc](https://asciidoc.org/)
- [Orgmode](https://orgmode.org/)
- [MDX](https://mdxjs.com/)

# TODO

1. Optimize html generation
   - Remove unnecessary spans, divs, etc.
1. Optimize fetching styles 
1. Add paragraphs to lists as [here](https://www.markdownguide.org/basic-syntax/#paragraphs) and footnotes
2. Add inline attributes to links, equations, custom... as [Quatro](https://quarto.org/docs/authoring/markdown-basics.html#divs-and-spans) and [this](https://www.markdownguide.org/extended-syntax/#heading-ids) or [this](https://youtu.be/wjGPVFF1oHw?si=Om1HQH6GDpkRruIt&t=374)
2. Add easy tables, check [AsciiDoc tables](https://docs.asciidoctor.org/asciidoc/latest/tables/build-a-basic-table/) and [Orgmode tables](https://orgmode.org/manual/Built_002din-Table-Editor.html)
2. Think about escaping characters, like `, <, *, >, _ 
1. Optimize Playground
	 - [x] Loading screen
	 - [ ] Render by chunks
   - [x] Show token info in playground
2. Total compatibility between nodejs and browser rendering.
	- Copy button doesn't work when generating html as string
2. Add dialog in images (expanding images in cell phone) - Check [photoswipe](https://photoswipe.com/), [glightbox](https://biati-digital.github.io/glightbox/)
3. Use local [katex](https://katex.org/) style instead of online one 
3. Multiple styles in code rendering
2. Add metadata space such [Quatro](https://quarto.org/docs/output-formats/html-basics.html#overview)
2. Change some recursions to linear recursions or just loops (?)
	 - Apply parseAnyBut loop to parseDocument, parseExpressions, ... 
