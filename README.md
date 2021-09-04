# Nabladown.js

A parser and renderer for the `Nabladown` language.

NablaDown.js is a `JS` library able to `parse(String -> Abstract Tree)` a pseudo/flavored **Markdown** language and `render(Abstract Tree -> HTML)` it into `HTML`.

The purpose of this library is to render beautiful documents in `HTML`, using a simple language as **Markdown**, with the focus of rendering `code` and `equations`.

The library is written in a way, that is possible to create and compose multiple renderers together. This way is possible to add feature on top of a basic renderer. More on that below.

# Contents

1. [Language cheat sheet](#language-cheat-sheet)
2. [Import](#import)
3. [Usage](#usage)
4. [Extending basic renderer](#extending-basic-renderer)
5. [Building yourself](#building-yourself)
6. [TODO](#todo)

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

## Lists

```
- Parent
  - Child
    - GrandChild
    - GrandChild
  - Child

// or

* Parent
  * Child
    * GrandChild
    * GrandChild
  * Child

```

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

When embedding youtube videos, it uses the private option in [`youtube-nocookie.com`](https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode).

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

This library exports:

- Parser.js
- Render.js (vanilla render)
- MathRender.js (vanilla + math)
- CodeRender.js (vanilla + code)
- NablaRender.js (vanilla + math + code)

And you can import these via:

## Via [HTML](https://jsfiddle.net/0omfnyz2/11/)

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/MathRender.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/CodeRender.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/NabladownRender.js"></script>
  </head>
  <body style="color:black"></body>
  <script>
    const { parse } = Parser;
    const { render } = Render;
    const { render: mathRender } = MathRender;
    const { render: codeRender } = CodeRender;
    const { render: customRender } = NabladownRender;
    // append basic rendering
    document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
    // append code rendering
    document.body.appendChild(
      codeRender(parse("# $ \\nabla $ Nabladown`.js` \n"))
    );
    // append math rendering
    document.body.appendChild(
      mathRender(parse("# $ \\nabla $ Nabladown`.js` \n"))
    );
    // append nabladown rendering
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
import { render as codeRender } from "nabladown.js/dist/CodeRender"
import { render as mathRender } from "nabladown.js/dist/MathRender"
import { render as nabladownRender } from "nabladown.js/dist/NabladownRender"
```

## Via npm to node [unstable]

```javascript
 npm i --save pedroth/nabladown.js

// index.js
const { parse } = require("nabladown.js/dist/Parser.node")
const { render } = require("nabladown.js/dist/Render.node")
const { render: nabladownRender } = require("nabladown.js/dist/NabladownRender.node")
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

document.body.appendChild(render(parse("#$\\nabla$Nabladown\`.js\`\n"))
```

## Usage with HTML

Check [this jsfiddle](https://jsfiddle.net/0omfnyz2/11/) code snippet.
Or simply check out [index.js](https://github.com/pedroth/nabladown.js/blob/main/index.js) of nabladown.js webpage.

# Extending basic renderer

It is possible to extend the basic renderer, to build a custom one. There are a few ways of doing this:

- Adding style to HTML components using regular CSS.
- Extending BaseRender class from [Render.js](https://github.com/pedroth/nabladown.js/blob/main/src/Render.js)

The [CodeRender class](https://github.com/pedroth/nabladown.js/blob/main/src/CodeRender.js) is an example of extending the BaseRender, where code highlight was implemented.

You can also combine multiple renderers together using `composeRender` function. Check[NabladownRender class](https://github.com/pedroth/nabladown.js/blob/main/src/NabladownRender.js) for an example of that.

## Changing CSS

```html
<html>
	<head>
  <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
  <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
  <script src="https://pedroth.github.io/nabladown.js/dist/NabladownRender.js"></script>
    <style>
      body {
        background-color: #212121;
        color: white
      }
      
      body h1 {
        text-decoration: underline
      }
      
      body code {
        border-style: solid;
        border-width: thin;
        border-radius: 6px;
        box-sizing: border-box;
        background-color: #000000;
        border: hidden;
        font-size: 85%;
        padding: .2em .4em; color: orange;
      }
    </style>
	</head>
	<body>
	</body>
	<script>
		const { parse } = Parser;
		const { render } = NabladownRender;
    // append basic rendering
		document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
	</script>
  </html>
```

Code snippet [here](https://jsfiddle.net/max0q15y/1/)

## Extending NabladownRender class

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
    // append custom rendering
    document.body.appendChild(render(parse(text)));
  </script>
</html>
```

Code snippet [here](https://jsfiddle.net/ebsvk75a/). For more details, you need to dig the source code :D

# Building yourself

Clone or fork repo, then run:

- `npm ci`
- `npm run build`

# TODO

## References

```javascript
# Formula {#myTitle}

$$1+1 = 2$$ {#eq1}

Goto [equation 1](#eq1)

Goto [Title](#myTitle)
```

## Custom Block

```
::: theorem

lorem *ipsum* $\dot x = \nabla V $!

:::

// generates div with class=theorem
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
