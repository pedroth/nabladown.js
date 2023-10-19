# Nabladown.js 

A parser and renderer for the `Nabladown` language.

NablaDown.js is a `JS` library able to `parse: String -> Abstract Syntax Tree` a pseudo/flavored **Markdown** language and `render: Abstract Syntax Tree -> HTML` it into `HTML`.

The purpose of this library is to render beautiful documents in `HTML`, using a simple language as **Markdown**, with the focus of rendering `code`,`equations`,`html` and `custom behavior`.

The library is written in a way, that is possible to create and compose multiple renderers together. This way is possible to add features on top of a basic renderer. More on that below.

# Contents

1. [QuickStart](#quick-start)
2. [Language cheat sheet](#language-cheat-sheet)
3. [Advanced](#advanced)
4. [Develop nabladown.js](#develop-nabladown.js) 
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
    import { parse, render } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/index.js";

    // You can also import from local file
    // import { parse, render } from "./node_modules/nabladown.js/dist/web/index.js";

    const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";

    render(parse(content)).then(dom => document.body.appendChild(dom));
</script>
</html>
```

## Web React 

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

## Node / Bun

Install it using `npm install nabladown.js` / `bun add nabladown.js`

```js
import { parse, renderToString } from "nabladown.js/dist/node/index.js";

(async () => {
    const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";
    const domStr = await renderToString(parse(content))
    console.log(domStr);
})();
```

With formatted string:
```js
import { parse, renderToString } from "nabladown.js/dist/node/index.js";

(async () => {
    const content = "#$\\nabla$ Nabladown`.js`\n <span style='background: blue'>Check it out</span> [here](https://www.github.com/pedroth/nabladown.js)\n";
    const domStr = await renderToString(parse(content), {isFormated: true})
    console.log(domStr);
})();
```


# Language cheat sheet

This language follows the basic [markdown syntax](https://www.markdownguide.org/cheat-sheet/) but adds some extras like formulas, code, and HTML.

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

**bold**

**_bold and italics_**

_**italics and bold**_
```

## Paragraph

```js
lorem ipsum lorem ipsum // paragraph

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum lorem ipsum lorem ipsum // paragraph

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

> Lists children indentation is done with a single space only (for now, at least).

> For now, nabladown is not able to write paragraphs in lists. Like [here](https://www.markdownguide.org/basic-syntax/#paragraphs).


## Links

```js
// simple link
[nabladown.js](https://pedroth.github.io/nabladown.js/)

// link using reference
[brave][ref]

Some optional text...

[ref]: https://search.brave.com/
```

It is also possible to link to headers

```markdown
# A Title

[Go to title](#a-title)
```

## Footnotes

```js
Some optional text [^1]
blablabla [^foot] blablabla

...

[^1]: Text with **nabladown** syntax
[^foot]: You can use any identifier
```

> For now, it's not possible to add paragraphs in footnotes, like [here](https://www.markdownguide.org/extended-syntax/#footnotes)

## Images/Videos

```js
// simple image
![Image legend](https://picsum.photos/200)

// image with title
![Image _legend_  with $\nabla$](https://picsum.photos/200)

// Image with link to it
[![Image reference + **link** + reference][link_variable]][link_variable]

[link_variable]: some link to image

// youtube video with legend
![**Gradient** youtube video](https://www.youtube.com/watch?v=tIpKfDc295M)

// video
![Free **video**](https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4)

// sound
![Free _sound_](https://www.bensound.com/bensound-music/bensound-ukulele.mp3)
```

When embedding youtube videos, it uses the private option in [`youtube-nocookie.com`](https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode).

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

## HTML

```html
# Normal markdown with <span style="color: red"> red text </span> inline

A paragraph with html and nabladown inside:
<div>
<a href="https://pedroth.github.io/nabladown.js">
    $1 + 1 = 2$
</a>
<button onClick="alert('hello world')">
  hello **world**
</button>
</div>
```

## Custom

```

<style>
.quote {
  background: #f9f9f90d;
  border-left: 10px solid #ccc;
  margin: 1.5em 10px;
  padding: 1em 10px .1em;
}
</style>

[quote]:::

lorem **ipsum** $\dot x = -\nabla V $!

:::


// generates div with class=quote while rendering nabladown inside
```

Plugins could be added here in a custom render, check [custom render](#creating-quote-and-dialog-using-custom) section.

## Line Separation

```js
lorem ipsum 

---

lorem ipsum

```

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
import {parse} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/Parser.js"
import {render as vanillaRender, Render} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/Render.js"
import {render as mathRender, Render as MathRender} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/MathRender.js"
import {render as codeRender, Render as CodeRender} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/NabladownRender.js"
```
You can also point to local nabladown.js

```js
import {parse} from "<LOCAL_NABLADOWN.JS>/dist/web/Parser.js"
import {render as vanillaRender, Render} from "<LOCAL_NABLADOWN.JS>/dist/web/Render.js"
import {render as mathRender, Render as MathRender} from "<LOCAL_NABLADOWN.JS>/dist/web/MathRender.js"
import {render as codeRender, Render as CodeRender} from "<LOCAL_NABLADOWN.JS>/dist/web/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "<LOCAL_NABLADOWN.JS>/dist/web/NabladownRender.js"
```

### Node / Bun

```js
import {parse} from "node_modules/nabladown.js/dist/node/Parser.js"
import {render as vanillaRender, Render} from "node_modules/nabladown.js/dist/node/Render.js"
import {render as mathRender, Render as MathRender} from "node_modules/nabladown.js/dist/node/MathRender.js"
import {render as codeRender, Render as CodeRender} from "node_modules/nabladown.js/dist/node/CodeRender.js"
import {render as codeRender, Render as NablaRender} from "node_modules/nabladown.js/dist/node/NabladownRender.js"
```


## Using all renders
```html
<html>

<body></body>
<script type="module">
    import { parse } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/Parser.js"
    import { render as vanillaRender } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/Render.js"
    import { render as mathRender } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/MathRender.js"
    import { render as codeRender } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/CodeRender/CodeRender.js"
    import { render as nablaRender } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/NabladownRender.js"

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

The [MathRender class](/src/MathRender.js) is an example of extending the `Render class`, where katex rendering was added.

You can also combine multiple renderers together using `composeRender` function. Check[NabladownRender class](/src/NabladownRender.js) for an example of that.

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
    import {parse, render} from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/index.js"
    render(parse("# $ \\nabla $ Nabladown`.js` \n")).then(dom => document.body.appendChild(dom));
  </script>
</html>
```

## Extending NabladownRender class

Let's change color of the header elements based on their level:

```html
<html>

<body></body>
<script type="module">
    import { parse } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/index.js"
    import { Render } from "https://cdn.jsdelivr.net/npm/nabladown.js@<VERSION>/dist/web/NabladownRender.js";
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

> All render methods return a `DomBuilder` object, described [here](/src/DomBuilder.js)

For more details, you need to dig the source code :D

## Creating quote and dialog using custom


# Develop Nabladown.js

## Dependencies

`nabladown.js` is using `bun@^1.0.3`, `nodejs@20.8.1` and `npm@10.1.0`

## Building library

`bun run build`

## Testing

Running unit tests: `bun test`.

Running playground `index.html`, using live server or `bun serve`.

# TODO

1. Optimize html generation
 - Remove unnecessary spans, divs, etc.
1. Optimize parse to use success/fail/either monad instead of exceptions(or function)
2. Total compatibility between nodejs and browser rendering.
 . Copy button doesn't work when generating html as string
2. Change some recursions to linear recursions or just loops
 - Apply parseAnyBut loop to parseDocument, parseExpressions, ... 
2. Add dialog in images (expanding images in cell phone)
2. Add images with custom sizes (?)
3. Add multi-line paragraps in lists and footnotes
2. Show token info in playground
3. Use local katex style instead of online one 
3. Add multiple types of indentations in lists
3. Add `quotes >` to be compatible with Markdown (low priority)
3. Multiple styles in code rendering 