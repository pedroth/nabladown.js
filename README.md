# NablaDown.js

A parser and renderer for the nabladown.js language.

It is a Js library able to `parse(String -> Abstract Tree)` a pseudo/flavoured markdown language and `render(Abstract Tree -> HTML)` it into HTML.
One should be able to use the [output/abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the parser with different renders.

# Contents

1. [Language cheat sheet](#language-cheat-sheet)
2. [Import](#import)
3. [Usage](#usage)
4. [Extending basic renderer](#extending-basic-renderer)
5. [TODO](#todo)

# Language cheat sheet

This language follows the basic [markdown syntax](https://www.markdownguide.org/cheat-sheet/) but adds some extras like formulas, code, and HTML.

## Headers

```javascript
# H1
## H2
### H3
```

## Style

```javascript

*italics*

**bold**
```

## Paragraph

```javascript
lorem ipsum lorem ipsum

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum lorem ipsum lorem ipsum

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum. lorem ipsum lorem ipsum
lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum.
```

## Math

```javascript
// inline
Lorem ipsum $1+1 = 2$
// paragraph
$$1+1 = 2$$
```

## Code

### Inline code

```
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

Syntax [here](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks).
Name of the available languages according to [highlight.js](https://highlightjs.org/)

## Links

```javascript
[google](https://www.google.com)
```

## Images/Videos

```javascript
![**Nabla** image](https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Del.svg/220px-Del.svg.png)
![**Gradient** youtube video](https://www.youtube.com/watch?v=tIpKfDc295M)
![Free **video**](https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4)
![Free *sound*](https://www.bensound.com/bensound-music/bensound-ukulele.mp3)
```

## HTML

```javascript
+++
<html>
<a href="https://">blabla</a>
</html>
+++

// also works inline
+++ <button onClick="alert('hello world')"> hello </button> +++ world!!
```

# Import

The main dependencies are:

- Parser.js
- Render.js (includes basic renderer, no styles are added)
- PRender.js (includes renderer with code highlight)

## Via [HTML](https://jsfiddle.net/wo3fb6hd/1/)

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/PRender.js"></script>
    <!-- katex style -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css"
      integrity="sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV"
      crossorigin="anonymous"
    />
  </head>
  <body style="color:black"></body>
  <script>
    const { parse } = Parser;
    const { render } = Render;
    const { render: customRender } = PRender;
    // append basic rendering
    document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
    // append custom rendering
    document.body.appendChild(
      customRender(parse("# $\\nabla$ Nabladown`.js` \n"))
    );
  </script>
</html>
```

## Using Bundlers(Webpack, ...)

```javascript
 npm i --save pedroth/nabladown.js

 // index.js
import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"
import { render as codeHLRender } from "nabladown.js/dist/PRender"
```

## Via npm to node [instable]

```javascript
 npm i --save pedroth/nabladown.js

// index.js
const { parse } = require("nabladown.js/dist/Parser.node")
const { render } = require("nabladown.js/dist/Render.node")
const { render: codeHLRender } = require("nabladown.js/dist/Render.node")
```

# Usage

Nabladown.js provides two functions:

- `parse: String -> Tree`
- `render: Tree -> HTML`

The `parser` will produce a parsing tree (aka JSON object) from a string, and `render` will create HTML nodes from a parsing tree.

## Usage with Bundlers

```javascript
import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"

document.body.appendChild(render(parse(`
# Text document
  * title
    * subtitle
    * subtitle
      * sub subtitle

> Some Math
 $$f(w) = \\oint_\\gamma \\frac{f(z)}{z-w} dz$$

This is the end!!
`))
```

## Usage with HTML

Check [this jsfiddle](https://jsfiddle.net/wo3fb6hd/1/) code snippet.
Or simply checkout [index.js](https://github.com/pedroth/nabladown.js/blob/main/index.js) of nabladown.js webpage.

# Extending basic renderer

It is possible to extend the basic renderer, to build a custom one. There are a few ways of doing this:

- Adding style to HTML components using regular CSS.
- Extending BaseRender class from [Render.js](https://github.com/pedroth/nabladown.js/blob/main/src/Render.js)

The [PRender class](https://github.com/pedroth/nabladown.js/blob/main/src/PRender.js) is an example of extending the BaseRender, where code highlight was implemented.

## Changing CSS

```html
<html>
  <head>
    <!-- ... -->
    <style>
      body {
        background-color: #212121;
        color: white;
      }

      body h1 {
        text-decoration: underline;
      }

      body code {
        border-style: solid;
        border-width: thin;
        border-radius: 6px;
        box-sizing: border-box;
        background-color: #000000;
        border: hidden;
        font-size: 85%;
        padding: 0.2em 0.4em;
        color: orange;
      }
    </style>
  </head>
  <body></body>
  <script>
    const { parse } = Parser;
    const { render } = Render;
    // append basic rendering
    document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
  </script>
</html>
```

Code snippet [here](https://jsfiddle.net/wo3fb6hd/3/)

## Extending BaseRender class

Let's change color of the header elements based on their level:

```html
<html>
  <head>
    <!-- ... -->
  </head>
  <body></body>
  <script>
    const { parse } = Parser;
    const { BaseRender } = Render;
    class CustomRender extends BaseRender {
      renderTitle(title) {
        const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
        const { level } = title;
        const header = super.renderTitle(title);
        header.setAttribute("style", `color:${colors[level - 1]}`);
        return header;
      }
    }
    const render = syntaxTree => new CustomRender().render(syntaxTree);
    const text = `# $ \\nabla$Nabladown.js \n#### $ \\nabla$Nabladown.js \n#####$ \\nabla$Nabladown.js \n`;
    // append basic rendering
    document.body.appendChild(render(parse(text)));
  </script>
</html>
```

Code snippet [here](https://jsfiddle.net/wo3fb6hd/4/). For more details, you need to dig the source code :D

# TODO

## Lists

```
- Parent
  - Child
    - GrandChild
    - GrandChild
  - Child

```

## References

```javascript
# Formula {#myTitle}

$$1+1 = 2$$ {#eq1}

Goto [equation 1](#eq1)

Goto [Title](#myTitle)
```

## Styled Block

```
{"background-color": "red"}>>
red background lorem ipsum
>>
```

```
// inline
{"background-color": "red"}>> red background lorem ipsum >> lorem ipsum!!
```

## Quote

```javascript
> # lorem ipsum
> $$ 1 + 1 =2 $$
>
>> quote inside a quote!!
```

## Collapse

```
<>
collapse background lorem ipsum
<>
```
